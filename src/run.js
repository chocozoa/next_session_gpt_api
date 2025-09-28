import 'dotenv/config';
import fs from 'fs';
import { AiClient } from './aiClient.js';
import {
    sampleSystemPrompt,
    sampleUserPrompt,
    sampleSchema,
    sentimentSystemPrompt,
    sentimentUserPrompt,
    sentimentSchema,
    categorySystemPrompt,
    categoryUserPrompt,
    categorySchema,
    mappingSystemPrompt,
    mappingUserPrompt,
    mappingSchema,
} from './prompts.js';

const ai = new AiClient({ apiKey: process.env.OPENAI_API_KEY });

// 텍스트 요청
// const sampleText = await ai.askText(
//     '당신은 베테랑 카피라이터다.',
//     '한 방울 에센스 제품의 임팩트있는 헤드라인 3개.',
//     0.7 // temperature (없으면 defaultTemperature 사용)
// );
// console.log(sampleText);

// // JSON 요청
// const sampleJson = await ai.askJson(
//     sampleSystemPrompt,
//     sampleUserPrompt('리니지M', '모험은 우리를 다시 소년으로'),
//     sampleSchema, // schema
//     0.3 // temperature
// );
// console.log(sampleJson);

// 1. CSV 읽기 (기본 fs, split으로 처리)
const fileContent = fs.readFileSync('voc.csv', 'utf-8').trim().split('\n');

// 헤더 제거 후 각 줄에서 content만 추출 (3번째 칼럼)
const reviews = fileContent
    .slice(1)
    .map((line) => {
        const cols = line.split(','); // 단순 split
        return cols[2]?.replace(/^"|"$/g, '').trim(); // 큰따옴표 제거
    })
    .filter(Boolean); // 빈 값 제거
console.log('리뷰 리스트:', reviews);
console.log('리뷰 개수:', reviews.length);
