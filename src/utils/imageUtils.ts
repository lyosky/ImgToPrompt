import imageCompression from 'browser-image-compression';

// 图片压缩选项
export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality: number;
}

// 默认压缩配置
const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  quality: 0.8,
};

// 支持的图片格式
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// 最大文件大小 (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // 检查文件类型
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `不支持的文件格式。支持的格式：${SUPPORTED_IMAGE_TYPES.join(', ')}`,
    };
  }

  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `文件大小超过限制。最大支持 ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  return { isValid: true };
}

/**
 * 压缩图片
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<File> {
  const compressionOptions = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };
  
  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('图片压缩失败');
  }
}

/**
 * 创建图片预览URL
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * 清理图片预览URL
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * 获取图片尺寸
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = createImagePreview(file);
    
    img.onload = () => {
      revokeImagePreview(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    
    img.onerror = () => {
      revokeImagePreview(url);
      reject(new Error('无法读取图片尺寸'));
    };
    
    img.src = url;
  });
}

/**
 * 将文件转换为Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      // 移除data:image/...;base64,前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * 从URL加载图片文件
 */
export async function loadImageFromUrl(url: string): Promise<File> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // 检查是否为图片类型
    if (!blob.type.startsWith('image/')) {
      throw new Error('URL不是有效的图片文件');
    }
    
    // 从URL提取文件名
    const urlPath = new URL(url).pathname;
    const fileName = urlPath.split('/').pop() || 'image';
    
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    console.error('Failed to load image from URL:', error);
    throw new Error('无法从URL加载图片');
  }
}

/**
 * 验证图片URL
 */
export function validateImageUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 生成唯一的图片ID
 */
export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 检查图片是否需要压缩
 */
export function shouldCompressImage(file: File, maxSizeMB: number = 1): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxSizeBytes;
}

/**
 * 获取图片元数据
 */
export function getImageMetadata(file: File): Promise<{
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  dimensions?: { width: number; height: number };
}> {
  return new Promise(async (resolve, reject) => {
    try {
      const metadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified),
      };

      // 尝试获取图片尺寸
      try {
        const dimensions = await getImageDimensions(file);
        resolve({ ...metadata, dimensions });
      } catch {
        // 如果获取尺寸失败，返回不包含尺寸的元数据
        resolve(metadata);
      }
    } catch (error) {
      reject(new Error('获取图片元数据失败'));
    }
  });
}