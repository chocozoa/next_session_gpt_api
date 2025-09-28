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
