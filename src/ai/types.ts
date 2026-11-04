import { NatalChart, Palace, Hexagram, TransformationType, Star } from '../domain/types';
import { FlyingTransformation, BirthYearTransformation } from '../domain/tuHoaEngine';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ToolCallTrace {
  toolName: string;
  args: Record<string, any>;
  resultSummary: string;
  executionTimeMs: number;
  timestamp: string;
}

export type ChatWidget =
  | {
      type: 'palace_highlight';
      data: {
        palace: Palace;
        reason: string;
        highlightType: 'focus' | 'alert' | 'opportunity';
      };
    }
  | {
      type: 'star_card';
      data: {
        star: Star;
        palaceName: string;
        roleInChart: string;
      };
    }
  | {
      type: 'transformation_flow';
      data: {
        flow: FlyingTransformation;
        significance: string;
      };
    }
  | {
      type: 'hexagram_card';
      data: {
        hexagram: Hexagram;
        question: string;
      };
    }
  | {
      type: 'fortune_timeline';
      data: {
        currentDecade: { startAge: number; endAge: number; palaceName: string };
        annualForecast: { year: number; canChi: string; keyPalace: string };
        annualTransformations: Array<{ type: TransformationType; star: string; palaceName: string }>;
      };
    }
  | {
      type: 'trace_panel';
      data: {
        traces: ToolCallTrace[];
        methodology: string;
      };
    };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  isStreaming?: boolean;
  widgets?: ChatWidget[];
  suggestedQuestions?: string[];
  calculationTrace?: ToolCallTrace[];
  chartContextId?: string;
}

export interface AISettings {
  provider: 'demo' | 'gemini' | 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  apiEndpoint?: string;
  modelName: string;
  temperature: number;
  school: 'kham_thien' | 'nam_phai';
}
