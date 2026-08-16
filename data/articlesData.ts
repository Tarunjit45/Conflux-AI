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
