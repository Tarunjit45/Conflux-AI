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

console.log(`[Prerender] Pre-rendering ${articles.length} articles and /blog directory for direct crawlability...`);

const escapeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const replaceBody = (html, newBodyContent) => {
  const bodyStart = html.indexOf('<body>');
  const bodyEnd = html.lastIndexOf('</body>');
  if (bodyStart === -1 || bodyEnd === -1) return html;
  return html.substring(0, bodyStart) + `<body>\n${newBodyContent}\n</body>` + html.substring(bodyEnd + 7);
};

// 1. Pre-render /blog/index.html (The Full Knowledge Base Directory)
const blogDir = path.resolve(distDir, 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

const blogIndexFile = path.resolve(blogDir, 'index.html');

const blogDirectorySchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "West Bengal Business Knowledge & AI Insights | Conflux AI",
  "description": "Authoritative local digital guides for businesses across West Bengal. 60+ verified guides covering local commerce, tourism, and automation.",
  "url": "https://confluxai.in/blog",
  "hasPart": articles.map(a => ({
    "@type": "TechArticle",
    "headline": a.title,
    "url": `https://confluxai.in/blog/${a.slug}`,
    "inLanguage": a.language === 'bn' ? 'bn-IN' : 'en-US'
  }))
};

let blogHtml = templateHtml;
blogHtml = blogHtml.replace(/<title>.*?<\/title>/, `<title>West Bengal Business Knowledge & AI Insights | Conflux AI</title>`);
blogHtml = blogHtml.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="Authoritative local digital guides for businesses across West Bengal. Written manually covering local commerce, tourism, and AI automation." />`);

if (blogHtml.includes('<link rel="canonical"')) {
  blogHtml = blogHtml.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="https://confluxai.in/blog" />`);
} else {
  blogHtml = blogHtml.replace('</head>', `  <link rel="canonical" href="https://confluxai.in/blog" />\n</head>`);
}

blogHtml = blogHtml.replace('</head>', `  <script type="application/ld+json">${JSON.stringify(blogDirectorySchema)}</script>\n</head>`);

const blogListHtml = `
  <div id="root">
    <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
        <nav style="font-size: 13px; font-weight: 700;">
          <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
          <a href="/blog" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Blog</a>
          <a href="/locations/west-bengal" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
          <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
        </nav>
      </div>
    </header>
    <main style="max-width: 1200px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif;">
      <h1 style="font-size: 38px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 12px;">
        West Bengal Business Knowledge & AI Insights
      </h1>
      <p style="font-size: 16px; color: #64748b; max-width: 800px; line-height: 1.6; margin-bottom: 36px;">
        Authoritative local digital guides for businesses and offbeat localities across Bagula, Krishnanagar, Ranaghat, Mukutmanipur, Dooars, Taki, Kurseong, and all districts of West Bengal. Written 100% manually.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px;">
        ${articles.map(a => {
          const authName = typeof a.author === 'object' ? a.author.name : (a.author || 'Tarunjit Biswas');
          return `
          <article style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; display: flex; flex-direction: column;">
            <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; margin-bottom: 8px;">
              ${escapeHtml(a.category || 'Local Strategy')} &bull; ${a.language === 'bn' ? 'বাংলা' : 'English'}
            </div>
            <h2 style="font-size: 18px; font-weight: 900; color: #0f172a; line-height: 1.3; margin-bottom: 10px;">
              <a href="/blog/${escapeHtml(a.slug)}" style="color: #0f172a; text-decoration: none;">${escapeHtml(a.title)}</a>
            </h2>
            <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 16px; flex-grow: 1;">
              ${escapeHtml(a.excerpt || a.title)}
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px; font-size: 11px; color: #94a3b8;">
              <span>By ${escapeHtml(authName)}</span>
              <a href="/blog/${escapeHtml(a.slug)}" style="color: #2563eb; font-weight: 800; text-decoration: none;">Read &rarr;</a>
            </div>
          </article>
          `;
        }).join('')}
      </div>
    </main>
  </div>
`;

blogHtml = replaceBody(blogHtml, blogListHtml);
fs.writeFileSync(blogIndexFile, blogHtml, 'utf8');

// 2. Pre-render individual articles /blog/:slug/index.html
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

  // Build JSON-LD Schemas
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

  const faqSchema = (article.faq && article.faq.length > 0) ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faq.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null;

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
  ${faqSchema ? `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>` : ''}
`;
  customHtml = customHtml.replace('</head>', `${schemaTags}\n</head>`);

  // Inject Pre-Rendered Server HTML into root container for crawlers
  const serverRenderedBody = `
  <div id="root">
    <header style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
      <div style="max-width: 900px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <a href="/" style="font-size: 18px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
        <nav style="font-size: 13px; font-weight: 700;">
          <a href="/blog" style="color: #2563eb; text-decoration: none;">&larr; Back to Knowledge Base</a>
        </nav>
      </div>
    </header>
    <article class="conflux-prerendered-content" style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif;">
      <nav aria-label="Breadcrumbs" style="font-size: 12px; margin-bottom: 20px; color: #64748b;">
        <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> &gt; <a href="/blog" style="color: #2563eb; text-decoration: none;">Knowledge Base</a> &gt; <span style="color: #0f172a;">${escapeHtml(article.title)}</span>
      </nav>
      <header style="margin-bottom: 30px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #2563eb; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 10px;">
          ${escapeHtml(article.category || 'Local Strategy')} &bull; ${escapeHtml(article.language === 'bn' ? 'বাংলা (Bengali)' : 'English')}
        </div>
        <h1 style="font-size: 34px; font-weight: 900; color: #0f172a; line-height: 1.2; margin-bottom: 16px;">
          ${escapeHtml(article.title)}
        </h1>
        <div style="font-size: 13px; color: #475569; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 12px 0; display: flex; justify-content: space-between; align-items: center;">
          <span>By <strong>${escapeHtml(authorName)}</strong> (${escapeHtml(authorRole)})</span>
          <span>Published: ${new Date(publishedDate).toLocaleDateString()}</span>
        </div>
      </header>
      <div class="article-body" style="color: #334155; line-height: 1.8; font-size: 16px; white-space: pre-wrap; font-family: 'Inter', sans-serif;">
${escapeHtml(article.content || '')}
      </div>
      ${article.faq && article.faq.length > 0 ? `
      <section style="margin-top: 40px; padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Frequently Asked Questions</h3>
        ${article.faq.map(f => `
          <div style="margin-bottom: 16px; background: white; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h4 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Q: ${escapeHtml(f.question)}</h4>
            <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.6;">A: ${escapeHtml(f.answer)}</p>
          </div>
        `).join('')}
      </section>
      ` : ''}
    </article>
  </div>
`;

  customHtml = replaceBody(customHtml, serverRenderedBody);
  fs.writeFileSync(targetFile, customHtml, 'utf8');
  count++;
});

console.log(`[Prerender] Successfully generated ${count} article pages + 1 blog index directory with schema & full accessible text!`);
