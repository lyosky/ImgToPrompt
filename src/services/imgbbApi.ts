import axios from 'axios';
import { ImgBBResponse } from '../types';

// ImgBB API配置
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

/**
 * ImgBB图床API服务类
 */
class ImgBBApiService {
  private apiKey: string = '';

  /**
   * 设置API Key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * 验证API Key是否已设置
   */
  validateApiKey(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  /**
   * 上传图片到ImgBB
   */
  async uploadImage(
    base64Image: string,
    options: {
      name?: string;
      expiration?: number; // 过期时间（秒）
    } = {}
  ): Promise<string> {
    if (!this.validateApiKey()) {
      throw new Error('请先设置ImgBB API Key');
    }

    const { name, expiration } = options;

    try {
      const formData = new FormData();
      formData.append('key', this.apiKey);
      formData.append('image', base64Image);
      
      if (name) {
        formData.append('name', name);
      }
      
      if (expiration) {
        formData.append('expiration', expiration.toString());
      }

      const response = await axios.post<ImgBBResponse>(
        IMGBB_API_URL,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30秒超时
        }
      );

      if (!response.data.success) {
        throw new Error('图片上传失败');
      }

      return response.data.data.url;
    } catch (error) {
      console.error('ImgBB upload error:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;
        
        switch (status) {
          case 400:
            throw new Error('图片格式不支持或数据无效');
          case 401:
            throw new Error('ImgBB API Key无效');
          case 403:
            throw new Error('API访问被拒绝，请检查权限');
          case 413:
            throw new Error('图片文件过大');
          case 429:
            throw new Error('上传频率超限，请稍后重试');
          case 500:
            throw new Error('ImgBB服务器内部错误');
          default:
            throw new Error(`上传失败: ${message}`);
        }
      }
      
      throw new Error('网络连接失败，请检查网络设置');
    }
  }

  /**
   * 测试API Key是否有效
   */
  async testApiKey(apiKey: string): Promise<boolean> {
    const originalKey = this.apiKey;
    this.setApiKey(apiKey);
    
    try {
      // 创建一个1x1像素的测试图片（Base64）
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const formData = new FormData();
      formData.append('key', apiKey);
      formData.append('image', testImageBase64);
      formData.append('name', 'test');
      
      await axios.post(
        IMGBB_API_URL,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000,
        }
      );
      
      return true;
    } catch (error) {
      console.error('ImgBB API Key test failed:', error);
      return false;
    } finally {
      this.setApiKey(originalKey);
    }
  }

  /**
   * 获取上传限制信息
   */
  getUploadLimits() {
    return {
      maxFileSize: 32 * 1024 * 1024, // 32MB
      supportedFormats: ['JPG', 'PNG', 'GIF', 'BMP', 'WEBP'],
      maxDimensions: {
        width: 65000,
        height: 65000,
      },
    };
  }

  /**
   * 验证图片是否符合ImgBB要求
   */
  validateImageForUpload(file: File): { isValid: boolean; error?: string } {
    const limits = this.getUploadLimits();
    
    // 检查文件大小
    if (file.size > limits.maxFileSize) {
      return {
        isValid: false,
        error: `文件大小超过限制 (${limits.maxFileSize / 1024 / 1024}MB)`,
      };
    }
    
    // 检查文件格式
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (!fileExtension || !limits.supportedFormats.includes(fileExtension)) {
      return {
        isValid: false,
        error: `不支持的文件格式。支持的格式：${limits.supportedFormats.join(', ')}`,
      };
    }
    
    return { isValid: true };
  }
}

// 导出单例实例
export const imgbbApi = new ImgBBApiService();