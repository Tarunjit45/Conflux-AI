import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.resolve(rootDir, 'dist');
const articlesPath = path.resolve(rootDir, 'public/data/articles.json');
const indexHtmlPath = path.resolve(distDir, 'index.html');

if (!fs.existsSync(distDir) || !fs.existsSync(indexHtmlPath)) {
  console.log('[Prerender] dist/index.html not found. Run vite build first.');
  process.exit(0);
}

const templateHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

console.log(`[Prerender] Pre-rendering ${articles.length} articles for direct crawlability...`);

const escapeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

let count = 0;

articles.forEach(article => {
  const slug = article.slug;
  const targetDir = path.resolve(distDir, 'blog', slug);
  const targetFile = path.resolve(targetDir, 'index.html');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const title = article.seoTitle || `${article.title} | Conflux AI`;
  const description = article.seoDescription || article.excerpt || article.title;
  const canonicalUrl = article.canonicalUrl || `https://confluxai.in/blog/${slug}`;
  const authorName = typeof article.author === 'object' ? article.author.name : (article.author || 'Tarunjit Biswas');
  const authorRole = typeof article.author === 'object' ? article.author.role : 'Founder & Principal Architect, Conflux AI';
  const publishedDate = article.publishedAt || article.updatedAt || new Date().toISOString();
  const updatedDate = article.updatedAt || article.publishedAt || new Date().toISOString();
  const imageUrl = article.featuredImage || 'https://confluxai.in/logo.png';

  // Build JSON-LD Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": article.title,
    "inLanguage": article.language === 'bn' ? 'bn-IN' : 'en-US',
    "mainEntityOfPage": canonicalUrl,
    "articleSection": article.category || "AI Automation & Local Intelligence",
    "author": {
      "@type": "Person",
      "name": authorName,
      "jobTitle": authorRole
    },
    "publisher": {
      "@type": "Organization",
      "name": "Conflux AI",
      "url": "https://confluxai.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://confluxai.in/logo.png"
      }
    },
    "datePublished": publishedDate,
    "dateModified": updatedDate,
    "description": description,
    "image": imageUrl
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://confluxai.in/blog" },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": canonicalUrl }
    ]
  };

  let customHtml = templateHtml;

  // Replace Title
  customHtml = customHtml.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);

  // Replace / Inject Canonical
  if (customHtml.includes('<link rel="canonical"')) {
    customHtml = customHtml.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    customHtml = customHtml.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  }

  // Replace / Inject Meta Description
  if (customHtml.includes('name="description"')) {
    customHtml = customHtml.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  }

  // Inject Schemas before </head>
  const schemaTags = `
  <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
`;
  customHtml = customHtml.replace('</head>', `${schemaTags}\n</head>`);

  // Inject Pre-Rendered Server HTML into root container for no-JS bots
  const serverRenderedBody = `
    <div id="root">
      <article class="conflux-prerendered-content" style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: sans-serif;">
        <nav aria-label="Breadcrumbs" style="font-size: 12px; margin-bottom: 20px; color: #64748b;">
          <a href="/">Home</a> &gt; <a href="/blog">Knowledge Base</a> &gt; <span>${escapeHtml(article.title)}</span>
        </nav>
        <header style="margin-bottom: 30px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #2563eb; font-weight: bold; margin-bottom: 10px;">
            ${escapeHtml(article.category || 'Local Intelligence')} | ${escapeHtml(article.language === 'bn' ? 'বাংলা' : 'English')}
          </div>
          <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; line-height: 1.2; margin-bottom: 15px;">
            ${escapeHtml(article.title)}
          </h1>
          <div style="font-size: 13px; color: #475569; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 10px 0;">
            By <strong>${escapeHtml(authorName)}</strong> (${escapeHtml(authorRole)}) | Published: ${new Date(publishedDate).toLocaleDateString()}
          </div>
        </header>
        <div class="article-body" style="color: #334155; line-height: 1.7; font-size: 16px; white-space: pre-wrap;">
${escapeHtml(article.content || '')}
        </div>
      </article>
    </div>
  `;

  customHtml = customHtml.replace('<div id="root"></div>', serverRenderedBody);

  fs.writeFileSync(targetFile, customHtml, 'utf8');
  count++;
});

console.log(`[Prerender] Successfully generated ${count} static HTML snapshots with schema & full text!`);
