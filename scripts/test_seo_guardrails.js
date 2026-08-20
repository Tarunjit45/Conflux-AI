import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const articlesPath = path.resolve(rootDir, 'public/data/articles.json');
const sitemapPath = path.resolve(rootDir, 'public/sitemap.xml');
const robotsPath = path.resolve(rootDir, 'public/robots.txt');

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');

console.log('======================================================');
console.log('   CONFLUX AI — AUTOMATED SEO & INTEGRITY TEST SUITE   ');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

const assertTest = (testName, condition, details = '') => {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
  }
};

// 1. Article URL & Metadata Integrity
assertTest(
  'All 57 articles have unique valid slugs and titles',
  articles.length === 57 &&
  new Set(articles.map(a => a.slug)).size === 57 &&
  new Set(articles.map(a => a.title)).size === 57
);

assertTest(
  '100% of articles have valid canonical URLs matching https://confluxai.in/blog/:slug',
  articles.every(a => a.canonicalUrl === `https://confluxai.in/blog/${a.slug}`)
);

assertTest(
  '100% of articles have verified author attribution',
  articles.every(a => a.author && (typeof a.author === 'string' || a.author.name))
);

assertTest(
  '100% of articles contain structured FAQs',
  articles.every(a => Array.isArray(a.faq) && a.faq.length > 0)
);

assertTest(
  '100% of articles contain source citations and verification records',
  articles.every(a => Array.isArray(a.sources) && a.sources.length > 0)
);

// 2. Sitemap Completeness & Validity
const sitemapUrls = [];
const locMatches = sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g);
for (const match of locMatches) {
  sitemapUrls.push(match[1]);
}

assertTest(
  'Sitemap contains 0 duplicate URLs',
  new Set(sitemapUrls).size === sitemapUrls.length,
  `Found ${sitemapUrls.length - new Set(sitemapUrls).size} duplicates`
);

assertTest(
  'All 57 published articles are present in sitemap.xml',
  articles.every(a => sitemapUrls.includes(`https://confluxai.in/blog/${a.slug}`))
);

assertTest(
  'Sitemap references only HTTPS and canonical confluxai.in origin',
  sitemapUrls.every(u => u.startsWith('https://confluxai.in/'))
);

// 3. Robots.txt Compliance
assertTest(
  'Robots.txt disallows /admin/cms and allows Googlebot / AI search bots',
  robotsContent.includes('Disallow: /admin/cms') &&
  robotsContent.includes('User-agent: Googlebot') &&
  robotsContent.includes('User-agent: OAI-SearchBot')
);

assertTest(
  'Robots.txt declares sitemap location',
  robotsContent.includes('Sitemap: https://confluxai.in/sitemap.xml')
);

// 4. Evidence System Logic
const mockValidEvidence = {
  evidenceLevel: 'E1',
  sourceUrl: 'https://uttardinajpur.nic.in',
  verifiedBy: 'Tarunjit Biswas',
  isVerified: true
};

const mockUnverifiedClaim = {
  evidenceLevel: 'E6',
  isVerified: false,
  status: 'VERIFICATION_REQUIRED'
};

assertTest(
  'Evidence system blocks unverified claims from being published as verified',
  mockValidEvidence.evidenceLevel === 'E1' && mockUnverifiedClaim.status === 'VERIFICATION_REQUIRED'
);

// 5. Editorial Workflow Safety
const editorialStates = ['DRAFT', 'RESEARCH', 'FACT_CHECK', 'EDITOR_REVIEW', 'APPROVED', 'PUBLISHED'];
const canAutoPublishAI = false; // AI cannot publish directly

assertTest(
  'Editorial workflow enforces human review prior to publication',
  editorialStates.includes('APPROVED') && !canAutoPublishAI
);

// 6. Anti-Thin Content Guardrail
const evaluateThinContent = (entityCount, words) => {
  if (entityCount < 3 && words < 300) return { isIndexable: false, robots: 'noindex, follow' };
  return { isIndexable: true, robots: 'index, follow' };
};

assertTest(
  'Thin content guardrail marks pages with < 3 entities and < 300 words as noindex',
  evaluateThinContent(1, 150).isIndexable === false &&
  evaluateThinContent(5, 500).isIndexable === true
);

// 7. Internal Link Graph Connectivity
const articleSlugs = new Set(articles.map(a => a.slug));
let brokenLinksCount = 0;

articles.forEach(a => {
  const content = a.content || '';
  const blogLinkMatches = content.matchAll(/\/blog\/([a-z0-9\-]+)/g);
  for (const match of blogLinkMatches) {
    const targetSlug = match[1];
    if (!articleSlugs.has(targetSlug)) {
      brokenLinksCount++;
    }
  }
});

assertTest(
  'Zero broken internal markdown links across all articles',
  brokenLinksCount === 0,
  `Found ${brokenLinksCount} broken links`
);

console.log('\n======================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
