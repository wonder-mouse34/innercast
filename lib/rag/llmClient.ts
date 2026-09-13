import { z } from 'zod';

/**
 * Client for a self-hosted, OpenAI-compatible inference server.
 *
 * Works with Ollama (`/v1`), LM Studio, llama.cpp's server, vLLM, TGI and
 * anything else exposing POST /chat/completions and GET /models. Nothing is
 * sent anywhere except the base URL the user configured.
 */

export type ModelSettings = {
  enabled: boolean;
  baseUrl: string;
  model: string;
  apiKey: string;
  temperature: number;
  jsonMode: boolean;
  timeoutMs: number;
};

export const MODEL_PRESETS: { label: string; baseUrl: string; hint: string }[] = [
  { label: 'Ollama', baseUrl: 'http://localhost:11434/v1', hint: 'ollama serve' },
  { label: 'LM Studio', baseUrl: 'http://localhost:1234/v1', hint: 'Local server tab' },
  { label: 'llama.cpp', baseUrl: 'http://localhost:8080/v1', hint: 'llama-server' },
  { label: 'vLLM', baseUrl: 'http://localhost:8000/v1', hint: 'vllm serve' },
];

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  enabled: false,
  baseUrl: '',
  model: '',
  apiKey: '',
  temperature: 0.4,
  jsonMode: true,
  timeoutMs: 45_000,
};

export function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /^https?:\/\//.test(trimmed) ? trimmed : `http://${trimmed}`;
}

function headers(settings: ModelSettings): Record<string, string> {
  const result: Record<string, string> = { 'Content-Type': 'application/json' };
  if (settings.apiKey.trim().length > 0) {
    result.Authorization = `Bearer ${settings.apiKey.trim()}`;
  }
  return result;
}

async function withTimeout<T>(
  timeoutMs: number,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export function describeRequestError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'AbortError') return 'The model did not answer in time.';
    if (
      error.message.includes('Network request failed') ||
      error.message.includes('Failed to fetch')
    ) {
      return 'Could not reach that address from this device.';
    }
    return error.message;
  }
  return 'Unknown error contacting the model.';
}

const modelsResponseSchema = z.object({
  data: z.array(z.object({ id: z.string() })).optional(),
  models: z.array(z.object({ name: z.string() })).optional(),
});

export type ConnectionResult = { ok: true; models: string[] } | { ok: false; error: string };

/** GET /models — used by the settings screen's connection test. */
export async function testConnection(settings: ModelSettings): Promise<ConnectionResult> {
  const baseUrl = normalizeBaseUrl(settings.baseUrl);
  if (!baseUrl) return { ok: false, error: 'Add the address of your model server first.' };

  try {
    const response = await withTimeout(Math.min(settings.timeoutMs, 12_000), (signal) =>
      fetch(`${baseUrl}/models`, { method: 'GET', headers: headers(settings), signal }),
    );
    if (!response.ok) {
      return {
        ok: false,
        error: `Server replied ${response.status} ${response.statusText}`.trim(),
      };
    }
    const parsed = modelsResponseSchema.safeParse(await response.json());
    if (!parsed.success) return { ok: true, models: [] };
    const ids = parsed.data.data?.map((entry) => entry.id) ?? [];
    const names = parsed.data.models?.map((entry) => entry.name) ?? [];
    return { ok: true, models: [...new Set([...ids, ...names])] };
  } catch (error) {
    return { ok: false, error: describeRequestError(error) };
  }
}

const chatResponseSchema = z.object({
  model: z.string().optional(),
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string().nullable().optional() }).optional(),
        text: z.string().optional(),
      }),
    )
    .min(1),
});

export type ChatResult =
  | { ok: true; content: string; model?: string }
  | { ok: false; error: string };

export async function chatCompletion(
  settings: ModelSettings,
  messages: { role: 'system' | 'user'; content: string }[],
): Promise<ChatResult> {
  const baseUrl = normalizeBaseUrl(settings.baseUrl);
  if (!baseUrl) return { ok: false, error: 'No model server address configured.' };
  if (settings.model.trim().length === 0) {
    return { ok: false, error: 'No model name configured.' };
  }

  const body: Record<string, unknown> = {
    model: settings.model.trim(),
    messages,
    temperature: settings.temperature,
    stream: false,
    max_tokens: 900,
  };
  if (settings.jsonMode) body.response_format = { type: 'json_object' };

  try {
    const response = await withTimeout(settings.timeoutMs, (signal) =>
      fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: headers(settings),
        body: JSON.stringify(body),
        signal,
      }),
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      const short = detail.slice(0, 180);
      return {
        ok: false,
        error: `Server replied ${response.status}${short ? `: ${short}` : ''}`,
      };
    }

    const parsed = chatResponseSchema.safeParse(await response.json());
    if (!parsed.success) return { ok: false, error: 'The reply was not in a shape we understand.' };

    const choice = parsed.data.choices[0];
    const content = choice.message?.content ?? choice.text ?? '';
    if (content.trim().length === 0) return { ok: false, error: 'The model returned nothing.' };

    return { ok: true, content, model: parsed.data.model };
  } catch (error) {
    return { ok: false, error: describeRequestError(error) };
  }
}

const recommendationSchema = z.object({
  id: z.string(),
  /** Which person on screen the pick is built around. */
  characterId: z.string().optional().nullable(),
  reason: z.string(),
  /** One sentence on what the person and that character share. */
  characterLink: z.string().optional().nullable(),
  caution: z.string().optional().nullable(),
});

const payloadSchema = z.object({
  recommendations: z.array(recommendationSchema).min(1),
});

export type ParsedRecommendation = z.infer<typeof recommendationSchema>;

/**
 * Pull the JSON payload out of a model reply. Small local models often wrap it
 * in prose or a fenced code block, so the first balanced object is extracted.
 */
export function parseModelPayload(content: string): ParsedRecommendation[] | null {
  const candidates: string[] = [content];

  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(content);
  if (fenced?.[1]) candidates.push(fenced[1]);

  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start !== -1 && end > start) candidates.push(content.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      const parsed = payloadSchema.safeParse(JSON.parse(candidate));
      if (parsed.success) return parsed.data.recommendations;
    } catch {
      continue;
    }
  }
  return null;
}
