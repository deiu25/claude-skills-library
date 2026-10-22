import { unstable_rethrow } from "next/navigation";
import { OFFLINE_MESSAGE } from "@/lib/auth/errors";
import type { SkillActionState } from "./actions";

/**
 * Wraps a Server Action so a failed request answers with a message instead of throwing to the
 * error page, which would discard the editor and its unsaved text. Redirects still go through.
 */
export function keepDraftOnFailure<Args extends unknown[]>(action: (...args: Args) => Promise<SkillActionState>) {
  return async (...args: Args): Promise<SkillActionState> => {
    try {
      return await action(...args);
    } catch (error) {
      unstable_rethrow(error);
      return { ok: false, error: OFFLINE_MESSAGE };
    }
  };
}
