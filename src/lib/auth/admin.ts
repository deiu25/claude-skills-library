/**
 * The accounts that moderate the site: the user ids in ADMIN_USER_IDS, comma-separated. No role
 * is stored in the database, so an admin exists only where the variable names one.
 */
export function adminUserIds(value = process.env.ADMIN_USER_IDS): string[] {
  return (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export const isAdmin = (userId: string) => adminUserIds().includes(userId);
