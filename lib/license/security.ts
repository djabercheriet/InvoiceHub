import crypto from 'crypto'

const LEGACY_SECRET = process.env.LICENSE_SIGNING_SECRET || 'bntec-default-secret-2024'

/**
 * Official Bntec License Public Verification Key (ECDSA P-256 / prime256v1)
 * Used by MIZANE POS client to verify digital signatures.
 */
export const BNTEC_LICENSE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5NgL4XWpkYXwm89DFSwLiTQKbb0W
BgB8926IrdW9T5KV2XplRdzQcEwtlTm6SDEoYdyQgGqvYc1SRkGeqgh1Gg==
-----END PUBLIC KEY-----`

/**
 * Deterministic JSON stringification for canonical signature generation and verification.
 * Recursively sorts all object keys to ensure byte-for-byte identical representation across platforms.
 */
export function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj)
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']'
  }
  const keys = Object.keys(obj).sort()
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',') + '}'
}

/**
 * Retrieves the server-side ECDSA private signing key from environment variables.
 * Under no circumstances is this key logged, sent to clients, or exposed publicly.
 */
function getEcdsaPrivateKey(): string {
  const privateKey =
    process.env.LICENSE_ECDSA_PRIVATE_KEY ||
    process.env.BNTEC_LICENSE_PRIVATE_KEY ||
    process.env.LICENSE_PRIVATE_KEY

  if (!privateKey) {
    throw new Error('Server ECDSA private key (LICENSE_ECDSA_PRIVATE_KEY) is not configured')
  }

  return privateKey.replace(/\\n/g, '\n')
}

/**
 * Signs a license payload using ECDSA P-256 (prime256v1 / SHA-256).
 * Returns DER-encoded signature as a hexadecimal string.
 */
export function signEcdsaPayload(payload: any, privateKeyPem?: string): string {
  const key = privateKeyPem || getEcdsaPrivateKey()
  const canonical = stableStringify(payload)
  const signer = crypto.createSign('SHA256')
  signer.update(canonical)
  signer.end()
  return signer.sign(key, 'hex')
}

/**
 * Verifies an ECDSA P-256 signature against a payload using the public key.
 */
export function verifyEcdsaSignature(
  payload: any,
  signatureHex: string,
  publicKeyPem: string = BNTEC_LICENSE_PUBLIC_KEY
): boolean {
  if (!signatureHex || typeof signatureHex !== 'string') return false
  try {
    const canonical = stableStringify(payload)
    const verifier = crypto.createVerify('SHA256')
    verifier.update(canonical)
    verifier.end()
    return verifier.verify(publicKeyPem, Buffer.from(signatureHex, 'hex'))
  } catch (err) {
    console.error('[License Security] Verification error:', err)
    return false
  }
}

/**
 * Signs a license payload using legacy HMAC-SHA256 (for legacy clients/products).
 */
export function signLicensePayload(payload: any): string {
  const data = stableStringify(payload)
  return crypto
    .createHmac('sha256', LEGACY_SECRET)
    .update(data)
    .digest('hex')
}

/**
 * Verifies a license payload against a legacy HMAC signature.
 */
export function verifyLicenseSignature(payload: any, signature: string): boolean {
  const expected = signLicensePayload(payload)
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  )
}

