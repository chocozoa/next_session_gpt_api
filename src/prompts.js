// --------- 샘플 프롬프트 ---------
export const sampleSystemPrompt = `# 역할
너는 세계 최고의 광고문구의 성공사유 분석가 이다. 너는 성공한 광고문구를 받아 참고사항을 참고해 광고문구의 성공사유를 밝혀내야 한다.

# 참고사항
1. 성공한 광고문구는 광고문구와 제품으로 이루어져 있다. 어떤 제품의 광고문구인지 참고해서 성공사유를 밝혀야 한다.
2. 구조, 키워드, 톤 이 3가지 측면에서 성공사유를 구체적으로 분석해야 한다. 단순히 어떤 것으로 이루어져 있느냐가 아니라 해당 요소가 왜 성공적인 효과를 발휘했는지 밝혀내야 한다.

그 이외의 말은 절대 하지 않는다.
`;

export function sampleUserPrompt(productName, adCopy) {
    return `성공한 광고문구를 보고 성공사유를 말하라.

# 성공한 광고문구
광고문구 : ${adCopy}
제품 :  ${productName}
`;
}

export const sampleSchema = {
    name: 'ad_copy_analysis',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            reasoning: {
                type: 'object',
                description: '분석 결과, 광고 문구가 잘 된 이유에 대한 논리적 설명',
                properties: {
                    structure: {
                        type: 'string',
                        description: '광고문의 구조적 장점에 대한 분석',
                    },
                    keywords: {
                        type: 'string',
                        description: '핵심 키워드 혹은 특징적인 단어 사용에 대한 분석',
                    },
                    tone: {
                        type: 'string',
                        description: '광고문의 문체 및 어조(톤)가 타겟과 어떻게 잘 맞았는지에 대한 분석',
                    },
                },
                required: ['structure', 'keywords', 'tone'],
                additionalProperties: false,
            },
        },
        required: ['reasoning'],
        additionalProperties: false,
    },
};

// --------- 리뷰 긍/부정 분류 프롬프트 ---------
export const sentimentSystemPrompt = `# 역할
너는 세계 최고의 리뷰 긍부정 분석 전문가다. 
너는 유저에게 리뷰 목록을 받아 참고사항을 참고해 각 리뷰가 긍정적 리뷰인지 부정적 리뷰인지 판단해야 한다.

# 참고사항
1. 반드시 0(부정), 1(긍정)으로만 판단한다.
2. 애매하거나 중립적으로 느껴져도 반드시 0 또는 1 중 하나로 결정해야 한다.
3. 출력은 리뷰 순서에 맞춘 배열이어야 한다.
그 이외의 말은 절대 하지 않는다.
`;

export function sentimentUserPrompt(reviews) {
    return `다음 리뷰들을 0(부정) 또는 1(긍정)으로만 판단하라. 
리뷰는 번호와 함께 제공된다. 
출력은 번호 순서와 동일한 배열로 반환해야 한다.

${reviews.map((r, i) => `${i + 1}번: ${r}`).join('\n')}
`;
}

export const sentimentSchema = {
    name: 'review_sentiment_analysis',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            results: {
                type: 'array',
                description: '리뷰별 긍/부정 여부 (0=부정, 1=긍정)',
                items: {
                    type: 'integer',
                    enum: [0, 1],
                },
            },
        },
        required: ['results'],
        additionalProperties: false,
    },
};
// --------- 리뷰 카테고리 분석 프롬프트 ---------
export const categorySystemPrompt = `# 역할
너는 리뷰 카테고리화 전문가다.
유저에게 주어진 리뷰들을 보고 주요 만족 또는 불만 요인을 카테고리 이름으로만 도출하라.

# 참고사항
1. 카테고리 이름은 짧고 명확해야 한다. (예: "성능", "소음", "디자인")
2. 중복되는 의미는 합쳐서 하나로 만든다.
3. 카테고리 이름만 출력한다.
그 이외의 말은 절대 하지 않는다.
`;

export function categoryUserPrompt(reviews, type = '긍정') {
    return `다음은 ${type} 리뷰 목록이다.
이 리뷰들을 분석해 주요 카테고리 이름을 3~6개 추출하라.

리뷰 목록:
${reviews.map((r, i) => `${i + 1}번: ${r}`).join('\n')}
`;
}

export const categorySchema = {
    name: 'review_category_list',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            categories: {
                type: 'array',
                description: '주요 카테고리 이름 목록',
                items: { type: 'string' },
            },
        },
        required: ['categories'],
        additionalProperties: false,
    },
};

export const mappingSystemPrompt = `# 역할
너는 리뷰 카테고리 분류 전문가다.
주어진 카테고리 목록을 참고하여 각 리뷰가 어떤 카테고리에 해당하는지 번호로만 출력하라.

# 참고사항
1. 입력으로 카테고리 목록과 리뷰 목록이 주어진다.
2. 각 리뷰는 복수의 카테고리에 해당할 수 있다. (예: [1,3])
3. 반드시 카테고리 번호만 배열 형태로 출력한다.
4. 출력은 리뷰 순서와 동일한 배열이어야 한다.
그 이외의 말은 절대 하지 않는다.
`;

export function mappingUserPrompt(categories, reviews, startIndex = 1) {
    return `카테고리 목록:
${categories.map((c, i) => `${i + 1}. ${c}`).join('\n')}

리뷰 목록:
${reviews.map((r, i) => `${startIndex + i}번: ${r}`).join('\n')}

각 리뷰가 속하는 카테고리 번호 배열을 순서대로 출력하라.`;
}

export const mappingSchema = {
    name: 'review_category_mapping',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            mapping: {
                type: 'array',
                description: '리뷰별 카테고리 매핑 결과',
                items: {
                    type: 'array',
                    items: { type: 'integer' },
                },
            },
        },
        required: ['mapping'],
        additionalProperties: false,
    },
};
