import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const articlesPath = path.resolve(rootDir, 'public/data/articles.json');
const sitemapPath = path.resolve(rootDir, 'public/sitemap.xml');

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

console.log(`[Sitemap Generator] Generating comprehensive XML sitemap for Conflux AI...`);

const staticRoutes = [
  { url: 'https://confluxai.in/', changefreq: 'daily', priority: '1.0' },
  { url: 'https://confluxai.in/about', changefreq: 'monthly', priority: '0.9' },
  { url: 'https://confluxai.in/solutions', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://confluxai.in/services/ai-automation', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://confluxai.in/services/ai-agents', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://confluxai.in/services/whatsapp-automation', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://confluxai.in/services/chatbot-development', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://confluxai.in/services/workflow-automation', changefreq: 'weekly', priority: '0.8' },
  { url: 'https://confluxai.in/services/website-development', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://confluxai.in/services/seo-geo', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://confluxai.in/services/digital-marketing', changefreq: 'weekly', priority: '0.8' },
  { url: 'https://confluxai.in/services/ecommerce-development', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://confluxai.in/services/meta-ads', changefreq: 'weekly', priority: '0.8' },
  { url: 'https://confluxai.in/services/google-ads', changefreq: 'weekly', priority: '0.8' },
  { url: 'https://confluxai.in/services/digital-solutions-west-bengal', changefreq: 'weekly', priority: '0.9' },
  { url: 'https://confluxai.in/creative', changefreq: 'monthly', priority: '0.7' },
  { url: 'https://confluxai.in/impact', changefreq: 'monthly', priority: '0.7' },
  { url: 'https://confluxai.in/portfolio', changefreq: 'monthly', priority: '0.7' },
  { url: 'https://confluxai.in/work', changefreq: 'monthly', priority: '0.7' },
  { url: 'https://confluxai.in/careers', changefreq: 'monthly', priority: '0.6' },
  { url: 'https://confluxai.in/contact', changefreq: 'monthly', priority: '0.8' },
  { url: 'https://confluxai.in/authority', changefreq: 'monthly', priority: '0.8' },
  { url: 'https://confluxai.in/faq', changefreq: 'monthly', priority: '0.8' },
  { url: 'https://confluxai.in/semantic-map', changefreq: 'monthly', priority: '0.7' },
  { url: 'https://confluxai.in/locations/west-bengal', changefreq: 'daily', priority: '0.9' },
  { url: 'https://confluxai.in/blog', changefreq: 'daily', priority: '0.9' }
];

const districtSlugs = [
  'nadia', 'north-24-parganas', 'south-24-parganas', 'howrah', 'hooghly', 
  'kolkata', 'purba-bardhaman', 'paschim-bardhaman', 'birbhum', 'bankura', 
  'purulia', 'purba-medinipur', 'paschim-medinipur', 'jhargram', 'malda', 
  'uttar-dinajpur', 'dakshin-dinajpur', 'murshidabad', 'darjeeling', 
  'kalimpong', 'jalpaiguri', 'alipurduar', 'cooch-behar'
];

const today = new Date().toISOString().split('T')[0];

const xmlEntries = [];

// Static Routes
staticRoutes.forEach(r => {
  xmlEntries.push(`  <url>
    <loc>${r.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`);
});

// District Hubs
districtSlugs.forEach(slug => {
  xmlEntries.push(`  <url>
    <loc>https://confluxai.in/locations/west-bengal/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
});

// Articles (Strictly Published and Canonical)
let articleCount = 0;
articles.forEach(article => {
  if (article.status && article.status !== 'PUBLISHED') return;
  const canonicalUrl = article.canonicalUrl || `https://confluxai.in/blog/${article.slug}`;
  const lastmod = article.updatedAt ? article.updatedAt.split('T')[0] : (article.publishedAt ? article.publishedAt.split('T')[0] : today);

  xmlEntries.push(`  <url>
    <loc>${canonicalUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
  articleCount++;
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries.join('\n')}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');

console.log(`[Sitemap Generator] Wrote ${xmlEntries.length} verified URLs to public/sitemap.xml (including ${articleCount} articles)`);
