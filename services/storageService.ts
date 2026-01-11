import { supabase, BUCKETS } from './supabase';

// ========== 日记图片 ==========

// 上传日记图片
export async function uploadDiaryPhoto(
  userId: string,
  file: File | Blob,
  fileName?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const name = fileName || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const path = `${userId}/${name}`;

  const { error } = await supabase.storage
    .from(BUCKETS.DIARY_PHOTOS)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('上传日记图片失败:', error);
    return { success: false, error: error.message };
  }

  // 获取签名URL（私有bucket）
  const { data: urlData } = await supabase.storage
    .from(BUCKETS.DIARY_PHOTOS)
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1年有效期

  if (!urlData?.signedUrl) {
    return { success: false, error: '获取图片URL失败' };
  }

  return { success: true, url: urlData.signedUrl };
}

// 删除日记图片
export async function deleteDiaryPhoto(
  userId: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  const path = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKETS.DIARY_PHOTOS)
    .remove([path]);

  if (error) {
    console.error('删除日记图片失败:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// 从URL中提取文件名
export function extractFileNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch {
    return null;
  }
}

// ========== 课程配图 ==========

// 上传课程配图
export async function uploadCourseImage(
  courseId: string,
  imageData: string | Blob
): Promise<{ success: boolean; url?: string; error?: string }> {
  const fileName = `${courseId}.png`;

  let blob: Blob;
  if (typeof imageData === 'string') {
    // 如果是 base64 或 data URL，转换为 Blob
    if (imageData.startsWith('data:')) {
      const response = await fetch(imageData);
      blob = await response.blob();
    } else {
      // 假设是纯 base64
      const byteString = atob(imageData);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      blob = new Blob([ab], { type: 'image/png' });
    }
  } else {
    blob = imageData;
  }

  const { error } = await supabase.storage
    .from(BUCKETS.COURSE_IMAGES)
    .upload(fileName, blob, {
      cacheControl: '31536000', // 1年缓存
      upsert: true, // 允许覆盖
    });

  if (error) {
    console.error('上传课程配图失败:', error);
    return { success: false, error: error.message };
  }

  // 获取公开URL
  const { data: urlData } = supabase.storage
    .from(BUCKETS.COURSE_IMAGES)
    .getPublicUrl(fileName);

  return { success: true, url: urlData.publicUrl };
}

// 获取课程配图URL
export function getCourseImageUrl(courseId: string): string {
  const fileName = `${courseId}.png`;
  const { data } = supabase.storage
    .from(BUCKETS.COURSE_IMAGES)
    .getPublicUrl(fileName);
  return data.publicUrl;
}

// 检查课程配图是否存在
export async function checkCourseImageExists(courseId: string): Promise<boolean> {
  const fileName = `${courseId}.png`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.COURSE_IMAGES)
    .list('', {
      search: fileName,
    });

  if (error) {
    console.error('检查课程配图失败:', error);
    return false;
  }

  return data?.some(file => file.name === fileName) || false;
}

// ========== 通用工具 ==========

// 将 base64 转换为 File 对象
export function base64ToFile(base64: string, fileName: string, mimeType = 'image/jpeg'): File {
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  const byteString = atob(base64Data);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], fileName, { type: mimeType });
}

// 将 Blob 转换为 base64
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
