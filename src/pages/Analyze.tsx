import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  PhotoIcon, 
  CloudArrowUpIcon, 
  LinkIcon,
  SparklesIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../store/useAppStore';
import { validateImageFile, compressImage, createImagePreview } from '../utils/imageUtils';
import { cn } from '../utils/cn';

export function Analyze() {
  const {
    currentImage,
    isAnalyzing,
    analysisResult,
    error,
    setCurrentImage,
    analyzeImage,
    clearCurrentImage,
    clearError
  } = useAppStore();

  const [imageUrl, setImageUrl] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      clearError();
      
      // 验证文件
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // 压缩图片
      const compressedFile = await compressImage(file);
      
      // 创建预览
      const preview = createImagePreview(compressedFile);
      
      setCurrentImage({
        id: Date.now().toString(),
        file: compressedFile,
        preview,
        name: file.name,
        size: compressedFile.size,
        type: compressedFile.type,
        uploadedAt: new Date()
      });
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }, [setCurrentImage, clearError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    try {
      clearError();
      
      // 直接创建包含URL信息的ImageUpload对象，不下载图片
      const urlObj = new URL(imageUrl.trim());
      const fileName = urlObj.pathname.split('/').pop() || 'URL图片';
      
      setCurrentImage({
        id: Date.now().toString(),
        file: null as any, // URL模式下不需要File对象
        preview: imageUrl.trim(),
        name: fileName,
        size: 0, // URL模式下无法预知大小
        type: 'image/*', // 通用图片类型
        uploadedAt: new Date(),
        url: imageUrl.trim(),
        isUrl: true // 标记这是URL来源的图片
      });
      
      setImageUrl('');
      setIsUrlMode(false);
    } catch (error) {
      console.error('Error processing URL:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!currentImage) return;
    await analyzeImage();
  };

  const handleCopyResult = async () => {
    if (!analysisResult) return;
    
    try {
      await navigator.clipboard.writeText(analysisResult.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">图片分析</h1>
        <p className="mt-2 text-gray-600">
          上传图片或输入图片URL，AI将为您生成详细的提示词描述
        </p>
      </div>

      {/* Upload Section */}
      {!currentImage && (
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setIsUrlMode(false)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  !isUrlMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <CloudArrowUpIcon className="h-4 w-4 inline mr-2" />
                文件上传
              </button>
              <button
                onClick={() => setIsUrlMode(true)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isUrlMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <LinkIcon className="h-4 w-4 inline mr-2" />
                URL输入
              </button>
            </div>
          </div>

          {/* File Upload */}
          {!isUrlMode && (
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <input {...getInputProps()} />
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? '释放文件以上传' : '拖拽图片到此处'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  或点击选择文件 (支持 JPG, PNG, GIF, WebP, BMP，最大10MB)
                </p>
              </div>
            </div>
          )}

          {/* URL Input */}
          {isUrlMode && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  图片URL
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!imageUrl.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认URL
              </button>
            </form>
          )}
        </div>
      )}

      {/* Image Preview */}
      {currentImage && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">图片预览</h3>
              <button
                onClick={clearCurrentImage}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Image */}
              <div className="flex justify-center">
                <img
                  src={currentImage.preview || currentImage.url}
                  alt={currentImage.name}
                  className="max-h-96 rounded-lg shadow-md"
                />
              </div>
              
              {/* Image Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">文件名</dt>
                    <dd className="text-sm text-gray-900">{currentImage.name}</dd>
                  </div>
                  {currentImage.size && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">文件大小</dt>
                      <dd className="text-sm text-gray-900">{formatFileSize(currentImage.size)}</dd>
                    </div>
                  )}
                  {currentImage.type && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">文件类型</dt>
                      <dd className="text-sm text-gray-900">{currentImage.type}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    分析中...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    开始分析
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">分析结果</h3>
              <button
                onClick={handleCopyResult}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4 mr-1" />
                    已复制
                  </>
                ) : (
                  <>
                    <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                    复制
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">生成的提示词</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{analysisResult.prompt}</p>
              </div>
              
              <div className="text-xs text-gray-500">
                分析时间: {analysisResult.timestamp.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">错误</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={clearError}
                  className="text-sm bg-red-100 text-red-800 rounded-md px-2 py-1 hover:bg-red-200"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}