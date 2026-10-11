/**
 * Settles no sooner than `ms` after the call, so the caller cannot tell how long `work` took.
 * A failure waits out the floor too, before it is rethrown.
 */
export async function atLeast<T>(ms: number, work: Promise<T>): Promise<T> {
  const floor = new Promise((resolve) => setTimeout(resolve, ms));
  try {
    return await work;
  } finally {
    await floor;
  }
}
