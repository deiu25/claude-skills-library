import { Suspense } from "react";
import { githubCredentials } from "@/lib/auth/github";
import { GitHubSignInButton } from "./GitHubSignInButton";
import { OAuthError } from "./OAuthError";

/**
 * "Continue with GitHub" above the email form. Read at build time, so a deployment without
 * the OAuth app (every preview) renders no button.
 */
export function GitHubSignIn() {
  if (!githubCredentials()) return null;
  return (
    <div className="mb-6 space-y-6">
      {/* Reads ?error=, so it renders in the browser; the button stays in the prerendered HTML. */}
      <Suspense fallback={null}>
        <OAuthError />
      </Suspense>
      <GitHubSignInButton />
      <div className="flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" />
        or with email
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
