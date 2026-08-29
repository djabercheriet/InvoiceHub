import { 
  signEcdsaPayload, 
  verifyEcdsaSignature, 
  stableStringify, 
  BNTEC_LICENSE_PUBLIC_KEY, 
  signLicensePayload, 
  verifyLicenseSignature 
} from '../lib/license/security'
import crypto from 'crypto'

let passed = 0
let failed = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`)
    passed++
  } else {
    console.error(`  [FAIL] ${message}`)
    failed++
  }
}

async function runSuite() {
  console.log('================================================================')
  console.log(' BNTEC LICENSE SERVER - ECDSA P-256 VERIFICATION SUITE')
  console.log('================================================================\n')

  const testPayload = {
    licenseId: 'b7a8d56c-1234-4567-890a-bcdef1234567',
    licenseKey: 'BNT-TEST-2026-XYZ9',
    organizationId: 'comp_12345678-abcd-ef01-2345-6789abcdef01',
    product: 'MIZANE_POS',
    edition: 'Pro',
    features: ['pos', 'inventory', 'analytics', 'reports', 'cloud_sync'],
    deviceId: 'mizane-device-test-hardware-id-2026',
    isLifetime: true,
    issuedAt: '2026-08-28T00:00:00.000Z',
    expiresAt: null,
    gracePeriodDays: 14
  }

  // 1. Canonical Stringify Equivalence
  console.log('1. Canonical Stringify Equivalence:')
  const obj1 = { b: 2, a: 1, nested: { z: [3, 1, 2], y: 'text', x: null } }
  const expectedCanonical = '{"a":1,"b":2,"nested":{"x":null,"y":"text","z":[3,1,2]}}'
  assert(stableStringify(obj1) === expectedCanonical, 'Recursive stableStringify sorts keys and preserves arrays/primitives')

  // 2. ECDSA Signature Generation & DER-Hex Format
  console.log('\n2. ECDSA P-256 Signing & Format:')
  const signatureHex = signEcdsaPayload(testPayload)
  assert(typeof signatureHex === 'string', 'Signature is a string')
  assert(/^[0-9a-f]+$/i.test(signatureHex), 'Signature is hexadecimal')
  // DER encoded ECDSA P-256 signature is typically 138-144 hex chars (69-72 bytes), starting with 30 (DER SEQUENCE)
  assert(signatureHex.startsWith('30'), 'Signature is ASN.1/DER encoded (starts with 0x30)')
  assert(signatureHex.length >= 130 && signatureHex.length <= 150, `Signature length is DER ECDSA (${signatureHex.length} hex chars, NOT 64-char HMAC)`)

  // 3. MIZANE Public Key Verification
  console.log('\n3. Verification using Embedded MIZANE Public Key:')
  const isVerified = verifyEcdsaSignature(testPayload, signatureHex)
  assert(isVerified === true, 'Signature verifies successfully with BNTEC_LICENSE_PUBLIC_KEY')

  // 4. Tampering Detection
  console.log('\n4. Tamper Resistance Tests:')
  // Field modification
  const tampered1 = { ...testPayload, edition: 'Enterprise' }
  assert(verifyEcdsaSignature(tampered1, signatureHex) === false, 'Tampered field (edition) is rejected')

  const tampered2 = { ...testPayload, isLifetime: false }
  assert(verifyEcdsaSignature(tampered2, signatureHex) === false, 'Tampered field (isLifetime) is rejected')

  const tampered3 = { ...testPayload, deviceId: 'different-device-id' }
  assert(verifyEcdsaSignature(tampered3, signatureHex) === false, 'Tampered field (deviceId) is rejected')

  // 5. Invalid Signature Rejection
  console.log('\n5. Invalid Signature Rejection:')
  const invalidSig = signatureHex.slice(0, -4) + '0000'
  assert(verifyEcdsaSignature(testPayload, invalidSig) === false, 'Corrupted signature is rejected')

  const fakeSig = '3045022100a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f900220a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90'
  assert(verifyEcdsaSignature(testPayload, fakeSig) === false, 'Unrelated signature is rejected')

  // 6. Signature Forgery Attempt
  console.log('\n6. Key Authentication / Anti-Forgery:')
  const rogueKeys = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
  const forgedSig = signEcdsaPayload(testPayload, rogueKeys.privateKey.export({ type: 'pkcs8', format: 'pem' }) as string)
  assert(verifyEcdsaSignature(testPayload, forgedSig) === false, 'Signature generated with unauthorized private key is rejected')

  // 7. Isolation & Backwards Compatibility with HMAC
  console.log('\n7. Backwards Compatibility Isolation:')
  const legacyHmacSig = signLicensePayload({ test: 'legacy' })
  assert(legacyHmacSig.length === 64, 'Legacy HMAC signature is exactly 64 hex characters')
  assert(verifyLicenseSignature({ test: 'legacy' }, legacyHmacSig) === true, 'Legacy HMAC verification remains functional')

  console.log('\n================================================================')
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runSuite().catch(err => {
  console.error('Suite error:', err)
  process.exit(1)
})
