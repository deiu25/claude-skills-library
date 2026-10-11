"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Field } from "@/components/auth/Field";
import { FormMessage } from "@/components/auth/FormMessage";
import { authClient } from "@/lib/auth/auth-client";
import { useAuthAction } from "@/lib/auth/useAuthAction";
import { BackupCodes } from "./BackupCodes";
import { QrCode } from "./QrCode";

interface TwoFactorSettingsProps {
  enabled: boolean;
  hasPassword: boolean;
}

type Stage =
  | { name: "idle" }
  | { name: "scan"; totpURI: string; backupCodes: string[] }
  | { name: "codes"; backupCodes: string[]; justEnabled: boolean };

const BUTTON = "btn btn-ghost text-sm disabled:cursor-wait disabled:opacity-60";

export function TwoFactorSettings({ enabled, hasPassword }: TwoFactorSettingsProps) {
  const router = useRouter();
  const { pending, error, setError, run } = useAuthAction();
  const [stage, setStage] = useState<Stage>({ name: "idle" });
  const [intent, setIntent] = useState<"codes" | "off" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  // Each view replaces the buttons focus was on, so focus follows to the new one; never on load.
  const view = `${stage.name}:${enabled}`;
  const shownView = useRef(view);
  useEffect(() => {
    if (shownView.current === view) return;
    shownView.current = view;
    viewRef.current?.focus();
  }, [view]);

  // Every change asks for the password when the account has one; an account without one needs none.
  const passwordOf = (form: HTMLFormElement) =>
    hasPassword ? String(new FormData(form).get("twoFactorPassword")) : undefined;

  async function turnOn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = passwordOf(event.currentTarget);
    const data = await run(() => authClient.twoFactor.enable({ password }));
    if (data?.method === "totp") setStage({ name: "scan", totpURI: data.totpURI, backupCodes: data.backupCodes });
  }

  async function confirmCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stage.name !== "scan") return;
    const code = String(new FormData(event.currentTarget).get("totpCode")).replace(/\s/g, "");
    const data = await run(() => authClient.twoFactor.verifyTotp({ code }));
    if (data) setStage({ name: "codes", backupCodes: stage.backupCodes, justEnabled: true });
  }

  // Each button runs its own change. The form's own submit does nothing, so Enter in the password
  // field never makes new backup codes by accident.
  async function manage(chosen: "codes" | "off") {
    const form = formRef.current;
    if (!form?.reportValidity()) return;
    const password = passwordOf(form);
    setIntent(chosen);
    if (chosen === "off") {
      if (await run(() => authClient.twoFactor.disable({ password }))) router.refresh();
      return;
    }
    const data = await run(() => authClient.twoFactor.generateBackupCodes({ password }));
    if (data) setStage({ name: "codes", backupCodes: data.backupCodes, justEnabled: false });
  }

  // Two-factor stays off until a code is confirmed, so leaving the scan step changes nothing.
  function cancel() {
    setError(null);
    setStage({ name: "idle" });
  }

  function finish() {
    setStage({ name: "idle" });
    router.refresh();
  }

  if (stage.name === "scan") {
    const secret = new URL(stage.totpURI).searchParams.get("secret") ?? "";
    return (
      <div ref={viewRef} tabIndex={-1} className="outline-none">
        <ol className="space-y-6">
          <li className="space-y-3">
            <p className="text-sm font-medium text-foreground">Scan this code with your authenticator app</p>
            <QrCode text={stage.totpURI} label="QR code that adds this account to an authenticator app" />
            <p className="text-sm text-muted">No camera? Enter this key instead:</p>
            <div className="flex items-center gap-3">
              {/* Groups of four never break apart, so the key is typed as it reads. */}
              <p className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-[0.8125rem] text-foreground">
                {secret.match(/.{1,4}/g)?.map((group, index) => (
                  <span key={index}>{group}</span>
                ))}
              </p>
              <CopyButton text={secret} label="Copy the key" />
            </div>
          </li>
          <li>
            <form onSubmit={confirmCode} className="space-y-5">
              <Field
                label="Code from the app"
                name="totpCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]{6,7}"
                maxLength={7}
                required
                className="input-base font-mono"
                hint="The 6 digits it shows now. They change every 30 seconds."
              />
              {error && <FormMessage tone="error">{error}</FormMessage>}
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={pending} className="btn btn-primary text-sm disabled:cursor-wait disabled:opacity-60">
                  {pending ? "Checking…" : "Turn on two-factor"}
                </button>
                <button type="button" onClick={cancel} disabled={pending} className={BUTTON}>
                  Cancel
                </button>
              </div>
            </form>
          </li>
        </ol>
      </div>
    );
  }

  if (stage.name === "codes") {
    return (
      <div ref={viewRef} tabIndex={-1} className="outline-none">
        <BackupCodes codes={stage.backupCodes} justEnabled={stage.justEnabled} onDone={finish} />
      </div>
    );
  }

  const status = (
    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
      {enabled && <CheckCircle size={18} className="text-accent" aria-hidden />}
      {enabled ? "On" : "Off"}
    </p>
  );
  const passwordField = hasPassword && (
    <Field label="Password" name="twoFactorPassword" type="password" autoComplete="current-password" required />
  );

  return (
    <div ref={viewRef} tabIndex={-1} className="outline-none">
      {enabled ? (
        <form key="on" ref={formRef} onSubmit={(event) => event.preventDefault()} className="space-y-5">
          <div className="space-y-1">
            {status}
            <p className="text-sm leading-relaxed text-muted">New backup codes replace the ones you have.</p>
          </div>
          {passwordField}
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => manage("codes")} disabled={pending} className={BUTTON}>
              {pending && intent === "codes" ? "Generating…" : "New backup codes"}
            </button>
            <button type="button" onClick={() => manage("off")} disabled={pending} className={BUTTON}>
              {pending && intent === "off" ? "Turning off…" : "Turn off"}
            </button>
          </div>
        </form>
      ) : (
        <form key="off" onSubmit={turnOn} className="space-y-5">
          <div className="space-y-1">
            {status}
            {!hasPassword && (
              <p className="text-sm leading-relaxed text-muted">
                You sign in without a password, so it starts protecting you once you add one.
              </p>
            )}
          </div>
          {passwordField}
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <button type="submit" disabled={pending} className={BUTTON}>
            {pending ? "Starting…" : "Set up two-factor"}
          </button>
        </form>
      )}
    </div>
  );
}
