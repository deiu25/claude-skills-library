import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, twoFactorClient, usernameClient } from "better-auth/client/plugins";

/** Same-origin client: its requests go through /api/auth, where Better Auth's rate limit applies. */
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({ user: { bio: { type: "string", required: false } } }),
    usernameClient(),
    // A password sign-in that needs a second factor answers with this redirect instead of a session.
    twoFactorClient({ twoFactorPage: "/two-factor" }),
    passkeyClient(),
  ],
});
