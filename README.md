# 图片反推提示词应用 (Image to Prompt)

一个基于React的Web应用，可以从上传的图片中生成详细的提示词描述，帮助用户创建高质量的AI绘图提示词。

## 功能特点

- **图片处理**：支持拖拽上传、URL输入、自动压缩和预览
- **AI分析**：使用OpenRouter API（默认模型：google/gemma-3-27b-it:free）分析图片并生成提示词
- **图片托管**：集成ImgBB图床服务，自动上传图片获取永久链接
- **历史记录**：本地保存分析历史，支持搜索、筛选、排序和批量操作
- **多语言支持**：支持中文和英文界面及提示词生成
- **响应式设计**：适配各种设备屏幕尺寸
- **本地存储**：所有数据和设置保存在本地，保护隐私

## 技术栈

- **前端框架**：React 18 + TypeScript
- **路由**：React Router v7
- **状态管理**：Zustand
- **样式**：Tailwind CSS + Headless UI
- **HTTP请求**：Axios
- **图片处理**：browser-image-compression
- **构建工具**：Vite

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

## 使用指南

1. **配置API密钥**：
   - 在"设置"页面配置OpenRouter API密钥（必需）
   - 可选配置ImgBB API密钥用于图片托管

2. **上传图片**：
   - 在"分析"页面拖拽上传图片或输入图片URL
   - 支持JPG、PNG、GIF、WebP、BMP格式，最大10MB

3. **生成提示词**：
   - 点击"开始分析"按钮，AI将分析图片并生成详细提示词
   - 可在设置中选择语言（中/英）和输出格式

4. **管理历史记录**：
   - 在"历史"页面查看、搜索和管理所有分析记录
   - 支持导入/导出历史记录

## API密钥获取

- **OpenRouter API**：访问 [OpenRouter](https://openrouter.ai/keys) 注册并获取API密钥
- **ImgBB API**：访问 [ImgBB API](https://api.imgbb.com/) 注册并获取API密钥

## 许可证

MIT
