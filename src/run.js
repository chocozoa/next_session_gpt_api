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

// 2. 긍정/부정 분류
function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

const reviewChunks = chunkArray(reviews, 10);

const allResults = []; // 전체 결과 모으기

for (let i = 0; i < reviewChunks.length; i++) {
    const chunk = reviewChunks[i];
    const result = await ai.askJson(sentimentSystemPrompt, sentimentUserPrompt(chunk), sentimentSchema, 0);
    allResults.push(...result.results);
}

// 총계
const positive = allResults.filter((r) => r === 1).length;
const negative = allResults.filter((r) => r === 0).length;
const total = allResults.length;

console.log(`긍정: ${positive}, 부정: ${negative}`);
console.log(`비율: 긍정 ${((positive / total) * 100).toFixed(1)}% / 부정 ${((negative / total) * 100).toFixed(1)}%`);

// 긍정/부정 리뷰 분리
const positiveReviews = reviews.filter((_, i) => allResults[i] === 1);
const negativeReviews = reviews.filter((_, i) => allResults[i] === 0);

const posChunks = chunkArray(positiveReviews, 10);
const negChunks = chunkArray(negativeReviews, 10);

let posCategories = [];
let negCategories = [];

// 긍정 카테고리 뽑기
for (let i = 0; i < posChunks.length; i++) {
    const result = await ai.askJson(categorySystemPrompt, categoryUserPrompt(posChunks[i], '긍정'), categorySchema, 0);
    posCategories.push(...result.categories);
}

// 부정 카테고리 뽑기
for (let i = 0; i < negChunks.length; i++) {
    const result = await ai.askJson(categorySystemPrompt, categoryUserPrompt(negChunks[i], '부정'), categorySchema, 0);
    negCategories.push(...result.categories);
}

// 중복 제거 (기초)
posCategories = [...new Set(posCategories)];
negCategories = [...new Set(negCategories)];

console.log('긍정 카테고리:', posCategories);
console.log('부정 카테고리:', negCategories);

// 긍정 리뷰 chunk로 나누기
let posMapping = [];

for (let i = 0; i < posChunks.length; i++) {
    const chunk = posChunks[i];
    const result = await ai.askJson(
        mappingSystemPrompt,
        mappingUserPrompt(posCategories, chunk, i * 10 + 1),
        mappingSchema,
        0
    );
    posMapping.push(...result.mapping);
}

console.log('긍정 리뷰 매핑:', posMapping);

// 부정 리뷰 chunk로 나누기
let negMapping = [];

for (let i = 0; i < negChunks.length; i++) {
    const chunk = negChunks[i];
    const result = await ai.askJson(
        mappingSystemPrompt,
        mappingUserPrompt(negCategories, chunk, i * 10 + 1),
        mappingSchema,
        0
    );
    negMapping.push(...result.mapping);
}

console.log('부정 리뷰 매핑:', negMapping);

function calculateCategoryRatios(categories, mapping) {
    const counts = new Array(categories.length).fill(0);

    // 매핑 결과 돌면서 카운트
    mapping.forEach((arr) => {
        arr.forEach((idx) => {
            counts[idx - 1]++; // 카테고리 번호는 1부터 시작
        });
    });

    // 전체 리뷰 개수
    const total = mapping.length;

    // 비율 계산
    const ratios = counts.map((c) => (c / total) * 100);

    // 결과 구조화
    return categories.map((cat, i) => ({
        category: cat,
        count: counts[i],
        ratio: ratios[i].toFixed(1) + '%',
    }));
}
const posSummary = calculateCategoryRatios(posCategories, posMapping);
const negSummary = calculateCategoryRatios(negCategories, negMapping);

console.log('긍정 카테고리 요약:', posSummary);
console.log('부정 카테고리 요약:', negSummary);
