"use client";

import { useSearchParams } from "next/navigation";
import { oauthErrorMessage } from "@/lib/auth/errors";
import { FormMessage } from "./FormMessage";

/** Explains a failed GitHub sign-in, which Better Auth sends back as /sign-in?error=<code>. */
export function OAuthError() {
  const code = useSearchParams().get("error");
  if (code === null) return null;
  return <FormMessage tone="error">{oauthErrorMessage(code)}</FormMessage>;
}
