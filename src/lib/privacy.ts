/**
 * Email & Data Privacy Utilities
 */

/**
 * Mask an email address for safe public display (e.g., buyer invoice & status tracking)
 * Examples:
 *   - "rahmadiana@gmail.com" -> "ra***@gmail.com"
 *   - "john.doe@corporate.co.id" -> "jo***@corporate.co.id"
 *   - "ab@xyz.com" -> "a*@xyz.com"
 */
export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return '***@***.***';
  }

  const parts = email.trim().split('@');
  if (parts.length !== 2) return '***@***.***';

  const [local, domain] = parts;
  if (!local || !domain) return '***@***.***';

  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }

  const prefix = local.substring(0, 2);
  return `${prefix}***@${domain}`;
}
