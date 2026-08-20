// Internal Link Graph and Orphan Detection Engine

import { ArticleKnowledgeObject } from '../types/article';

export interface LinkAuditResult {
  totalArticles: number;
  totalInternalLinks: number;
  orphanArticles: { slug: string; title: string }[];
  lowIncomingLinkArticles: { slug: string; title: string; incomingCount: number }[];
  linkEquityGraph: Record<string, { incoming: number; outgoing: string[] }>;
}

export const auditInternalLinks = (articles: ArticleKnowledgeObject[]): LinkAuditResult => {
  const linkEquityGraph: Record<string, { incoming: number; outgoing: string[] }> = {};

  articles.forEach(a => {
    linkEquityGraph[a.slug] = {
      incoming: 0,
      outgoing: []
    };
  });

  let totalInternalLinks = 0;

  articles.forEach(sourceArticle => {
    const content = sourceArticle.content || '';
    articles.forEach(targetArticle => {
      if (sourceArticle.slug !== targetArticle.slug) {
        if (content.includes(`/blog/${targetArticle.slug}`) || content.includes(targetArticle.slug)) {
          linkEquityGraph[sourceArticle.slug].outgoing.push(targetArticle.slug);
          linkEquityGraph[targetArticle.slug].incoming++;
          totalInternalLinks++;
        }
      }
    });
  });

  const orphanArticles = articles
    .filter(a => linkEquityGraph[a.slug].incoming === 0)
    .map(a => ({ slug: a.slug, title: a.title }));

  const lowIncomingLinkArticles = articles
    .filter(a => linkEquityGraph[a.slug].incoming > 0 && linkEquityGraph[a.slug].incoming < 2)
    .map(a => ({ slug: a.slug, title: a.title, incomingCount: linkEquityGraph[a.slug].incoming }));

  return {
    totalArticles: articles.length,
    totalInternalLinks,
    orphanArticles,
    lowIncomingLinkArticles,
    linkEquityGraph
  };
};
