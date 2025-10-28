import React, { useState, useEffect } from 'react';
import { 
  KeyIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../store/useAppStore';
import { openRouterApi } from '../services/openRouterApi';
import { imgbbApi } from '../services/imgbbApi';
import { cn } from '../utils/cn';

interface ApiKeyTestResult {
  isValid: boolean;
  message: string;
  isLoading: boolean;
}

export function Settings() {
  const { apiConfig, userSettings, updateApiConfig, updateUserSettings } = useAppStore();
  
  // API Keys
  const [openRouterKey, setOpenRouterKey] = useState(apiConfig.openRouterKey || '');
  const [imgbbKey, setImgbbKey] = useState(apiConfig.imgbbKey || '');
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showImgbbKey, setShowImgbbKey] = useState(false);
  
  // Test Results
  const [openRouterTest, setOpenRouterTest] = useState<ApiKeyTestResult>({
    isValid: false,
    message: '',
    isLoading: false
  });
  const [imgbbTest, setImgbbTest] = useState<ApiKeyTestResult>({
    isValid: false,
    message: '',
    isLoading: false
  });
  
  // Settings
  const [language, setLanguage] = useState(userSettings.language);
  const [outputFormat, setOutputFormat] = useState(userSettings.outputFormat);
  const [autoSave, setAutoSave] = useState(userSettings.autoSave);
  const [maxHistoryItems, setMaxHistoryItems] = useState(userSettings.maxHistoryItems);
  
  // Save status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    // 初始化时测试已有的API Key
    if (openRouterKey) {
      testOpenRouterKey(openRouterKey);
    }
    if (imgbbKey) {
      testImgbbKey(imgbbKey);
    }
  }, []);

  const testOpenRouterKey = async (key: string) => {
    if (!key.trim()) {
      setOpenRouterTest({ isValid: false, message: '', isLoading: false });
      return;
    }

    setOpenRouterTest({ isValid: false, message: '', isLoading: true });
    
    try {
      openRouterApi.setApiKey(key);
      const isValid = await openRouterApi.testApiKey(key);
      
      setOpenRouterTest({
        isValid,
        message: isValid ? 'API Key 有效' : 'API Key 无效或无权限',
        isLoading: false
      });
    } catch (error) {
      setOpenRouterTest({
        isValid: false,
        message: error instanceof Error ? error.message : '测试失败',
        isLoading: false
      });
    }
  };

  const testImgbbKey = async (key: string) => {
    if (!key.trim()) {
      setImgbbTest({ isValid: false, message: '', isLoading: false });
      return;
    }

    setImgbbTest({ isValid: false, message: '', isLoading: true });
    
    try {
      imgbbApi.setApiKey(key);
      const isValid = await imgbbApi.testApiKey(key);
      
      setImgbbTest({
        isValid,
        message: isValid ? 'API Key 有效' : 'API Key 无效',
        isLoading: false
      });
    } catch (error) {
      setImgbbTest({
        isValid: false,
        message: error instanceof Error ? error.message : '测试失败',
        isLoading: false
      });
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    
    try {
      // 更新API配置
      updateApiConfig({
        openRouterKey: openRouterKey.trim(),
        imgbbKey: imgbbKey.trim()
      });
      
      // 更新用户设置
      updateUserSettings({
        language,
        outputFormat,
        autoSave,
        maxHistoryItems
      });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Save settings error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleResetSettings = () => {
    if (confirm('确定要重置所有设置吗？此操作不可恢复。')) {
      setLanguage('zh');
      setOutputFormat('detailed');
      setAutoSave(true);
      setMaxHistoryItems(100);
      setOpenRouterKey('');
      setImgbbKey('');
      setOpenRouterTest({ isValid: false, message: '', isLoading: false });
      setImgbbTest({ isValid: false, message: '', isLoading: false });
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">设置</h1>
        <p className="mt-2 text-gray-600">
          配置API密钥和个人偏好设置
        </p>
      </div>

      {/* API Keys Section */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <KeyIcon className="h-5 w-5 mr-2" />
            API 密钥配置
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            配置第三方服务的API密钥以启用相关功能
          </p>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          {/* OpenRouter API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenRouter API Key
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showOpenRouterKey ? 'text' : 'password'}
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  onBlur={() => testOpenRouterKey(openRouterKey)}
                  placeholder="sk-or-v1-..."
                  className="block w-full pr-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                  <button
                    type="button"
                    onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showOpenRouterKey ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => testOpenRouterKey(openRouterKey)}
                    disabled={openRouterTest.isLoading || !openRouterKey.trim()}
                    className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 text-xs"
                  >
                    {openRouterTest.isLoading ? '测试中...' : '测试'}
                  </button>
                </div>
              </div>
              
              {/* Test Result */}
              {openRouterTest.message && (
                <div className={cn(
                  'flex items-center text-xs px-2 py-1 rounded',
                  openRouterTest.isValid 
                    ? 'text-green-700 bg-green-50' 
                    : 'text-red-700 bg-red-50'
                )}>
                  {openRouterTest.isValid ? (
                    <CheckIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <XMarkIcon className="h-3 w-3 mr-1" />
                  )}
                  {openRouterTest.message}
                </div>
              )}
              
              <div className="flex items-start text-xs text-gray-500">
                <InformationCircleIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  用于调用OpenRouter API进行图片分析。
                  <a 
                    href="https://openrouter.ai/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 ml-1"
                  >
                    获取API Key
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* ImgBB API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ImgBB API Key
              <span className="text-gray-400 ml-1">(可选)</span>
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showImgbbKey ? 'text' : 'password'}
                  value={imgbbKey}
                  onChange={(e) => setImgbbKey(e.target.value)}
                  onBlur={() => testImgbbKey(imgbbKey)}
                  placeholder="输入ImgBB API Key"
                  className="block w-full pr-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                  <button
                    type="button"
                    onClick={() => setShowImgbbKey(!showImgbbKey)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showImgbbKey ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => testImgbbKey(imgbbKey)}
                    disabled={imgbbTest.isLoading || !imgbbKey.trim()}
                    className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 text-xs"
                  >
                    {imgbbTest.isLoading ? '测试中...' : '测试'}
                  </button>
                </div>
              </div>
              
              {/* Test Result */}
              {imgbbTest.message && (
                <div className={cn(
                  'flex items-center text-xs px-2 py-1 rounded',
                  imgbbTest.isValid 
                    ? 'text-green-700 bg-green-50' 
                    : 'text-red-700 bg-red-50'
                )}>
                  {imgbbTest.isValid ? (
                    <CheckIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <XMarkIcon className="h-3 w-3 mr-1" />
                  )}
                  {imgbbTest.message}
                </div>
              )}
              
              <div className="flex items-start text-xs text-gray-500">
                <InformationCircleIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  用于上传图片到ImgBB图床服务。如不配置，将使用本地预览。
                  <a 
                    href="https://api.imgbb.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 ml-1"
                  >
                    获取API Key
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Preferences Section */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <CogIcon className="h-5 w-5 mr-2" />
            个人偏好设置
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            自定义应用的行为和显示方式
          </p>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输出语言
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'zh' | 'en')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              AI分析结果的输出语言
            </p>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输出格式
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as 'detailed' | 'concise')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="concise">简洁模式</option>
              <option value="detailed">详细模式</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              控制AI分析结果的详细程度和格式
            </p>
          </div>

          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                自动保存历史记录
              </label>
              <p className="text-xs text-gray-500">
                自动将分析结果保存到历史记录
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoSave(!autoSave)}
              className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                autoSave ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  autoSave ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* Max History Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大历史记录数量
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              value={maxHistoryItems}
              onChange={(e) => setMaxHistoryItems(parseInt(e.target.value) || 100)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              超过此数量时，旧记录将被自动删除 (10-1000)
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleResetSettings}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <XMarkIcon className="h-4 w-4 mr-2" />
          重置设置
        </button>
        
        <button
          onClick={handleSaveSettings}
          disabled={saveStatus === 'saving'}
          className={cn(
            'inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            saveStatus === 'saved'
              ? 'text-green-700 bg-green-100 hover:bg-green-200'
              : saveStatus === 'error'
              ? 'text-red-700 bg-red-100 hover:bg-red-200'
              : 'text-white bg-blue-600 hover:bg-blue-700'
          )}
        >
          {saveStatus === 'saving' && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {saveStatus === 'saved' && <CheckIcon className="h-4 w-4 mr-2" />}
          {saveStatus === 'error' && <ExclamationTriangleIcon className="h-4 w-4 mr-2" />}
          
          {saveStatus === 'saving' ? '保存中...' : 
           saveStatus === 'saved' ? '已保存' :
           saveStatus === 'error' ? '保存失败' : '保存设置'}
        </button>
      </div>

      {/* Warning for missing API keys */}
      {!openRouterKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                需要配置API密钥
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  OpenRouter API Key是必需的，用于调用AI模型进行图片分析。
                  请在上方配置您的API密钥以启用分析功能。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}