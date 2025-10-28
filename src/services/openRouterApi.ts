import axios from 'axios';
import { OpenRouterResponse } from '../types';

// OpenRouter API配置
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 默认模型
export const DEFAULT_MODEL = 'google/gemma-3-27b-it:free';//'meta-llama/llama-4-maverick:free';

// 提示词模板
const PROMPT_TEMPLATES = {
  zh: '请你同时扮演「图片提示词反推专家」和「合规审核优化师」，处理我提供的图片（或图片描述 / 原违规提示词）：先拆解图片 8 个核心视觉维度（主体信息、衣物 / 材质、场景环境、艺术风格、构图视角、色彩光影、细节特效、氛围情绪），确保捕捉所有关键视觉细节，不遗漏信息；基于拆解结果，按以下规则完成合规优化：暴露衣物替换为日常款（如长袖 T 恤 / 直筒裤 / 连衣裙 / 泳衣 / 比基尼），暧昧姿势调整为自然动作（如站立、微笑平视），私密场景优化为中性场景（如客厅、户外草地），词汇违规：删除 “性感 / 诱惑 / 暴露 / 挑逗” 等词，替换 “紧身 / 深 V” 为 “合身 / 圆领”；氛围违规：“性感氛围”→ 改为 “舒适日常氛围”，“暧昧光影”→ 改为 “柔和自然光”。无需展示上述拆解和优化过程，直接将合规后的所有信息整合成一段逻辑连贯、可直接用于 MidJourney/Stable Diffusion 的提示词，最终仅输出格式为「最终合规提示词」的内容，确保无任何 NSFW 元素且高度还原原图视觉风格、构图、光影和氛围。请使用中文回答',
  en: 'Please act as both a "Image Prompt Reverse-Engineering Expert" and a "Compliance Review Optimizer" to process the image (or image description/original non-compliant prompt) I provide:First, disassemble the image into 8 core visual dimensions (subject information, clothing/materials, scene environment, artistic style, composition perspective, color and lighting, detailed effects, atmosphere and emotion), ensuring that all key visual details are captured without omitting any information;Based on the disassembly results, complete compliance optimization according to the following rules: Replace revealing clothing with daily styles (such as long-sleeved T-shirts/straight-leg pants/dresses/swimsuits/bikinis); adjust ambiguous poses to natural actions (such as standing, smiling and looking straight); optimize private scenes to neutral scenes (such as living room, outdoor grass); for non-compliant vocabulary: delete words like "sexy/tempting/revealing/teasing" and replace "tight/deep V" with "fitted/round neck";For atmosphere violations: "sexy atmosphere" → changed to "comfortable daily atmosphere"; "ambiguous lighting" → changed to "soft natural light".There is no need to show the above disassembly and optimization process. Directly integrate all compliant information into a coherent prompt that can be directly used for MidJourney/Stable Diffusion. Finally, only output the content in the format of "Final Compliant Prompt", ensuring that there are no NSFW elements and that it highly restores the original image\'s visual style, composition, lighting and atmosphere. Please answer in English',
};

/**
 * OpenRouter API服务类
 */
class OpenRouterApiService {
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
   * 分析图片并生成提示词
   */
  async analyzeImage(
    imageData: string | File,
    options: {
      model?: string;
      language?: 'zh' | 'en';
      customPrompt?: string;
    } = {}
  ): Promise<string> {
    if (!this.validateApiKey()) {
      throw new Error('请先设置OpenRouter API Key');
    }

    const {
      model = DEFAULT_MODEL,
      language = 'zh',
      customPrompt,
    } = options;

    const prompt = customPrompt || PROMPT_TEMPLATES[language];

    try {
      let imageUrl: string;
      
      // 处理不同类型的图片输入
      if (typeof imageData === 'string') {
        // 如果是URL字符串，直接使用
        imageUrl = imageData;
      } else {
        // 如果是File对象，转换为base64 data URL
        const base64 = await this.fileToBase64(imageData);
        imageUrl = `data:${imageData.type};base64,${base64}`;
      }

      console.log('OpenRouter API Request:', {
        model,
        imageUrl: imageUrl.substring(0, 100) + '...',
        prompt: prompt.substring(0, 100) + '...',
        headers: {
          'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Image to Prompt App',
        }
      });

      const requestBody = {
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };

      const response = await axios.post<OpenRouterResponse>(
        OPENROUTER_API_URL,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Image to Prompt App',
          },
          timeout: 30000, // 30秒超时
        }
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('API返回数据格式错误');
      }

      const content = response.data.choices[0].message.content;
      if (!content) {
        throw new Error('API未返回有效内容');
      }

      return content.trim();
    } catch (error) {
      console.error('OpenRouter API error:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;
        const message = responseData?.error?.message || error.message;
        
        console.error('API Error Details:', {
          status,
          statusText: error.response?.statusText,
          data: responseData,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          }
        });
        
        switch (status) {
          case 401:
            throw new Error('API Key无效或已过期');
          case 403:
            throw new Error(`API访问被拒绝，请检查权限。详细信息: ${message}`);
          case 429:
            throw new Error('API调用频率超限，请稍后重试');
          case 500:
            throw new Error('API服务器内部错误');
          default:
            throw new Error(`API请求失败 (${status}): ${message}`);
        }
      }
      
      throw new Error('网络连接失败，请检查网络设置');
    }
  }

  /**
   * 将File对象转换为base64字符串
   */
  private fileToBase64(file: File): Promise<string> {
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
   * 测试API Key是否有效
   */
  async testApiKey(apiKey: string): Promise<boolean> {
    const originalKey = this.apiKey;
    this.setApiKey(apiKey);
    
    try {
      // 使用一个简单的测试请求
      await axios.post(
        OPENROUTER_API_URL,
        {
          model: DEFAULT_MODEL,
          messages: [
            {
              role: 'user',
              content: 'Hello',
            },
          ],
          max_tokens: 1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Image to Prompt App',
          },
          timeout: 10000,
        }
      );
      
      return true;
    } catch (error) {
      console.error('API Key test failed:', error);
      return false;
    } finally {
      this.setApiKey(originalKey);
    }
  }

  /**
   * 获取可用模型列表
   */
  async getAvailableModels(): Promise<string[]> {
    // 由于OpenRouter的模型列表API可能需要特殊权限，这里返回常用的免费模型
    return [
      'meta-llama/llama-4-maverick:free',
      'google/gemini-flash-1.5',
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo',
    ];
  }

  /**
   * 获取API使用统计（如果支持）
   */
  async getUsageStats(): Promise<any> {
    // 这个功能需要OpenRouter支持，目前返回空对象
    return {};
  }
}

// 导出单例实例
export const openRouterApi = new OpenRouterApiService();