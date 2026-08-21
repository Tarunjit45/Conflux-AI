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

