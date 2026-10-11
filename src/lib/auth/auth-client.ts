import { createAuthClient } from "better-auth/react";

/** Same-origin client: its requests go through /api/auth, where Better Auth's rate limit applies. */
export const authClient = createAuthClient();
