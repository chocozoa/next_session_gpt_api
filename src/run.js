import 'dotenv/config';
import { AiClient } from './aiClient.js';
import { sampleSystemPrompt, sampleUserPrompt, sampleSchema } from './prompts.js';

const ai = new AiClient({ apiKey: process.env.OPENAI_API_KEY });

// 텍스트 요청
const sampleText = await ai.askText(
    '당신은 베테랑 카피라이터다.',
    '한 방울 에센스 제품의 임팩트있는 헤드라인 3개.',
    0.7 // temperature (없으면 defaultTemperature 사용)
);
console.log(sampleText);

// JSON 요청
const sampleJson = await ai.askJson(
    sampleSystemPrompt,
    sampleUserPrompt('리니지M', '모험은 우리를 다시 소년으로'),
    sampleSchema, // schema
    0.3 // temperature
);
console.log(sampleJson);
