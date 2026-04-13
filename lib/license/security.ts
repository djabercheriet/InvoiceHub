import crypto from 'crypto'

const SECRET = process.env.LICENSE_SIGNING_SECRET || 'bntec-default-secret-2024'

/**
 * Signs a license payload using HMAC-SHA256
 */
export function signLicensePayload(payload: any): string {
  const data = JSON.stringify(payload)
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
