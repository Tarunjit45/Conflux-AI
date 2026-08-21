import { ArticleKnowledgeObject } from '../types/article';
import staticArticlesJson from '../public/data/articles.json';

export const STATIC_ARTICLES: ArticleKnowledgeObject[] = staticArticlesJson as unknown as ArticleKnowledgeObject[];

export function getArticleBySlug(slugOrId: string): ArticleKnowledgeObject | undefined {
  if (!slugOrId) return undefined;
  
  // Clean, decode, and normalize the incoming slug
  const normalized = decodeURIComponent(slugOrId)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\/+$/, '');

  // 1. Exact match by slug or id
  const exact = STATIC_ARTICLES.find(
    a => a.slug.toLowerCase().trim() === normalized || a.id.toLowerCase().trim() === normalized
  );
  if (exact) return exact;

  // 2. Fuzzy / partial match in case of minor slug variances
  const cleanKey = normalized.replace(/[^a-z0-9]/g, '');
  return STATIC_ARTICLES.find(a => {
    const aKey = a.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    return aKey === cleanKey || a.id.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanKey;
  });
}

/**
 * Normalizes all district identifiers attached to an article into clean district slugs
 * e.g. ['dist-bankura', 'bankura'] -> ['bankura']
 */
export function getNormalizedDistricts(article: ArticleKnowledgeObject): string[] {
  const set = new Set<string>();
  
  // 1. Structured districts array
  if (Array.isArray(article.districts)) {
    article.districts.forEach(d => {
      if (d) set.add(d.toLowerCase().replace(/^dist-/, '').trim());
    });
  }
  
  // 2. Fallback to districtIds / locationIds
  if (Array.isArray(article.districtIds)) {
    article.districtIds.forEach(d => {
      if (d) set.add(d.toLowerCase().replace(/^dist-/, '').trim());
    });
  }
  
  return Array.from(set);
}

/**
 * Retrieves all articles legitimately relevant to a specific West Bengal district.
 * Sorted by: publishedAt / updatedAt (most recent first).
 */
export function getArticlesByDistrict(districtSlug: string, limit?: number): ArticleKnowledgeObject[] {
  if (!districtSlug) return [];
  
  const cleanDistrict = districtSlug.toLowerCase().replace(/^dist-/, '').trim();
  
  const matching = STATIC_ARTICLES.filter(article => {
    // Only published articles
    if (article.status && article.status !== 'PUBLISHED') return false;
    
    const districts = getNormalizedDistricts(article);
    return districts.includes(cleanDistrict);
  });
  
  // Sort: most recently published/updated first
  const sorted = matching.sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.updatedAt || 0).getTime();
    const dateB = new Date(b.publishedAt || b.updatedAt || 0).getTime();
    return dateB - dateA;
  });
  
  return typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;
}

/**
 * Returns the exact dynamic count of published articles for a given district
 */
export function getDistrictArticleCount(districtSlug: string): number {
  return getArticlesByDistrict(districtSlug).length;
}

/**
 * Intelligent Related Articles Engine:
 * Ranks candidates by topical overlap, shared district, locality, category, and search intent.
 */
export function getRelatedArticles(
  currentArticle: ArticleKnowledgeObject,
  limit = 4
): ArticleKnowledgeObject[] {
  if (!currentArticle) return [];

  const currentDistricts = getNormalizedDistricts(currentArticle);
  const currentLocalities = (currentArticle.localities || []).map(l => l.toLowerCase());
  const currentTopics = (currentArticle.topics || []).map(t => t.toLowerCase());
  const currentCategory = (currentArticle.category || '').toLowerCase();
  const currentIntent = currentArticle.primaryIntent || '';

  const candidates = STATIC_ARTICLES.filter(
    a => a.slug !== currentArticle.slug && a.id !== currentArticle.id && a.status !== 'ARCHIVED'
  );

  const scored = candidates.map(candidate => {
    let score = 0;
    const candDistricts = getNormalizedDistricts(candidate);
    const candLocalities = (candidate.localities || []).map(l => l.toLowerCase());
    const candTopics = (candidate.topics || []).map(t => t.toLowerCase());
    const candCategory = (candidate.category || '').toLowerCase();
    const candIntent = candidate.primaryIntent || '';

    // District match: +6 points per match
    candDistricts.forEach(d => {
      if (currentDistricts.includes(d)) score += 6;
    });

    // Locality match: +5 points per match
    candLocalities.forEach(l => {
      if (currentLocalities.includes(l)) score += 5;
    });

    // Topic overlap: +4 points per match
    candTopics.forEach(t => {
      if (currentTopics.includes(t)) score += 4;
    });

    // Same category: +3 points
    if (candCategory && currentCategory && candCategory === currentCategory) {
      score += 3;
    }

    // Same primary search intent: +2 points
    if (candIntent && currentIntent && candIntent === currentIntent) {
      score += 2;
    }

    // Same language: +1 point
    if (candidate.language === currentArticle.language) {
      score += 1;
    }

    return { candidate, score };
  });

  // Sort by highest score, then by most recent date
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const dateA = new Date(a.candidate.publishedAt || a.candidate.updatedAt || 0).getTime();
    const dateB = new Date(b.candidate.publishedAt || b.candidate.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  return scored.slice(0, limit).map(s => s.candidate);
}

export interface TopicClusterItem {
  name: string;
  count: number;
  sampleArticleSlug: string;
}

/**
 * Extracts verified topic clusters for a district based on published articles
 */
export function getDistrictTopicClusters(districtSlug: string): TopicClusterItem[] {
  if (!districtSlug) return [];
  const districtArticles = getArticlesByDistrict(districtSlug);
  const topicCountMap = new Map<string, { count: number; sampleSlug: string }>();

  districtArticles.forEach(art => {
    const combinedTopics = [
      ...(art.topics || []),
      ...(art.category ? [art.category] : [])
    ];

    combinedTopics.forEach(t => {
      const clean = t.trim();
      if (!clean) return;
      const existing = topicCountMap.get(clean);
      if (existing) {
        existing.count++;
      } else {
        topicCountMap.set(clean, { count: 1, sampleSlug: art.slug });
      }
    });
  });

  return Array.from(topicCountMap.entries())
    .map(([name, val]) => ({ name, count: val.count, sampleArticleSlug: val.sampleSlug }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Returns popular / cornerstone articles for a district
 */
export function getPopularDistrictArticles(districtSlug: string, limit = 3): ArticleKnowledgeObject[] {
  const allDistrictArticles = getArticlesByDistrict(districtSlug);
  // Sort by reactions or content length / depth
  const sorted = [...allDistrictArticles].sort((a, b) => {
    const scoreA = (a.reactions || 0) + (a.faq?.length || 0) * 2 + (a.sources?.length || 0);
    const scoreB = (b.reactions || 0) + (b.faq?.length || 0) * 2 + (b.sources?.length || 0);
    return scoreB - scoreA;
  });
  return sorted.slice(0, limit);
}


