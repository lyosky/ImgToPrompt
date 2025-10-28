import { create } from 'zustand';
import { ImageUpload, AnalysisRecord, ApiConfig, UserSettings, AppError } from '../types';
import { storageManager } from '../utils/storage';
import { openRouterApi } from '../services/openRouterApi';
import { imgbbApi } from '../services/imgbbApi';
import { 
  compressImage, 
  fileToBase64, 
  generateImageId, 
  getImageMetadata,
  shouldCompressImage 
} from '../utils/imageUtils';

interface AppState {
  // 当前状态
  currentImage: ImageUpload | null;
  isAnalyzing: boolean;
  isUploading: boolean;
  analysisResult: AnalysisRecord | null;
  error: AppError | null;
  
  // 数据
  history: AnalysisRecord[];
  apiConfig: ApiConfig;
  userSettings: UserSettings;
  
  // Actions
  setCurrentImage: (image: ImageUpload | null) => void;
  clearCurrentImage: () => void;
  clearError: () => void;
  
  // 图片处理
  processImageFile: (file: File) => Promise<void>;
  uploadImageToImgBB: (file: File) => Promise<string>;
  
  // 分析功能
  analyzeImage: () => Promise<void>;
  
  // 历史记录管理
  loadHistory: () => void;
  saveAnalysisRecord: (record: AnalysisRecord) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  
  // 配置管理
  updateApiConfig: (config: Partial<ApiConfig>) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  
  // 初始化
  initializeApp: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  currentImage: null,
  isAnalyzing: false,
  isUploading: false,
  analysisResult: null,
  error: null,
  history: [],
  apiConfig: storageManager.getApiConfig(),
  userSettings: storageManager.getUserSettings(),

  // 基础状态设置
  setCurrentImage: (image) => set({ currentImage: image, analysisResult: null }),
  clearCurrentImage: () => {
    const { currentImage } = get();
    if (currentImage?.preview) {
      URL.revokeObjectURL(currentImage.preview);
    }
    set({ currentImage: null, analysisResult: null });
  },
  clearError: () => set({ error: null }),

  // 处理图片文件
  processImageFile: async (file: File) => {
    try {
      set({ error: null, isUploading: true });
      
      // 检查是否需要压缩
      let processedFile = file;
      
      if (shouldCompressImage(file, 1)) {
        processedFile = await compressImage(file, {
          quality: 0.8,
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      }
      
      // 创建预览URL
      const preview = URL.createObjectURL(processedFile);
      
      const imageUpload: ImageUpload = {
        id: generateImageId(),
        file: processedFile,
        preview,
        name: file.name,
        size: processedFile.size,
        type: processedFile.type,
        uploadedAt: new Date(),
      };
      
      set({ 
        currentImage: imageUpload,
        analysisResult: null,
        isUploading: false 
      });
      
    } catch (error) {
      console.error('Error processing image file:', error);
      set({ 
        error: { 
          message: error instanceof Error ? error.message : '图片处理失败' 
        },
        isUploading: false 
      });
    }
  },

  // 上传图片到ImgBB
  uploadImageToImgBB: async (file: File) => {
    try {
      const { apiConfig } = get();
      
      if (!apiConfig.imgbbKey) {
        throw new Error('请先设置ImgBB API Key');
      }
      
      imgbbApi.setApiKey(apiConfig.imgbbKey);
      
      // 转换为Base64
      const base64 = await fileToBase64(file);
      
      // 上传到ImgBB
      const imageUrl = await imgbbApi.uploadImage(base64, {
        name: file.name.split('.')[0],
      });
      
      return imageUrl;
    } catch (error) {
      console.error('Error uploading to ImgBB:', error);
      throw error;
    }
  },

  // 分析当前图片
  analyzeImage: async () => {
    const { currentImage, apiConfig, userSettings } = get();
    
    if (!currentImage) {
      set({ error: { message: '请先选择图片' } });
      return;
    }
    
    if (!apiConfig.openRouterKey) {
      set({ error: { message: '请先设置OpenRouter API Key' } });
      return;
    }
    
    try {
      set({ isAnalyzing: true, error: null });
      
      // 设置API Key
      openRouterApi.setApiKey(apiConfig.openRouterKey);
      
      let imageData: string | File;
      
      // 如果有ImgBB API Key，尝试上传图片
      if (apiConfig.imgbbKey) {
        try {
          const imageUrl = await get().uploadImageToImgBB(currentImage.file);
          imageData = imageUrl;
          
          // 更新当前图片的上传URL
          set({
            currentImage: {
              ...currentImage,
              url: imageUrl,
            },
          });
        } catch (uploadError) {
          console.warn('ImgBB upload failed, using local file:', uploadError);
          // 如果上传失败，直接使用文件
          imageData = currentImage.file;
        }
      } else {
        // 直接使用文件
        imageData = currentImage.file;
      }
      
      // 调用OpenRouter API分析图片
      const result = await openRouterApi.analyzeImage(imageData, {
        language: userSettings.language,
      });
      
      const analysisRecord: AnalysisRecord = {
        id: generateImageId(),
        imageName: currentImage.name,
        imageUrl: currentImage.url,
        prompt: result,
        timestamp: new Date(),
      };
      
      set({ analysisResult: analysisRecord });
      
      // 如果启用自动保存，保存到历史记录
      if (userSettings.autoSave) {
        get().saveAnalysisRecord(analysisRecord);
      }
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      set({ 
        error: { 
          message: error instanceof Error ? error.message : '图片分析失败' 
        } 
      });
    } finally {
      set({ isAnalyzing: false });
    }
  },

  // 加载历史记录
  loadHistory: () => {
    const history = storageManager.getAnalysisHistory();
    set({ history });
  },

  // 保存分析记录
  saveAnalysisRecord: (record) => {
    storageManager.saveAnalysisRecord(record);
    
    // 重新加载历史记录
    get().loadHistory();
  },

  // 删除历史记录
  deleteHistoryItem: (id) => {
    storageManager.deleteAnalysisRecord(id);
    get().loadHistory();
  },

  // 清空历史记录
  clearHistory: () => {
    storageManager.clearAnalysisHistory();
    get().loadHistory();
  },

  // 更新API配置
  updateApiConfig: (config) => {
    const { apiConfig } = get();
    const updatedConfig = { ...apiConfig, ...config };
    
    storageManager.saveApiConfig(updatedConfig);
    set({ apiConfig: updatedConfig });
    
    // 更新API服务的密钥
    if (config.openRouterKey) {
      openRouterApi.setApiKey(config.openRouterKey);
    }
    if (config.imgbbKey) {
      imgbbApi.setApiKey(config.imgbbKey);
    }
  },

  // 更新用户设置
  updateUserSettings: (settings) => {
    const { userSettings } = get();
    const updatedSettings = { ...userSettings, ...settings };
    
    storageManager.saveUserSettings(updatedSettings);
    set({ userSettings: updatedSettings });
  },

  // 初始化应用
  initializeApp: () => {
    const { loadHistory } = get();
    loadHistory();
    
    // 设置API密钥
    const { apiConfig } = get();
    if (apiConfig.openRouterKey) {
      openRouterApi.setApiKey(apiConfig.openRouterKey);
    }
    if (apiConfig.imgbbKey) {
      imgbbApi.setApiKey(apiConfig.imgbbKey);
    }
  },
}));