/**
 * 客户端加密服务
 * 使用家庭码派生密钥，实现端到端加密
 * 确保管理员无法查看用户原始数据
 */

// 加密前缀标识，用于区分加密数据和明文数据
const ENCRYPTED_PREFIX = 'ENC:';

// 密钥缓存，避免重复派生
const keyCache = new Map<string, CryptoKey>();

/**
 * 从家庭码派生加密密钥
 * 使用 PBKDF2 算法，相同的家庭码始终生成相同的密钥
 */
async function deriveKey(familyCode: string): Promise<CryptoKey> {
  // 检查缓存
  if (keyCache.has(familyCode)) {
    return keyCache.get(familyCode)!;
  }

  const encoder = new TextEncoder();

  // 将家庭码转换为密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(familyCode),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // 使用固定盐值（因为我们需要相同家庭码在不同设备上生成相同密钥）
  // 盐值是公开的，安全性来自于家庭码本身
  const salt = encoder.encode('dingdang-story-salt-v1');

  // 派生 AES-GCM 密钥
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // 迭代次数，增加破解难度
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // 缓存密钥
  keyCache.set(familyCode, key);

  return key;
}

/**
 * 加密文本
 * @param plaintext 明文
 * @param familyCode 家庭码（用于派生密钥）
 * @returns 加密后的字符串（带前缀）
 */
export async function encrypt(plaintext: string, familyCode: string): Promise<string> {
  if (!plaintext || !familyCode) {
    return plaintext;
  }

  try {
    const key = await deriveKey(familyCode);
    const encoder = new TextEncoder();

    // 生成随机 IV（初始化向量）
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 加密
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );

    // 将 IV 和密文合并，然后转为 Base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    const base64 = btoa(String.fromCharCode(...combined));

    return ENCRYPTED_PREFIX + base64;
  } catch (error) {
    console.error('加密失败:', error);
    return plaintext; // 加密失败时返回原文（降级处理）
  }
}

/**
 * 解密文本
 * @param ciphertext 密文（带前缀）
 * @param familyCode 家庭码（用于派生密钥）
 * @returns 解密后的明文
 */
export async function decrypt(ciphertext: string, familyCode: string): Promise<string> {
  if (!ciphertext || !familyCode) {
    return ciphertext;
  }

  // 检查是否是加密数据
  if (!ciphertext.startsWith(ENCRYPTED_PREFIX)) {
    return ciphertext; // 不是加密数据，直接返回（兼容旧数据）
  }

  try {
    const key = await deriveKey(familyCode);
    const decoder = new TextDecoder();

    // 移除前缀并解码 Base64
    const base64 = ciphertext.slice(ENCRYPTED_PREFIX.length);
    const combined = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    // 分离 IV 和密文
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // 解密
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return decoder.decode(decrypted);
  } catch (error) {
    console.error('解密失败:', error);
    return '[解密失败]'; // 解密失败时显示提示
  }
}

/**
 * 批量加密对象中的指定字段
 * @param obj 原始对象
 * @param fields 需要加密的字段名数组
 * @param familyCode 家庭码
 * @returns 加密后的对象
 */
export async function encryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
  familyCode: string
): Promise<T> {
  const result = { ...obj };

  for (const field of fields) {
    const value = obj[field];
    if (typeof value === 'string' && value) {
      (result as Record<string, unknown>)[field as string] = await encrypt(value, familyCode);
    }
  }

  return result;
}

/**
 * 批量解密对象中的指定字段
 * @param obj 加密对象
 * @param fields 需要解密的字段名数组
 * @param familyCode 家庭码
 * @returns 解密后的对象
 */
export async function decryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
  familyCode: string
): Promise<T> {
  const result = { ...obj };

  for (const field of fields) {
    const value = obj[field];
    if (typeof value === 'string' && value) {
      (result as Record<string, unknown>)[field as string] = await decrypt(value, familyCode);
    }
  }

  return result;
}

/**
 * 批量解密数组中每个对象的指定字段
 */
export async function decryptArrayFields<T extends Record<string, unknown>>(
  arr: T[],
  fields: (keyof T)[],
  familyCode: string
): Promise<T[]> {
  return Promise.all(arr.map(obj => decryptFields(obj, fields, familyCode)));
}

/**
 * 清除密钥缓存（用户退出时调用）
 */
export function clearKeyCache(): void {
  keyCache.clear();
}

/**
 * 检查文本是否已加密
 */
export function isEncrypted(text: string): boolean {
  return text?.startsWith(ENCRYPTED_PREFIX) ?? false;
}
