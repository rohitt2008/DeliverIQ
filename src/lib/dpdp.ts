/**
 * DPDP Act 2023 (Digital Personal Data Protection Act) Compliance Utility
 * 
 * Implements:
 * 1. Data Minimization & Purpose Limitation for consignee & driver personal data.
 * 2. Dynamic PII Masking (phone numbers, full names) on public & driver views.
 * 3. Audit trail generation for PII access by billing executives.
 */

/**
 * Masks a phone number (e.g. "+91 98220 54321" -> "+91 98•••• 4321")
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return '—';
  const cleaned = phone.trim();
  if (cleaned.length < 8) return '••••••••';
  
  // Keep country code and first 2 digits + last 4 digits
  const parts = cleaned.split(' ');
  if (parts.length >= 2) {
    const prefix = parts[0]; // e.g. "+91"
    const number = parts.slice(1).join('');
    if (number.length >= 6) {
      const start = number.slice(0, 2);
      const end = number.slice(-4);
      return `${prefix} ${start}•••• ${end}`;
    }
  }

  // Fallback string slicing
  return cleaned.slice(0, 4) + '••••' + cleaned.slice(-4);
}

/**
 * Masks consignee personal name for public links (e.g. "Sanjay Deshpande" -> "S**** D********")
 */
export function maskPersonalName(name?: string | null, isAuthorizedStaff = false): string {
  if (!name) return '—';
  if (isAuthorizedStaff) return name; // Authorized billing staff can view full name

  return name
    .split(' ')
    .map((word) => (word.length > 2 ? `${word[0]}${'*'.repeat(word.length - 1)}` : word))
    .join(' ');
}

/**
 * Logs PII unmasking / view events for DPDP compliance audit
 */
export async function logPIIAccess({
  actorId,
  actorName,
  actorRole,
  tripId,
  fieldName,
}: {
  actorId: string;
  actorName: string;
  actorRole: string;
  tripId: string;
  fieldName: string;
}) {
  try {
    const { default: prisma } = await import('./prisma');
    await prisma.auditLog.create({
      data: {
        action: 'PII_ACCESSED',
        actorRole,
        actorName,
        details: `DPDP Act 2023: Accessed sensitive personal data [${fieldName}] for Trip ${tripId}`,
      },
    });
  } catch (err) {
    console.error('Failed to write DPDP audit log:', err);
  }
}
