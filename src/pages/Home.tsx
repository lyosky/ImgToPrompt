import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PhotoIcon, 
  SparklesIcon, 
  ClockIcon, 
  CogIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const features = [
  {
    name: '智能图片分析',
    description: '使用先进的AI模型分析图片内容，生成详细的描述和提示词',
    icon: SparklesIcon,
  },
  {
    name: '多种上传方式',
    description: '支持拖拽上传、文件选择和URL输入，灵活便捷',
    icon: PhotoIcon,
  },
  {
    name: '历史记录管理',
    description: '自动保存分析历史，支持搜索和批量管理',
    icon: ClockIcon,
  },
  {
    name: '个性化设置',
    description: '自定义API配置、输出格式和语言偏好',
    icon: CogIcon,
  },
];

const exampleImages = [
  {
    src: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20landscape%20with%20mountains%20and%20lake%20at%20sunset&image_size=landscape_4_3',
    alt: '风景示例',
    title: '自然风景',
  },
  {
    src: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20architecture%20building%20with%20glass%20facade&image_size=landscape_4_3',
    alt: '建筑示例',
    title: '现代建筑',
  },
  {
    src: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20sitting%20on%20windowsill%20with%20sunlight&image_size=landscape_4_3',
    alt: '动物示例',
    title: '可爱动物',
  },
];

export function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            图片反推
            <span className="text-blue-600">提示词</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            使用AI技术分析图片内容，自动生成详细的描述和提示词。
            帮助设计师、创作者和AI绘画爱好者快速获取灵感和素材描述。
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/analyze"
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
            >
              开始分析
              <ArrowRightIcon className="ml-2 h-4 w-4 inline" />
            </Link>
            <Link
              to="/history"
              className="text-base font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors duration-200"
            >
              查看历史 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              强大功能
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              一站式图片分析解决方案
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              集成多种先进技术，为您提供专业的图片分析和提示词生成服务
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Example Images Section */}
      <div className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              快速体验
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              示例图片分析
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              点击下方示例图片，快速体验AI图片分析功能
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {exampleImages.map((image, index) => (
              <Link
                key={index}
                to="/analyze"
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {image.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    点击分析此类型图片
                  </p>
                </div>
                <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              准备开始了吗？
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              立即上传您的图片，体验AI驱动的智能分析功能
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/analyze"
                className="rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors duration-200"
              >
                立即开始
              </Link>
              <Link
                to="/settings"
                className="text-base font-semibold leading-6 text-white hover:text-blue-100 transition-colors duration-200"
              >
                配置设置 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}