// 图片上传相关类型
export interface ImageUpload {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
}

// 分析记录类型
export interface AnalysisRecord {
  id: string;
  imageName: string;
  imageUrl?: string;
  prompt: string;
  timestamp: Date;
}

// API配置类型
export interface ApiConfig {
  openRouterKey: string;
  imgbbKey?: string;
}

// 用户设置类型
export interface UserSettings {
  language: 'zh' | 'en';
  outputFormat: 'detailed' | 'concise';
  autoSave: boolean;
  maxHistoryItems: number;
}

// OpenRouter API响应类型
export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ImgBB API响应类型
export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

// 错误类型
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}