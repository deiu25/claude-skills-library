import { useState } from "react";
import { authErrorMessage, OFFLINE_MESSAGE, type AuthError } from "./errors";

type Result<T> = { data: T | null; error: AuthError | null };

/**
 * One Better Auth client call at a time, for the settings forms: the pending flag, and the message
 * a failure shows. `run` resolves to the call's data, or null after a failure.
 */
export function useAuthAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(call: () => Promise<Result<T>>): Promise<T | null> {
    setPending(true);
    setError(null);
    try {
      const { data, error } = await call();
      if (error) {
        setError(authErrorMessage(error));
        return null;
      }
      return data;
    } catch {
      setError(OFFLINE_MESSAGE);
      return null;
    } finally {
      setPending(false);
    }
  }

  return { pending, error, setError, run };
}
