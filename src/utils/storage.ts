import { AnalysisRecord, ApiConfig, UserSettings } from '../types';

// 本地存储键名
const STORAGE_KEYS = {
  ANALYSIS_HISTORY: 'analysis_history',
  API_CONFIG: 'api_config',
  USER_SETTINGS: 'user_settings',
} as const;

// 默认配置
const DEFAULT_API_CONFIG: ApiConfig = {
  openRouterKey: '',
  imgbbKey: '',
};

const DEFAULT_USER_SETTINGS: UserSettings = {
  language: 'zh',
  outputFormat: 'detailed',
  autoSave: true,
  maxHistoryItems: 9000,
};

// 通用存储工具函数
class StorageManager {
  // 获取数据
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key ${key}:`, error);
      return defaultValue;
    }
  }

  // 保存数据
  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage for key ${key}:`, error);
    }
  }

  // 分析历史记录管理
  getAnalysisHistory(): AnalysisRecord[] {
    const history = this.getItem(STORAGE_KEYS.ANALYSIS_HISTORY, []);
    // 转换日期字符串为Date对象
    return history.map(record => ({
      ...record,
      timestamp: new Date(record.timestamp)
    }));
  }

  saveAnalysisRecord(record: AnalysisRecord): void {
    const history = this.getAnalysisHistory();
    const updatedHistory = [record, ...history];
    
    // 限制历史记录数量
    const settings = this.getUserSettings();
    if (updatedHistory.length > settings.maxHistoryItems) {
      updatedHistory.splice(settings.maxHistoryItems);
    }
    
    this.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, updatedHistory);
  }

  deleteAnalysisRecord(id: string): void {
    const history = this.getAnalysisHistory();
    const updatedHistory = history.filter(record => record.id !== id);
    this.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, updatedHistory);
  }

  clearAnalysisHistory(): void {
    this.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, []);
  }

  // API配置管理
  getApiConfig(): ApiConfig {
    return this.getItem(STORAGE_KEYS.API_CONFIG, DEFAULT_API_CONFIG);
  }

  saveApiConfig(config: ApiConfig): void {
    this.setItem(STORAGE_KEYS.API_CONFIG, config);
  }

  // 用户设置管理
  getUserSettings(): UserSettings {
    return this.getItem(STORAGE_KEYS.USER_SETTINGS, DEFAULT_USER_SETTINGS);
  }

  saveUserSettings(settings: UserSettings): void {
    this.setItem(STORAGE_KEYS.USER_SETTINGS, settings);
  }

  // 搜索历史记录
  searchAnalysisHistory(query: string): AnalysisRecord[] {
    const history = this.getAnalysisHistory();
    if (!query.trim()) return history;

    const lowercaseQuery = query.toLowerCase();
    return history.filter(record => 
      record.prompt.toLowerCase().includes(lowercaseQuery) ||
      record.imageName.toLowerCase().includes(lowercaseQuery)
    );
  }

  // 按日期范围筛选历史记录
  filterAnalysisHistoryByDateRange(startDate: Date, endDate: Date): AnalysisRecord[] {
    const history = this.getAnalysisHistory();
    return history.filter(record => {
      const recordDate = record.timestamp;
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  // 导出历史记录为JSON
  exportAnalysisHistory(): string {
    const history = this.getAnalysisHistory();
    return JSON.stringify(history, null, 2);
  }

  // 导入历史记录
  importAnalysisHistory(jsonData: string): boolean {
    try {
      const importedHistory: AnalysisRecord[] = JSON.parse(jsonData);
      
      // 验证数据格式
      if (!Array.isArray(importedHistory)) {
        throw new Error('Invalid data format');
      }

      // 合并现有历史记录
      const currentHistory = this.getAnalysisHistory();
      const mergedHistory = [...importedHistory, ...currentHistory];
      
      // 去重（基于ID）
      const uniqueHistory = mergedHistory.filter((record, index, self) => 
        index === self.findIndex(r => r.id === record.id)
      );

      this.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, uniqueHistory);
      return true;
    } catch (error) {
      console.error('Error importing analysis history:', error);
      return false;
    }
  }

  // 获取存储使用统计
  getStorageStats() {
    const history = this.getAnalysisHistory();
    const totalRecords = history.length;
    const totalSize = new Blob([JSON.stringify(history)]).size;
    
    return {
      totalRecords,
      totalSize,
      formattedSize: this.formatBytes(totalSize),
      oldestRecord: history[history.length - 1]?.timestamp,
      newestRecord: history[0]?.timestamp,
    };
  }

  // 格式化字节大小
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 导出单例实例
export const storageManager = new StorageManager();