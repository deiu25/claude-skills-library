import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { describeDevice } from "@/lib/auth/device";
import { oauthErrorMessage } from "@/lib/auth/errors";
import { githubCredentials } from "@/lib/auth/github";
import { getActiveSessions, getPasskeys, getSignInMethods } from "@/lib/auth/queries";
import { formatRelativeDate } from "@/lib/github";
import { DeleteAccount } from "./DeleteAccount";
import { EmailForm } from "./EmailForm";
import { GitHubConnection } from "./GitHubConnection";
import { PasskeyList } from "./PasskeyList";
import { PasswordSettings } from "./PasswordSettings";
import { ProfileForm } from "./ProfileForm";
import { SessionList } from "./SessionList";
import { SettingsSection } from "./SettingsSection";
import { TwoFactorSettings } from "./TwoFactorSettings";

interface AccountSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    username?: string | null;
    bio?: string | null;
    twoFactorEnabled?: boolean | null;
  };
  currentSessionId: string;
  /** The ?error= code a failed GitHub connection came back with, if any. */
  githubError: string | null;
}

const ago = (date: Date | null) => (date ? formatRelativeDate(date.toISOString()) : "at an unknown time");

/** Every settings group, with the rows each one shows. Dates are worded here, on the server. */
export async function AccountSettings({ user, currentSessionId, githubError }: AccountSettingsProps) {
  const [methods, sessions, passkeys] = await Promise.all([
    getSignInMethods(user.id),
    getActiveSessions(user.id),
    getPasskeys(user.id),
  ]);

  return (
    <div className="mt-10 divide-y divide-line border-t border-line">
      <SettingsSection id="profile" title="Profile" description="Your name, your handle and a line about you.">
        <ProfileForm name={user.name} username={user.username ?? null} bio={user.bio ?? null} />
      </SettingsSection>
      <SettingsSection
        id="email"
        title="Email"
        description="Where account emails go. A change needs a yes from your current address first."
      >
        <EmailForm email={user.email} />
      </SettingsSection>
      <SettingsSection
        id="password"
        title="Password"
        description={methods.hasPassword ? "Sign in with your email and this password." : "Your account has no password."}
      >
        <PasswordSettings email={user.email} hasPassword={methods.hasPassword} />
      </SettingsSection>
      <SettingsSection
        id="two-factor"
        title="Two-factor authentication"
        description="After your password, a code from an authenticator app, so a stolen password is not enough."
      >
        <TwoFactorSettings enabled={Boolean(user.twoFactorEnabled)} hasPassword={methods.hasPassword} />
      </SettingsSection>
      <SettingsSection
        id="passkeys"
        title="Passkeys"
        description="Sign in with your fingerprint, face or device PIN. A passkey works only on this site’s address."
      >
        <PasskeyList
          passkeys={passkeys.map((passkey) => ({
            id: passkey.id,
            name: passkey.name,
            added: `added ${ago(passkey.createdAt)}`,
            backedUp: passkey.backedUp,
          }))}
        />
      </SettingsSection>
      <SettingsSection id="github" title="GitHub" description="Sign in with your GitHub account as well.">
        <GitHubConnection
          connection={methods.github && { accountId: methods.github.id, since: ago(methods.github.connectedAt) }}
          available={githubCredentials() !== null}
          hasPassword={methods.hasPassword}
          failure={githubError === null ? null : oauthErrorMessage(githubError)}
        />
      </SettingsSection>
      <SettingsSection
        id="sessions"
        title="Sessions"
        description="Browsers signed in to your account. Sign out any you do not recognise."
      >
        <SessionList
          sessions={sessions.map((session) => ({
            id: session.id,
            device: describeDevice(session.userAgent),
            ipAddress: session.ipAddress,
            lastActive: `active ${ago(session.lastActiveAt)}`,
            current: session.id === currentSessionId,
          }))}
        />
      </SettingsSection>
      <SettingsSection
        id="data"
        title="Your data"
        description="A copy of everything your account holds, as a JSON file. Secrets such as your password stay out."
      >
        <a href="/api/me/export" download className="btn btn-ghost text-sm">
          <DownloadSimple size={16} aria-hidden />
          Download your data
        </a>
      </SettingsSection>
      <SettingsSection
        id="delete"
        title="Delete account"
        description="Removes your account and everything it holds, for good. We email you a link to confirm first."
      >
        <DeleteAccount email={user.email} />
      </SettingsSection>
    </div>
  );
}
