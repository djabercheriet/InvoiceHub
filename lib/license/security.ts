import crypto from 'crypto'

const SECRET = process.env.LICENSE_SIGNING_SECRET || 'bntec-default-secret-2024'

/**
 * Standardizes object stringification by sorting keys to ensure 
 * deterministic signature verification across different JS engines.
 */
function stableStringify(obj: any): string {
  const allKeys: string[] = [];
  JSON.stringify(obj, (key, value) => {
    allKeys.push(key);
    return value;
  });
  allKeys.sort();
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/**
 * Signs a license payload using HMAC-SHA256
 */
export function signLicensePayload(payload: any): string {
  const data = stableStringify(payload)
  return crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('hex')
}

/**
 * Verifies a license payload against a signature
 */
export function verifyLicenseSignature(payload: any, signature: string): boolean {
  const expected = signLicensePayload(payload)
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  )
}
