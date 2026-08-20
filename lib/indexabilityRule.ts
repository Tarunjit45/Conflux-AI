// Indexability and Anti-Thin Content Guardrail System

export interface LocalityIndexabilityCheck {
  isIndexable: boolean;
  reason: string;
  verifiedEntityCount: number;
  wordCount: number;
  hasLocalContext: boolean;
}

export const evaluateLocalityIndexability = (params: {
  verifiedEntityCount: number;
  wordCount: number;
  hasLocalContext: boolean;
  status: string;
}): LocalityIndexabilityCheck => {
  if (params.status !== 'PUBLISHED') {
    return {
      isIndexable: false,
      reason: 'Status is not PUBLISHED',
      verifiedEntityCount: params.verifiedEntityCount,
      wordCount: params.wordCount,
      hasLocalContext: params.hasLocalContext
    };
  }

  // Minimum threshold: at least 3 verified entities OR 300 words of authentic local context
  if (params.verifiedEntityCount < 3 && params.wordCount < 300) {
    return {
      isIndexable: false,
      reason: 'Thin content threshold: requires >= 3 verified entities or >= 300 words of local context',
      verifiedEntityCount: params.verifiedEntityCount,
      wordCount: params.wordCount,
      hasLocalContext: params.hasLocalContext
    };
  }

  if (!params.hasLocalContext) {
    return {
      isIndexable: false,
      reason: 'Missing authentic local business / cultural context',
      verifiedEntityCount: params.verifiedEntityCount,
      wordCount: params.wordCount,
      hasLocalContext: false
    };
  }

  return {
    isIndexable: true,
    reason: 'Meets comprehensive local authority indexability standards',
    verifiedEntityCount: params.verifiedEntityCount,
    wordCount: params.wordCount,
    hasLocalContext: true
  };
};
