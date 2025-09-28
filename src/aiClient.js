// aiClient.js (수정 버전)
import OpenAI from 'openai';
import pRetry from 'p-retry';

export class AiClient {
    constructor({
        apiKey,
        model = 'gpt-4.1',
        timeout = 30_000, // ← 이 값은 클라이언트 옵션으로 전달
        defaultTemperature = 1.0,
    }) {
        this.model = model;
        this.defaultTemperature = defaultTemperature;

        // ✅ timeout은 여기(클라이언트 옵션)로!
        this.ai = new OpenAI({ apiKey, timeout });
    }

    async #call(messages, { temperature, responseFormat }) {
        return await pRetry(
            async () => {
                // ❌ timeout을 바디에 넣지 마세요.
                // 필요하면 두 번째 인자로 { timeout: ... } 를 줄 수 있지만,
                // 이미 클라이언트 레벨에서 설정했으니 생략.
                return await this.ai.chat.completions.create(
                    {
                        model: this.model,
                        messages,
                        temperature: temperature === undefined ? this.defaultTemperature : temperature,
                        response_format: responseFormat ?? undefined,
                    }
                    // , { timeout: 30000 } // ← per-request로 바꾸고 싶으면 이 주석을 해제
                );
            },
            { retries: 2, minTimeout: 500, maxTimeout: 3000 }
        );
    }

    // 텍스트 전용
    async askText(systemPrompt, userPrompt, temperature) {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];
        const res = await this.#call(messages, {
            temperature,
            responseFormat: null,
        });
        return res.choices[0]?.message?.content ?? '';
    }

    // JSON 전용
    async askJson(systemPrompt, userPrompt, schema, temperature) {
        const responseFormat = schema ? { type: 'json_schema', json_schema: schema } : { type: 'json_object' };

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];
        const res = await this.#call(messages, {
            temperature,
            responseFormat,
        });

        const text = res.choices[0]?.message?.content ?? '';
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error(`JSON 파싱 실패: ${e.message}\n--- raw ---\n${text.slice(0, 400)}`);
        }
    }
}
