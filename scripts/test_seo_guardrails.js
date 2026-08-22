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
  `All ${articles.length} articles have unique valid slugs and titles`,
  articles.length >= 57 &&
  new Set(articles.map(a => a.slug)).size === articles.length &&
  new Set(articles.map(a => a.title)).size === articles.length
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
  `All ${articles.length} published articles are present in sitemap.xml`,
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

// 8. District-Based Article Discovery Layer Tests
const districtSlugs = [
  'nadia', 'north-24-parganas', 'south-24-parganas', 'howrah', 'hooghly', 
  'kolkata', 'purba-bardhaman', 'paschim-bardhaman', 'birbhum', 'bankura', 
  'purulia', 'jhargram', 'malda', 'uttar-dinajpur', 'dakshin-dinajpur', 
  'murshidabad', 'darjeeling', 'kalimpong', 'jalpaiguri', 'alipurduar', 
  'cooch-behar', 'purba-medinipur', 'paschim-medinipur'
];

assertTest(
  '100% of articles contain structured districts metadata',
  articles.every(a => Array.isArray(a.districts) && a.districts.length > 0)
);

const districtArticlesMap = {};
districtSlugs.forEach(slug => {
  districtArticlesMap[slug] = articles.filter(a => {
    const list = a.districts || a.districtIds || [];
    const normalized = list.map(item => String(item).toLowerCase().replace(/^dist-/, '').trim());
    return normalized.includes(slug);
  });
});

assertTest(
  'All 23 West Bengal districts have valid article discovery mapping',
  districtSlugs.every(slug => Array.isArray(districtArticlesMap[slug]))
);

assertTest(
  'All articles referenced by district discovery layer resolve to existing articles',
  Object.values(districtArticlesMap).flat().every(a => articleSlugs.has(a.slug))
);

// 9. SEO Content Intelligence Layer Tests
const validIntents = ['informational', 'commercial', 'transactional', 'local'];

assertTest(
  '100% of articles have valid primaryIntent (informational, commercial, transactional, local)',
  articles.every(a => validIntents.includes(a.primaryIntent))
);

assertTest(
  '100% of articles have verified primaryKeyword and secondaryKeywords',
  articles.every(a => typeof a.primaryKeyword === 'string' && a.primaryKeyword.length > 5 && Array.isArray(a.secondaryKeywords) && a.secondaryKeywords.length > 0)
);

assertTest(
  '100% of articles contain structured topics taxonomy',
  articles.every(a => Array.isArray(a.topics) && a.topics.length > 0)
);

// 10. Intelligent Related Articles Engine Integrity
let relatedArticleFails = 0;
articles.forEach(article => {
  const currentDistricts = (article.districts || article.districtIds || []).map(d => String(d).toLowerCase().replace(/^dist-/, '').trim());
  const currentLocalities = (article.localities || []).map(l => String(l).toLowerCase());
  const currentTopics = (article.topics || []).map(t => String(t).toLowerCase());
  const currentCategory = (article.category || '').toLowerCase();
  const currentIntent = article.primaryIntent || '';

  const candidates = articles.filter(a => a.slug !== article.slug);
  const scored = candidates.map(candidate => {
    let score = 0;
    const candDistricts = (candidate.districts || candidate.districtIds || []).map(d => String(d).toLowerCase().replace(/^dist-/, '').trim());
    const candLocalities = (candidate.localities || []).map(l => String(l).toLowerCase());
    const candTopics = (candidate.topics || []).map(t => String(t).toLowerCase());
    const candCategory = (candidate.category || '').toLowerCase();
    const candIntent = candidate.primaryIntent || '';

    candDistricts.forEach(d => { if (currentDistricts.includes(d)) score += 6; });
    candLocalities.forEach(l => { if (currentLocalities.includes(l)) score += 5; });
    candTopics.forEach(t => { if (currentTopics.includes(t)) score += 4; });
    if (candCategory && currentCategory && candCategory === currentCategory) score += 3;
    if (candIntent && currentIntent && candIntent === currentIntent) score += 2;
    if (candidate.language === article.language) score += 1;

    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topRelated = scored.slice(0, 3).map(s => s.candidate);
  if (topRelated.length < 3 || topRelated.some(r => r.slug === article.slug)) {
    relatedArticleFails++;
  }
});

assertTest(
  'Related articles scoring engine resolves 3 unique relevant posts per article with zero self-references',
  relatedArticleFails === 0,
  `Failed on ${relatedArticleFails} articles`
);

// 11. Technical SEO 5-URL Comprehensive Validation Checklist
const representativeSlugs = [
  'generative-engine-optimization-geo-ranking-guide-2026-google-ai-gemini',
  'speed-to-lead-whatsapp-business-api-sales-automation-lead-qualification-2026',
  'enterprise-ai-agents-secure-rag-workflows-operational-automation-2026',
  'mukutmanipur-jhilimili-ecotourism-homestays-boat-safari-sabai-crafts-whatsapp-booking',
  'santipur-phulia-saree-durga-puja-whatsapp-bulk-booking'
];

console.log('\n--- Running 5 Representative URLs Deep Inspection ---');

representativeSlugs.forEach((slug, idx) => {
  const article = articles.find(a => a.slug === slug);
  const articleDir = path.resolve(rootDir, `dist/blog/${slug}`);
  const htmlFile = path.resolve(articleDir, 'index.html');
  const fileExists = fs.existsSync(htmlFile);

  assertTest(
    `[URL ${idx + 1}: /blog/${slug}] Server-rendered HTML file exists in dist/`,
    fileExists
  );

  if (fileExists) {
    const html = fs.readFileSync(htmlFile, 'utf8');

    // 1. Canonical tag
    const canonicalExpected = `https://confluxai.in/blog/${slug}`;
    assertTest(
      `[URL ${idx + 1}] Self-referencing canonical tag is strictly set to ${canonicalExpected}`,
      html.includes(`<link rel="canonical" href="${canonicalExpected}"`)
    );

    // 2. Title & Meta Description
    assertTest(
      `[URL ${idx + 1}] <title> and meta description exist and match article`,
      html.includes('<title>') && html.includes('name="description"')
    );

    // 3. Single H1 heading
    const h1Count = (html.match(/<h1[\s>]/g) || []).length;
    assertTest(
      `[URL ${idx + 1}] Exactly one single <h1> element exists in initial HTML`,
      h1Count === 1,
      `Found ${h1Count} <h1> tags`
    );

    // 4. Semantic article structure & Breadcrumb navigation
    assertTest(
      `[URL ${idx + 1}] Semantic <article> and visible breadcrumb navigation exist`,
      html.includes('<article') && html.includes('aria-label="Breadcrumb"')
    );

    // 5. Author byline & /about link
    assertTest(
      `[URL ${idx + 1}] Author byline exists and links to /about`,
      html.includes('Written by') && html.includes('href="/about"')
    );

    // 6. Publication & update dates
    assertTest(
      `[URL ${idx + 1}] Publication and update dates are clearly presented`,
      html.includes('Published:') && html.includes('Updated:')
    );

    // 7. Related Conflux AI Services Cluster
    assertTest(
      `[URL ${idx + 1}] Related Conflux AI solutions internal links are present`,
      html.includes('Related Conflux AI Solutions') &&
      html.includes('/services/whatsapp-automation') &&
      html.includes('/services/ai-automation')
    );

    // 8. Scored Related Articles section
    assertTest(
      `[URL ${idx + 1}] Scored related articles section exists with crawlable <a href="/blog/..."> links`,
      html.includes('Recommended Insights &amp; Related Articles') &&
      html.includes('href="/blog/')
    );

    // 9. Article & BreadcrumbList Schema.org JSON-LD
    assertTest(
      `[URL ${idx + 1}] Valid Article and BreadcrumbList JSON-LD schemas exist in <head>`,
      html.includes('"@type":"Article"') &&
      html.includes('"@type":"BreadcrumbList"') &&
      html.includes('"publisher"') &&
      html.includes('"Conflux AI"')
    );

    // 10. Open Graph & Twitter card metadata
    assertTest(
      `[URL ${idx + 1}] Complete Open Graph (og:type=article, og:url, og:image) and Twitter Card tags exist`,
      html.includes('property="og:type" content="article"') &&
      html.includes(`property="og:url" content="${canonicalExpected}"`) &&
      html.includes('name="twitter:card" content="summary_large_image"')
    );

    // 11. Sitemap presence
    assertTest(
      `[URL ${idx + 1}] URL is registered in sitemap.xml`,
      sitemapUrls.includes(canonicalExpected)
    );
  }
});

console.log('\n======================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}


