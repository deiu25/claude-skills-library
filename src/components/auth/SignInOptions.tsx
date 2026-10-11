import { Suspense } from "react";
import { githubCredentials } from "@/lib/auth/github";
import { GitHubSignInButton } from "./GitHubSignInButton";
import { OAuthError } from "./OAuthError";
import { PasskeySignInButton } from "./PasskeySignInButton";

/**
 * The ways in above the email form: GitHub, read at build time so a deployment without the OAuth
 * app (every preview) renders no button, and a passkey where the page asks for one.
 */
export function SignInOptions({ passkey = false }: { passkey?: boolean }) {
  const github = githubCredentials() !== null;
  if (!github && !passkey) return null;
  return (
    <div className="mb-6 space-y-6">
      {/* Reads ?error=, so it renders in the browser; the buttons stay in the prerendered HTML. */}
      <Suspense fallback={null}>
        <OAuthError />
      </Suspense>
      <div className="space-y-3">
        {github && <GitHubSignInButton />}
        {passkey && <PasskeySignInButton />}
      </div>
      <div className="flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" />
        or with email
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
