import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAiRecipeParserService {
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  isEnabled(): boolean {
    return !!this.apiKey;
  }

  async parseFromImage(imageUrl: string, title?: string) {
    if (!this.isEnabled()) {
      return null;
    }
    const prompt = title
      ? `Extract a complete recipe from this image. Title: "${title}". Return as JSON with title, description, ingredients (array of {name, quantity, unit}), prepTime, calories, tags.`
      : 'Extract a complete recipe from this image. Return as JSON with title, description, ingredients (array of {name, quantity, unit}), prepTime, calories, tags.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return JSON.parse(data.choices[0].message.content);
  }

  async parseFromVideo(videoUrl: string) {
    if (!this.isEnabled()) {
      return null;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-audio-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Transcribe this video and extract a complete recipe. Return as JSON with title, description, ingredients (array of {name, quantity, unit}), prepTime, calories, tags.',
              },
              { type: 'text', text: `Video URL: ${videoUrl}` },
            ],
          },
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return JSON.parse(data.choices[0].message.content);
  }

  async translateRecipe(recipeText: string, targetLanguage: string = 'Kinyarwanda') {
    if (!this.isEnabled()) {
      return null;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Translate this recipe to ${targetLanguage}. Keep the structure and measurements intact:\n\n${recipeText}`,
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0].message.content;
  }
}
