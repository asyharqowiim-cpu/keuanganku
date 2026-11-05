/**
 * End-to-End Encryption (E2EE) Utility using Web Crypto API (AES-256-GCM + PBKDF2-SHA256)
 */

const SALT_PREFIX = 'kasavault-e2ee-salt-v1:';
const PBKDF2_ITERATIONS = 100000;

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function deriveVaultKey(passphrase: string, userContextId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const salt = enc.encode(`${SALT_PREFIX}${userContextId}`);
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function computeKeyFingerprint(passphrase: string, userContextId: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`fingerprint:${userContextId}:${passphrase}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

export async function encryptPayload(plainObject: Record<string, unknown>, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = enc.encode(JSON.stringify(plainObject));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const ivB64 = bufferToBase64(iv);
  const cipherB64 = bufferToBase64(cipherBuffer);
  return `v1:${ivB64}:${cipherB64}`;
}

export async function decryptPayload<T = Record<string, unknown>>(
  encryptedPayload: string,
  key: CryptoKey
): Promise<T | null> {
  if (!encryptedPayload || !encryptedPayload.startsWith('v1:')) {
    return null;
  }
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) return null;
    const iv = base64ToBuffer(parts[1]);
    const cipherBytes = base64ToBuffer(parts[2]);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      cipherBytes as BufferSource
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedBuffer)) as T;
  } catch {
    return null;
  }
}
