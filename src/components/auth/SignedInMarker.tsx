"use client";

import { useEffect } from "react";
import { markSignedIn } from "@/lib/auth/signed-in-flag";

/** Rendered only for a signed-in user: it tells the header to load the account menu from now on. */
export function SignedInMarker() {
  useEffect(markSignedIn, []);
  return null;
}
