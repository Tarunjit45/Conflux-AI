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

console.log(`[Prerender] Comprehensive full-site pre-rendering starting...`);

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

const writePage = (routePath, pageTitle, metaDescription, canonicalUrl, schemas, bodyContent, extraMeta = {}) => {
  const targetDir = path.resolve(distDir, routePath.replace(/^\//, ''));
  const targetFile = path.resolve(targetDir, 'index.html');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let html = templateHtml;

  // Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);

  // Canonical
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  }

  // Meta Description
  if (html.includes('name="description"')) {
    html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(metaDescription)}" />`);
  } else {
    html = html.replace('</head>', `  <meta name="description" content="${escapeHtml(metaDescription)}" />\n</head>`);
  }

  // Author Meta
  if (extraMeta.author) {
    if (html.includes('name="author"')) {
      html = html.replace(/<meta name="author"[^>]*>/, `<meta name="author" content="${escapeHtml(extraMeta.author)}" />`);
    } else {
      html = html.replace('</head>', `  <meta name="author" content="${escapeHtml(extraMeta.author)}" />\n</head>`);
    }
  }

  // OG & Twitter Meta
  const ogType = extraMeta.type || (routePath.startsWith('/blog/') && routePath !== '/blog' ? 'article' : 'website');
  const imageUrl = extraMeta.image || 'https://confluxai.in/logo.png';

  if (html.includes('property="og:title"')) {
    html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`);
  } else {
    html = html.replace('</head>', `  <meta property="og:title" content="${escapeHtml(pageTitle)}" />\n</head>`);
  }

  if (html.includes('property="og:description"')) {
    html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(metaDescription)}" />`);
  } else {
    html = html.replace('</head>', `  <meta property="og:description" content="${escapeHtml(metaDescription)}" />\n</head>`);
  }

  if (html.includes('property="og:url"')) {
    html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `  <meta property="og:url" content="${canonicalUrl}" />\n</head>`);
  }

  if (html.includes('property="og:type"')) {
    html = html.replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${ogType}" />`);
  } else {
    html = html.replace('</head>', `  <meta property="og:type" content="${ogType}" />\n</head>`);
  }

  if (html.includes('property="og:image"')) {
    html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${imageUrl}" />`);
  } else {
    html = html.replace('</head>', `  <meta property="og:image" content="${imageUrl}" />\n</head>`);
  }

  if (html.includes('property="twitter:title"')) {
    html = html.replace(/<meta property="twitter:title"[^>]*>/, `<meta property="twitter:title" content="${escapeHtml(pageTitle)}" />`);
  } else {
    html = html.replace('</head>', `  <meta property="twitter:title" content="${escapeHtml(pageTitle)}" />\n</head>`);
  }

  if (html.includes('property="twitter:description"')) {
    html = html.replace(/<meta property="twitter:description"[^>]*>/, `<meta property="twitter:description" content="${escapeHtml(metaDescription)}" />`);
  } else {
    html = html.replace('</head>', `  <meta property="twitter:description" content="${escapeHtml(metaDescription)}" />\n</head>`);
  }

  if (html.includes('property="twitter:url"')) {
    html = html.replace(/<meta property="twitter:url"[^>]*>/, `<meta property="twitter:url" content="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `  <meta property="twitter:url" content="${canonicalUrl}" />\n</head>`);
  }

  if (html.includes('property="twitter:image"')) {
    html = html.replace(/<meta property="twitter:image"[^>]*>/, `<meta property="twitter:image" content="${imageUrl}" />`);
  } else {
    html = html.replace('</head>', `  <meta property="twitter:image" content="${imageUrl}" />\n</head>`);
  }

  if (!html.includes('name="twitter:card"')) {
    html = html.replace('</head>', `  <meta name="twitter:card" content="summary_large_image" />\n</head>`);
  }

  // Schemas
  if (schemas && schemas.length > 0) {
    const schemaTags = schemas.map(s => `  <script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');
    html = html.replace('</head>', `${schemaTags}\n</head>`);
  }

  html = replaceBody(html, bodyContent);
  fs.writeFileSync(targetFile, html, 'utf8');
};

// ── 1. PRE-RENDER BLOG DIRECTORY (/blog) ──────────────────────
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

const blogListHtml = `
  <div id="root">
    <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
        <nav style="font-size: 13px; font-weight: 700;">
          <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
          <a href="/solutions" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
          <a href="/locations" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
          <a href="/blog" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Blog</a>
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

writePage(
  '/blog',
  'West Bengal Business Knowledge & AI Insights | Conflux AI',
  'Authoritative local digital guides for businesses across West Bengal. 60+ verified guides covering local commerce, tourism, and AI automation.',
  'https://confluxai.in/blog',
  [blogDirectorySchema],
  blogListHtml
);

// ── 2. PRE-RENDER ALL 62 ARTICLES (/blog/:slug) ───────────────
let articleCount = 0;

articles.forEach(article => {
  const slug = article.slug;
  const title = article.seoTitle || `${article.title} | Conflux AI`;
  const description = article.seoDescription || article.excerpt || article.title;
  const canonicalUrl = article.canonicalUrl || `https://confluxai.in/blog/${slug}`;
  const authorName = typeof article.author === 'object' ? article.author.name : (article.author || 'Tarunjit Biswas');
  const authorRole = typeof article.author === 'object' ? article.author.role : 'Founder & Principal Architect, Conflux AI';
  const publishedDate = article.publishedAt || article.updatedAt || new Date().toISOString();
  const updatedDate = article.updatedAt || article.publishedAt || new Date().toISOString();
  const imageUrl = article.featuredImage || 'https://confluxai.in/logo.png';

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "inLanguage": article.language === 'bn' ? 'bn-IN' : 'en-US',
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "articleSection": article.category || "AI Automation & Local Intelligence",
    "author": {
      "@type": "Person",
      "name": authorName,
      "jobTitle": authorRole,
      "url": "https://confluxai.in/about"
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

  const schemas = [articleSchema, breadcrumbSchema];

  if (article.faq && article.faq.length > 0) {
    schemas.push({
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
    });
  }

  // Intelligent Related Articles Scorer for SSG
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

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const dateA = new Date(a.candidate.publishedAt || a.candidate.updatedAt || 0).getTime();
    const dateB = new Date(b.candidate.publishedAt || b.candidate.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  const relatedArticles = scored.slice(0, 3).map(s => s.candidate);

  const primaryDistrict = currentDistricts.find(d => d !== 'statewide');

  const formattedPubDate = new Date(publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedUpdDate = new Date(updatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const serverRenderedBody = `
  <div id="root">
    <header style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
      <div style="max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <a href="/" style="font-size: 18px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
        <nav style="font-size: 13px; font-weight: 700;">
          <a href="/blog" style="color: #2563eb; text-decoration: none; margin-right: 16px;">&larr; Back to Blog</a>
          <a href="/about" style="color: #475569; text-decoration: none; margin-right: 16px;">About Conflux AI</a>
          ${primaryDistrict ? `<a href="/locations/west-bengal/${primaryDistrict}" style="color: #475569; text-decoration: none;">${escapeHtml(primaryDistrict)} Hub</a>` : ''}
        </nav>
      </div>
    </header>
    <article class="conflux-prerendered-content" style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif;">
      <nav aria-label="Breadcrumb" style="font-size: 12px; margin-bottom: 20px; color: #64748b;">
        <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> &gt; <a href="/blog" style="color: #2563eb; text-decoration: none;">Blog</a> ${primaryDistrict ? `&gt; <a href="/locations/west-bengal/${primaryDistrict}" style="color: #2563eb; text-decoration: none;">${escapeHtml(primaryDistrict)}</a>` : ''} &gt; <span style="color: #0f172a;">${escapeHtml(article.title)}</span>
      </nav>
      <header style="margin-bottom: 30px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #2563eb; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="background: #eff6ff; padding: 2px 8px; border-radius: 9999px; border: 1px solid #dbeafe;">${escapeHtml(article.category || 'Local Strategy')}</span>
          <span style="background: #f1f5f9; padding: 2px 8px; border-radius: 9999px; color: #475569;">${escapeHtml(article.language === 'bn' ? 'বাংলা (Bengali)' : 'English')}</span>
          ${primaryDistrict ? `<a href="/locations/west-bengal/${primaryDistrict}" style="background: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 9999px; text-decoration: none;">📍 ${escapeHtml(primaryDistrict)} District</a>` : ''}
        </div>
        <h1 style="font-size: 34px; font-weight: 900; color: #0f172a; line-height: 1.2; margin-bottom: 16px;">
          ${escapeHtml(article.title)}
        </h1>
        <div style="font-size: 13px; color: #475569; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 12px 0; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px;">
          <span>Written by <a href="/about" style="color: #2563eb; font-weight: 700; text-decoration: underline;">${escapeHtml(authorName)}</a> (${escapeHtml(authorRole)})</span>
          <span style="font-size: 12px; color: #64748b;">Published: <strong>${formattedPubDate}</strong> &bull; Updated: <strong>${formattedUpdDate}</strong></span>
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

      ${article.sources && article.sources.length > 0 ? `
      <section style="margin-top: 30px; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h4 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #047857; margin-bottom: 12px;">Verified Sources &amp; Citations</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
          ${article.sources.map(s => `
            <li style="margin-bottom: 6px;">
              <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: 700; text-decoration: underline;">${escapeHtml(s.title)}</a>
              ${s.publisher ? `<span style="color: #94a3b8; font-size: 11px;"> (${escapeHtml(s.publisher)})</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </section>
      ` : ''}

      <!-- INTERNAL LINKING CLUSTERS: CONFLUX AI SOLUTIONS -->
      <section style="margin-top: 40px; padding: 28px; background: #0f172a; border-radius: 20px; color: white;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #60a5fa; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">Connected Digital Capabilities</span>
        <h3 style="font-size: 20px; font-weight: 900; color: white; margin: 0 0 16px 0;">Related Conflux AI Solutions</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
          <a href="/services/whatsapp-automation" style="background: #1e293b; padding: 14px; border-radius: 12px; text-decoration: none; color: white; border: 1px solid #334155; display: block;">
            <strong style="color: #38bdf8; font-size: 13px; display: block; margin-bottom: 4px;">WhatsApp Business Automation &rarr;</strong>
            <span style="font-size: 11px; color: #94a3b8;">Instant lead qualification &amp; 24/7 order bots</span>
          </a>
          <a href="/services/ai-automation" style="background: #1e293b; padding: 14px; border-radius: 12px; text-decoration: none; color: white; border: 1px solid #334155; display: block;">
            <strong style="color: #38bdf8; font-size: 13px; display: block; margin-bottom: 4px;">Enterprise AI Automation &rarr;</strong>
            <span style="font-size: 11px; color: #94a3b8;">Autonomous business workflows &amp; CRM sync</span>
          </a>
          <a href="/services/website-development" style="background: #1e293b; padding: 14px; border-radius: 12px; text-decoration: none; color: white; border: 1px solid #334155; display: block;">
            <strong style="color: #38bdf8; font-size: 13px; display: block; margin-bottom: 4px;">High-Performance Web Platforms &rarr;</strong>
            <span style="font-size: 11px; color: #94a3b8;">Sub-second speed &amp; search optimized</span>
          </a>
          <a href="/services/seo-geo" style="background: #1e293b; padding: 14px; border-radius: 12px; text-decoration: none; color: white; border: 1px solid #334155; display: block;">
            <strong style="color: #38bdf8; font-size: 13px; display: block; margin-bottom: 4px;">SEO &amp; GEO Optimization &rarr;</strong>
            <span style="font-size: 11px; color: #94a3b8;">Rank #1 on Google AI, Perplexity &amp; Gemini</span>
          </a>
        </div>
      </section>

      <!-- DYNAMIC RELATED ARTICLES SECTION -->
      ${relatedArticles.length > 0 ? `
      <section style="margin-top: 48px; padding-top: 32px; border-top: 2px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2563eb; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">Topical Intelligence</span>
            <h3 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0;">Recommended Insights &amp; Related Articles</h3>
          </div>
          <a href="/blog" style="font-size: 12px; font-weight: 800; color: #2563eb; text-decoration: none;">View All &rarr;</a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
          ${relatedArticles.map(rel => `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 6px; display: inline-block; margin-bottom: 8px;">
                  ${escapeHtml(rel.category || 'Strategy')}
                </span>
                <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.35; margin-bottom: 8px;">
                  <a href="/blog/${escapeHtml(rel.slug)}" style="color: #0f172a; text-decoration: none;">${escapeHtml(rel.title)}</a>
                </h4>
                <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 12px;">
                  ${escapeHtml(rel.excerpt || rel.title)}
                </p>
              </div>
              <a href="/blog/${escapeHtml(rel.slug)}" style="font-size: 11px; font-weight: 800; color: #2563eb; text-decoration: none;">Read Insight &rarr;</a>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <div style="margin-top: 48px; padding: 32px; background: #0f172a; border-radius: 20px; color: white; text-align: center;">
        <h3 style="font-size: 22px; font-weight: 900; margin-bottom: 8px;">Automate Your Local Business Workflows</h3>
        <p style="color: #94a3b8; font-size: 14px; max-width: 600px; margin: 0 auto 20px auto;">
          Conflux AI partners with enterprises across West Bengal via remote collaboration to implement AI automations, official WhatsApp API bots, and sub-second web platforms.
        </p>
        <a href="https://wa.me/918972517557?text=Hello%20Conflux%20AI,%20I%20read%20your%20article%20on%20${encodeURIComponent(article.title)}%20and%20want%20to%20consult." target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 13px;">
          WhatsApp Direct Consultation &rarr;
        </a>
      </div>
    </article>
  </div>
`;

  writePage(`/blog/${slug}`, title, description, canonicalUrl, schemas, serverRenderedBody, {
    type: 'article',
    author: authorName,
    image: imageUrl
  });
  articleCount++;
});

// ── 3. PRE-RENDER CORE SERVICE PAGES (/services/:serviceId) ───
const servicesList = [
  {
    id: "ai-automation",
    aliases: ["enterprise-ai-automation"],
    name: "Enterprise AI Automation",
    headline: "Streamline Business Operations with High-Throughput Autonomous AI Systems",
    problem: "Manual data entry, repetitive customer follow-ups, and disconnected software systems slow operational throughput and increase overhead.",
    solution: "Conflux AI builds custom autonomous microservices and AI pipelines that connect CRMs, databases, and communication tools into unified automated workflows.",
    whoIsItFor: "Growing businesses, B2B agencies, e-commerce brands, and enterprise teams seeking to automate repetitive operational tasks.",
    faqs: [
      { q: "What is AI automation for small and medium businesses?", a: "AI automation combines artificial intelligence models with software integrations to execute repetitive operational tasks without manual human effort." },
      { q: "What software platforms can Conflux AI integrate with?", a: "We integrate with HubSpot, Salesforce, Supabase, WhatsApp, Notion, Google Workspace, and custom SQL databases." }
    ]
  },
  {
    id: "ai-agents",
    aliases: [],
    name: "AI Agents & Autonomous Systems",
    headline: "Deploy Intelligent Autonomous Agents to Perform Complex Multi-Step Business Tasks",
    problem: "Traditional rule-based automation breaks when encountering variable user inputs, unstructured documents, or non-standard workflows.",
    solution: "We design stateful AI agents equipped with tool-use capabilities, vector memory, and decision logic that perform multi-step tasks autonomously.",
    whoIsItFor: "B2B sales teams, customer success departments, research teams, and operations managers handling complex lead qualification.",
    faqs: [
      { q: "What is the difference between an AI agent and traditional automation?", a: "Traditional automation follows rigid IF/THEN rules. An AI agent uses large language models to reason over variable data and decide which tools to invoke." }
    ]
  },
  {
    id: "whatsapp-automation",
    aliases: ["whatsapp-business-automation"],
    name: "WhatsApp Business Automation",
    headline: "Automate Instant Lead Response, Prospect Qualification, and Support via WhatsApp API",
    problem: "Businesses lose high-intent customer inquiries when leads wait hours for a manual WhatsApp reply.",
    solution: "Conflux AI implements official WhatsApp Business API automation bots that respond within seconds, qualify lead intent, capture customer details, and sync directly with your CRM.",
    whoIsItFor: "Local services, D2C brands, real estate firms, educational institutions, and B2B companies receiving high lead volume on WhatsApp.",
    faqs: [
      { q: "How can an Indian business automate WhatsApp leads?", a: "By linking the official Meta WhatsApp Business API to an automation platform, leads receive instant replies 24/7 and are automatically qualified into your CRM." }
    ]
  },
  {
    id: "chatbot-development",
    aliases: ["ai-chatbot-development"],
    name: "Custom AI Chatbot Development",
    headline: "Convert Website Visitors 24/7 with Intelligent RAG-Powered Conversational Widgets",
    problem: "Generic scripted chatbots frustrate visitors, while human support teams cannot operate around the clock.",
    solution: "We build context-aware AI chatbots trained exclusively on your company documentation using Retrieval-Augmented Generation (RAG) to deliver accurate, non-hallucinating answers.",
    whoIsItFor: "SaaS platforms, corporate service providers, e-commerce stores, and consultancy agencies wanting 24/7 prospect qualification.",
    faqs: [
      { q: "Will the AI chatbot hallucinate?", a: "No. Our RAG architecture restricts the chatbot to retrieving answers solely from your approved company knowledge base documents." }
    ]
  },
  {
    id: "workflow-automation",
    aliases: ["business-workflow-automation"],
    name: "Business Workflow Automation",
    headline: "Connect Disparate Software Systems into Seamless Automated Workflows",
    problem: "Information trapped in separate tools requires manual copy-pasting, causing delays, data errors, and operational friction.",
    solution: "We build robust webhook and API automation architectures using platforms like Make.com, Zapier, and custom serverless functions.",
    whoIsItFor: "Operations leads, sales managers, agency owners, and financial administrators seeking cross-platform data sync.",
    faqs: [
      { q: "What happens during third-party API downtime?", a: "Our automated workflows include retry queues and instant alerts to prevent data loss." }
    ]
  },
  {
    id: "website-development",
    aliases: ["web-development"],
    name: "High-Performance Web Development",
    headline: "Ultra-Fast, Sub-Second React Web Platforms Built for Maximum Lead Conversion",
    problem: "Slow, outdated WordPress websites lose up to 50% of mobile visitors before the page finishes loading.",
    solution: "Conflux AI engineers custom web applications using React 18, Vite, TypeScript, and serverless edge hosting for instant loading speeds and clean user experience.",
    whoIsItFor: "Businesses, professional services, B2B agencies, and tech startups requiring a modern, high-converting digital presence.",
    faqs: [
      { q: "Why choose React and Vite over traditional CMS platforms?", a: "React platforms load in under a second, offer superior security against plugin vulnerabilities, and deliver higher conversion rates." }
    ]
  },
  {
    id: "seo-geo",
    aliases: ["seo"],
    name: "SEO & Technical Search Optimization",
    headline: "Rank High on Google & Optimize Technical Schema for AI & Traditional Crawlers",
    problem: "Search engines and AI systems skip websites lacking structured entity data, clear semantic HTML, or fast technical performance.",
    solution: "We implement comprehensive technical SEO, Schema.org JSON-LD data structures, sitemaps, canonical tagging, and content taxonomy to ensure maximum search visibility.",
    whoIsItFor: "Local businesses, professional service firms, and online platforms wanting reliable search discovery.",
    faqs: [
      { q: "What is Schema.org structured data?", a: "Schema.org is a standardized machine-readable format that explicitly informs Google and AI crawlers about your business entity, services, and location." }
    ]
  },
  {
    id: "digital-marketing",
    aliases: [],
    name: "Digital Marketing & Growth Suite",
    headline: "Data-Driven Customer Acquisition, Content Strategy, and Visual Campaign Management",
    problem: "Unfocused marketing efforts waste capital on unqualified clicks without building a predictable pipeline.",
    solution: "We deliver structured B2B acquisition strategies, video editing, social media management, and conversion-focused funnel analytics.",
    whoIsItFor: "Businesses seeking structured multi-channel digital acquisition and professional content production.",
    faqs: [
      { q: "How do you measure marketing performance?", a: "We focus on tangible business outcomes: cost per qualified lead, conversion rate, and pipeline growth." }
    ]
  },
  {
    id: "ecommerce-development",
    aliases: [],
    name: "E-Commerce Development & Catalogs",
    headline: "High-Converting Online Stores, WhatsApp Product Catalogs & Instant UPI Checkout",
    problem: "Generic slow storefronts, high marketplace commission fees, and clunky checkouts eat into retail margins.",
    solution: "Conflux AI develops high-performance custom e-commerce platforms and automated WhatsApp product catalogs integrated with instant UPI payment gateways.",
    whoIsItFor: "D2C brands, retailers, agro-producers, handicraft artisans, and wholesale merchants looking for direct customer sales.",
    faqs: [
      { q: "Can customers purchase directly through WhatsApp?", a: "Yes. Conflux AI builds interactive WhatsApp catalogs with button-based selection and automated UPI payment links." }
    ]
  },
  {
    id: "meta-ads",
    aliases: [],
    name: "Meta Ads & Paid Social Acquisition",
    headline: "Scale Targeted Lead Acquisition Across Facebook and Instagram",
    problem: "Generic ad copy and broad targeting waste budget on low-quality leads that never convert.",
    solution: "We engineer high-converting Meta ad campaigns utilizing audience profiling, custom video creatives, lead forms, and pixel attribution tracking.",
    whoIsItFor: "D2C brands, local service providers, real estate firms, and B2B services wanting predictable lead generation.",
    faqs: [
      { q: "How quickly do Meta ad campaigns produce lead data?", a: "Meta ad campaigns begin delivering lead data within 24 to 48 hours after campaign activation." }
    ]
  },
  {
    id: "google-ads",
    aliases: [],
    name: "Google Ads & PPC Search Marketing",
    headline: "Capture High-Intent Customers Searching Active Buying Keywords on Google",
    problem: "Bidding on broad keywords burns ad budget on casual browsers instead of motivated buyers.",
    solution: "We build search engine marketing campaigns focused on exact-intent keywords, negative keyword lists, and conversion-optimized landing pages.",
    whoIsItFor: "High-ticket service providers, B2B companies, and local firms targeting active search queries.",
    faqs: [
      { q: "Why is negative keyword management critical?", a: "Negative keywords block irrelevant search queries, preventing wasted ad spend on unqualified clicks." }
    ]
  },
  {
    id: "digital-solutions-west-bengal",
    aliases: ["rural-digital-solutions"],
    name: "Digital Solutions for Businesses Across West Bengal",
    headline: "Remote-First AI Automation, WhatsApp Bots & Web Platforms for All 23 West Bengal Districts",
    problem: "Businesses outside Kolkata often struggle to access high-end AI automation and modern web development agencies.",
    solution: "Conflux AI provides 100% remote collaboration, digital blueprints, and cloud software implementation for enterprises across Nadia, Bankura, Dooars, Purulia, and all Bengal districts.",
    whoIsItFor: "Small and medium business owners, retailers, hotels, tea estates, and healthcare clinics across West Bengal.",
    faqs: [
      { q: "Does Conflux AI work remotely across all districts?", a: "Yes. We conduct video audits, build systems in sandboxes, and deploy solutions completely remotely." }
    ]
  }
];

let serviceCount = 0;

servicesList.forEach(svc => {
  const serviceUrl = `https://confluxai.in/services/${svc.id}`;
  const serviceTitle = `${svc.name} | Conflux AI`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": svc.name,
    "provider": {
      "@type": "Organization",
      "name": "Conflux AI",
      "url": "https://confluxai.in/"
    },
    "serviceType": svc.name,
    "description": svc.headline,
    "areaServed": "Worldwide"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://confluxai.in/services" },
      { "@type": "ListItem", "position": 3, "name": svc.name, "item": serviceUrl }
    ]
  };

  const schemas = [serviceSchema, breadcrumbSchema];

  if (svc.faqs && svc.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": svc.faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    });
  }

  const serviceBodyHtml = `
  <div id="root">
    <header style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
      <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
        <nav style="font-size: 13px; font-weight: 700;">
          <a href="/services" style="margin: 0 10px; color: #2563eb; text-decoration: none;">&larr; All Services</a>
          <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact Us</a>
        </nav>
      </div>
    </header>
    <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
      <nav aria-label="Breadcrumbs" style="font-size: 12px; margin-bottom: 24px; color: #64748b;">
        <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> &gt; <a href="/services" style="color: #2563eb; text-decoration: none;">Services</a> &gt; <span style="color: #0f172a;">${escapeHtml(svc.name)}</span>
      </nav>

      <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #2563eb; letter-spacing: 0.1em; display: inline-block; margin-bottom: 12px;">Commercial Solution</span>
      <h1 style="font-size: 42px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">
        ${escapeHtml(svc.name)}
      </h1>
      <p style="font-size: 20px; font-weight: 600; color: #475569; line-height: 1.5; margin-bottom: 40px; max-width: 900px;">
        ${escapeHtml(svc.headline)}
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 40px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px;">
          <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #dc2626; letter-spacing: 0.05em; margin-bottom: 12px;">
            Operational Bottleneck
          </h2>
          <p style="font-size: 16px; color: #334155; line-height: 1.7; margin: 0;">
            ${escapeHtml(svc.problem)}
          </p>
        </div>

        <div style="background: #2563eb; color: white; border-radius: 20px; padding: 32px;">
          <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #fef08a; letter-spacing: 0.05em; margin-bottom: 12px;">
            Conflux AI Implementation
          </h2>
          <p style="font-size: 16px; color: #eff6ff; line-height: 1.7; margin: 0;">
            ${escapeHtml(svc.solution)}
          </p>
        </div>
      </div>

      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; margin-bottom: 40px;">
        <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #2563eb; margin-bottom: 8px;">Target Audience</h3>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0;">${escapeHtml(svc.whoIsItFor)}</p>
      </div>

      ${svc.faqs && svc.faqs.length > 0 ? `
      <section style="margin-top: 40px; padding: 32px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px;">
        <h3 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 20px;">Frequently Asked Questions</h3>
        ${svc.faqs.map(f => `
          <div style="margin-bottom: 16px; background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Q: ${escapeHtml(f.q)}</h4>
            <p style="font-size: 15px; color: #475569; margin: 0; line-height: 1.6;">A: ${escapeHtml(f.a)}</p>
          </div>
        `).join('')}
      </section>
      ` : ''}

      <div style="margin-top: 40px; text-align: center; padding: 40px; background: #0f172a; border-radius: 24px; color: white;">
        <h3 style="font-size: 24px; font-weight: 800; margin-bottom: 12px;">Ready to Deploy ${escapeHtml(svc.name)}?</h3>
        <p style="color: #94a3b8; font-size: 15px; max-width: 600px; margin: 0 auto 24px auto;">
          Connect directly with our Kolkata engineering team to audit your current workflows and receive a custom implementation blueprint.
        </p>
        <a href="https://wa.me/918972517557?text=Hello%20Conflux%20AI,%20I%20want%20to%20consult%20about%20${encodeURIComponent(svc.name)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">
          Chat on WhatsApp Direct &rarr;
        </a>
      </div>
    </main>
  </div>
`;

  // Write Canonical
  writePage(`/services/${svc.id}`, serviceTitle, svc.headline, serviceUrl, schemas, serviceBodyHtml);
  serviceCount++;

  // Write Aliases
  if (svc.aliases && svc.aliases.length > 0) {
    svc.aliases.forEach(alias => {
      const aliasUrl = `https://confluxai.in/services/${alias}`;
      writePage(`/services/${alias}`, serviceTitle, svc.headline, aliasUrl, schemas, serviceBodyHtml);
      serviceCount++;
    });
  }
});

// ── 4. PRE-RENDER WEST BENGAL STATE & DISTRICT HUBS ───────────
const districts = [
  { slug: 'nadia', name: 'Nadia', hq: 'Krishnanagar', hubs: 'Krishnanagar, Kalyani, Ranaghat, Nabadwip, Santipur, Chakdaha' },
  { slug: 'kolkata', name: 'Kolkata', hq: 'Kolkata', hubs: 'Salt Lake Sector V, New Town, Park Street, Bhowanipore' },
  { slug: 'north-24-parganas', name: 'North 24 Parganas', hq: 'Barasat', hubs: 'Bidhannagar, Rajarhat, Barrackpore, Barasat, Basirhat, Taki' },
  { slug: 'south-24-parganas', name: 'South 24 Parganas', hq: 'Alipore', hubs: 'Diamond Harbour, Baruipur, Canning, Kakdwip' },
  { slug: 'howrah', name: 'Howrah', hq: 'Howrah', hubs: 'Howrah City, Shibpur, Uluberia, Domjur' },
  { slug: 'hooghly', name: 'Hooghly', hq: 'Chinsurah', hubs: 'Chinsurah, Chandannagar, Serampore, Singur, Arambagh' },
  { slug: 'paschim-bardhaman', name: 'Paschim Bardhaman', hq: 'Asansol', hubs: 'Asansol, Durgapur, Raniganj, Kulti' },
  { slug: 'purba-bardhaman', name: 'Purba Bardhaman', hq: 'Bardhaman', hubs: 'Bardhaman City, Kalna, Katwa, Memari' },
  { slug: 'birbhum', name: 'Birbhum', hq: 'Suri', hubs: 'Bolpur Santiniketan, Suri, Rampurhat, Sainthia' },
  { slug: 'bankura', name: 'Bankura', hq: 'Bankura', hubs: 'Bankura Town, Bishnupur, Mukutmanipur, Khatra' },
  { slug: 'purulia', name: 'Purulia', hq: 'Purulia', hubs: 'Purulia Town, Ayodhya Hills, Raghunathpur, Jhalda' },
  { slug: 'purba-medinipur', name: 'Purba Medinipur', hq: 'Tamluk', hubs: 'Tamluk, Haldia Port, Digha, Mandarmani, Contai' },
  { slug: 'paschim-medinipur', name: 'Paschim Medinipur', hq: 'Medinipur', hubs: 'Medinipur, Kharagpur, Garhbeta, Ghatal' },
  { slug: 'jhargram', name: 'Jhargram', hq: 'Jhargram', hubs: 'Jhargram Town, Belpahari, Lodhasuli' },
  { slug: 'malda', name: 'Malda', hq: 'English Bazar', hubs: 'English Bazar, Old Malda, Chanchal' },
  { slug: 'uttar-dinajpur', name: 'Uttar Dinajpur', hq: 'Raiganj', hubs: 'Raiganj, Islampur, Kaliaganj, Dalkhola' },
  { slug: 'dakshin-dinajpur', name: 'Dakshin Dinajpur', hq: 'Balurghat', hubs: 'Balurghat, Gangarampur, Buniadpur' },
  { slug: 'murshidabad', name: 'Murshidabad', hq: 'Baharampur', hubs: 'Baharampur, Jangipur, Lalbagh, Jiaganj, Kandi' },
  { slug: 'darjeeling', name: 'Darjeeling', hq: 'Darjeeling', hubs: 'Darjeeling Town, Kurseong, Mirik, Lepchajagat, Siliguri' },
  { slug: 'kalimpong', name: 'Kalimpong', hq: 'Kalimpong', hubs: 'Kalimpong Town, Pedong, Lava, Rishop' },
  { slug: 'jalpaiguri', name: 'Jalpaiguri', hq: 'Jalpaiguri', hubs: 'Jalpaiguri Town, Malbazar, Chalsa, Lataguri' },
  { slug: 'alipurduar', name: 'Alipurduar', hq: 'Alipurduar', hubs: 'Alipurduar Town, Jaigaon Bhutan Border, Falakata' },
  { slug: 'cooch-behar', name: 'Cooch Behar', hq: 'Cooch Behar', hubs: 'Cooch Behar Town, Dinhata, Mathabhanga, Tufanganj' }
];

// Statewide Hubs (/locations AND /locations/west-bengal)
const stateHubSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Remote AI Automation Services in West Bengal | Conflux AI",
  "description": "Conflux AI is a remote-first AI automation and digital solutions agency based in Kolkata, West Bengal, serving businesses across West Bengal, India, and globally.",
  "url": "https://confluxai.in/locations"
};

const stateHubHtml = `
  <div id="root">
    <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
        <nav style="font-size: 13px; font-weight: 700;">
          <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
          <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
          <a href="/locations" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Locations</a>
          <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
          <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
        </nav>
      </div>
    </header>
    <main style="max-width: 1200px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif;">
      <h1 style="font-size: 38px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 12px;">
        AI Automation & Digital Solutions for West Bengal Businesses
      </h1>
      <p style="font-size: 16px; color: #64748b; max-width: 800px; line-height: 1.6; margin-bottom: 36px;">
        Conflux AI delivers custom AI agents, automated workflow pipelines, WhatsApp Business API integrations, and sub-second React platforms for commercial enterprises across all 23 districts of West Bengal.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
        ${districts.map(d => `
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 8px;">
              <a href="/locations/${d.slug}" style="color: #0f172a; text-decoration: none;">${escapeHtml(d.name)} District</a>
            </h2>
            <p style="font-size: 12px; color: #2563eb; font-weight: 700; margin-bottom: 8px;">HQ: ${escapeHtml(d.hq)}</p>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 12px;">
              Key Hubs: ${escapeHtml(d.hubs)}
            </p>
            <a href="/locations/${d.slug}" style="font-size: 12px; color: #2563eb; font-weight: 800; text-decoration: none;">View District Strategy &rarr;</a>
          </div>
        `).join('')}
      </div>
    </main>
  </div>
`;

writePage('/locations', 'Remote AI Automation Services Across West Bengal | Conflux AI', 'Conflux AI provides remote-first AI automation, WhatsApp lead bots, custom chatbots, and web development for businesses across all districts of West Bengal.', 'https://confluxai.in/locations', [stateHubSchema], stateHubHtml);
writePage('/locations/west-bengal', 'Remote AI Automation Services in West Bengal | Conflux AI', 'Conflux AI is a remote-first AI automation and digital solutions agency based in Kolkata, West Bengal, serving businesses across West Bengal, India, and globally.', 'https://confluxai.in/locations/west-bengal', [stateHubSchema], stateHubHtml);

// Pre-render all 23 District Pages (/locations/:slug AND /locations/west-bengal/:slug)
let districtCount = 0;

districts.forEach(d => {
  const districtTitle = `AI Automation Agency Serving ${d.name} District | Conflux AI`;
  const districtDesc = `Conflux AI provides remote-first AI automation, WhatsApp lead bots, custom chatbots, and web development for businesses across ${d.name} district.`;

  // Find related local articles matching this district using structured metadata
  const districtArticles = articles.filter(a => {
    const list = a.districts || a.districtIds || [];
    const normalized = list.map(item => String(item).toLowerCase().replace(/^dist-/, '').trim());
    return normalized.includes(d.slug.toLowerCase());
  }).sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.updatedAt || 0).getTime();
    const dateB = new Date(b.publishedAt || b.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  const visibleArticles = districtArticles.slice(0, 6);

  // Extract Topic Clusters for District
  const topicCountMap = new Map();
  districtArticles.forEach(art => {
    const combinedTopics = [...(art.topics || []), ...(art.category ? [art.category] : [])];
    combinedTopics.forEach(t => {
      const clean = String(t).trim();
      if (!clean) return;
      topicCountMap.set(clean, (topicCountMap.get(clean) || 0) + 1);
    });
  });
  const topicClusters = Array.from(topicCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const getDistrictHtml = (currentUrl) => `
  <div id="root">
    <header style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
      <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <a href="/" style="font-size: 18px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
        <nav style="font-size: 13px; font-weight: 700;">
          <a href="/locations" style="color: #2563eb; text-decoration: none; margin-right: 16px;">&larr; All Districts</a>
          <a href="/blog" style="color: #475569; text-decoration: none; margin-right: 16px;">Blog</a>
          <a href="/contact" style="color: #475569; text-decoration: none;">Contact</a>
        </nav>
      </div>
    </header>
    <main style="max-width: 1100px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif;">
      <nav aria-label="Breadcrumbs" style="font-size: 12px; margin-bottom: 20px; color: #64748b;">
        <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> &gt; <a href="/locations/west-bengal" style="color: #2563eb; text-decoration: none;">West Bengal</a> &gt; <span style="color: #0f172a;">${escapeHtml(d.name)} District</span>
      </nav>

      <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #2563eb; letter-spacing: 0.1em; display: inline-block; margin-bottom: 10px;">
        West Bengal Regional Intelligence &bull; ${escapeHtml(d.name)}
      </span>
      <h1 style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.15; margin-bottom: 16px;">
        AI Automation &amp; Digital Growth for Businesses in ${escapeHtml(d.name)}
      </h1>
      <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 30px;">
        Serving commercial enterprises, local manufacturers, retailers, and tourism operators in ${escapeHtml(d.hubs)} with autonomous speed-to-lead systems and modern web platforms.
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #2563eb; margin-bottom: 8px;">Remote-First Service Delivery to ${escapeHtml(d.name)}</h3>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
          Conflux AI operates a remote collaboration model from Kolkata. We partner with businesses across ${escapeHtml(d.name)} via video consultations, deploy systems to cloud sandboxes, and provide ongoing remote support without physical office overhead.
        </p>
      </div>

      <!-- DISTRICT-BASED ARTICLE DISCOVERY LAYER -->
      <section style="margin-top: 40px; margin-bottom: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
          <div>
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2563eb; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">
              Regional Knowledge Network
            </span>
            <h2 style="font-size: 26px; font-weight: 900; color: #0f172a; margin: 0;">
              Latest Articles from ${escapeHtml(d.name)}
            </h2>
            <p style="font-size: 13px; color: #64748b; margin-top: 6px; margin-bottom: 0;">
              Authoritative local guides, market research, and digital growth blueprints for ${escapeHtml(d.name)} district.
            </p>
          </div>
          <div style="font-size: 12px; font-weight: 800; color: #475569; background: #f1f5f9; padding: 6px 14px; border-radius: 9999px; white-space: nowrap;">
            ${districtArticles.length} Local ${districtArticles.length === 1 ? 'Article' : 'Articles'}
          </div>
        </div>

        ${topicClusters.length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-right: 4px;">Local Topics:</span>
          ${topicClusters.map(t => `
            <a href="/blog?district=${escapeHtml(d.slug)}" style="font-size: 11px; font-weight: 700; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 8px; color: #334155; text-decoration: none;">
              #${escapeHtml(t.name)} (${t.count})
            </a>
          `).join('')}
        </div>
        ` : ''}

        ${districtArticles.length > 0 ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${visibleArticles.map(art => {
            const authorName = typeof art.author === 'object' ? art.author.name : (art.author || 'Conflux AI Editorial');
            return `
            <article style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px; font-size: 10px; font-weight: 800; text-transform: uppercase;">
                  <span style="background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 9999px; border: 1px solid #dbeafe;">${escapeHtml(art.category || 'Local Strategy')}</span>
                  <span style="background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 9999px;">${art.language === 'bn' ? 'বাংলা' : 'English'}</span>
                  <span style="background: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 9999px;">${escapeHtml(d.name)}</span>
                </div>
                <h3 style="font-size: 17px; font-weight: 900; color: #0f172a; line-height: 1.35; margin-bottom: 10px;">
                  <a href="/blog/${escapeHtml(art.slug)}" style="color: #0f172a; text-decoration: none;">${escapeHtml(art.title)}</a>
                </h3>
                <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 16px;">
                  ${escapeHtml(art.excerpt || art.title)}
                </p>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px; font-size: 11px;">
                <span style="color: #94a3b8; font-weight: 700;">By ${escapeHtml(authorName)}</span>
                <a href="/blog/${escapeHtml(art.slug)}" style="color: #2563eb; font-weight: 900; text-decoration: none;">Read Article &rarr;</a>
              </div>
            </article>
            `;
          }).join('')}
        </div>

        ${districtArticles.length > 6 ? `
        <div style="margin-top: 24px; text-align: center;">
          <a href="/blog?district=${escapeHtml(d.slug)}" style="display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 10px 24px; border-radius: 12px; font-size: 12px; font-weight: 800; text-decoration: none;">
            View all ${districtArticles.length} articles from ${escapeHtml(d.name)} &rarr;
          </a>
        </div>
        ` : ''}
        ` : `
        <div style="padding: 36px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; text-align: center;">
          <h4 style="font-size: 16px; font-weight: 800; color: #334155; margin-bottom: 6px;">Articles for ${escapeHtml(d.name)} are coming soon.</h4>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Our research team is actively expanding local business case studies across all West Bengal districts.</p>
          <a href="/blog" style="font-size: 12px; font-weight: 800; color: #2563eb; text-decoration: none;">Explore our West Bengal business &amp; technology insights &rarr;</a>
        </div>
        `}
      </section>

      <div style="margin-top: 40px; padding: 32px; background: #0f172a; border-radius: 20px; color: white; text-align: center;">
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 10px;">Partner With Conflux AI in ${escapeHtml(d.name)}</h3>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">
          Get in touch with our Kolkata engineering team to automate your lead handling and build high-performance web systems.
        </p>
        <a href="https://wa.me/918972517557?text=Hello%20Conflux%20AI,%20I%20am%20a%20business%20owner%20in%20${encodeURIComponent(d.name)}%20interested%20in%20digital%20automation" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 13px;">
          WhatsApp Direct Consultation &rarr;
        </a>
      </div>
    </main>
  </div>
`;

  // ItemList schema for static rendering
  const itemListSchema = visibleArticles.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Local Business & Intelligence Articles from ${d.name}`,
    "itemListElement": visibleArticles.map((art, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": art.title,
      "url": `https://confluxai.in/blog/${art.slug}`
    }))
  } : null;

  // Write /locations/:slug
  const shortUrl = `https://confluxai.in/locations/${d.slug}`;
  const shortSchema = { "@context": "https://schema.org", "@type": "WebPage", "name": districtTitle, "description": districtDesc, "url": shortUrl };
  const shortBreadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" }, { "@type": "ListItem", "position": 2, "name": "Locations", "item": "https://confluxai.in/locations" }, { "@type": "ListItem", "position": 3, "name": `${d.name} District`, "item": shortUrl }] };
  const shortSchemas = itemListSchema ? [shortSchema, shortBreadcrumb, itemListSchema] : [shortSchema, shortBreadcrumb];
  writePage(`/locations/${d.slug}`, districtTitle, districtDesc, shortUrl, shortSchemas, getDistrictHtml(shortUrl));

  // Write /locations/west-bengal/:slug
  const fullUrl = `https://confluxai.in/locations/west-bengal/${d.slug}`;
  const fullSchema = { "@context": "https://schema.org", "@type": "WebPage", "name": districtTitle, "description": districtDesc, "url": fullUrl };
  const fullBreadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" }, { "@type": "ListItem", "position": 2, "name": "West Bengal", "item": "https://confluxai.in/locations/west-bengal" }, { "@type": "ListItem", "position": 3, "name": `${d.name} District`, "item": fullUrl }] };
  const fullSchemas = itemListSchema ? [fullSchema, fullBreadcrumb, itemListSchema] : [fullSchema, fullBreadcrumb];
  writePage(`/locations/west-bengal/${d.slug}`, districtTitle, districtDesc, fullUrl, fullSchemas, getDistrictHtml(fullUrl));

  districtCount++;
});

// ── 4B. PRE-RENDER PUBLISHED SUB-LOCATIONS (CITIES & HUBS) ────
let subLocationCount = 0;

const subLocations = [
  {
    slug: 'ranaghat',
    name: 'Ranaghat',
    districtSlug: 'nadia',
    districtName: 'Nadia',
    title: 'AI Automation Services in Ranaghat | Conflux AI',
    desc: 'Automate wholesale order intake, WhatsApp speed-to-lead qualification, and business workflows for distributors and retailers in Ranaghat, Nadia.',
    h1: 'AI Automation & Digital Workflows for Ranaghat Businesses',
    context: 'Ranaghat is a vital railway logistics junction and primary commercial trading hub connecting Kolkata to Central and Northern Nadia along NH 12 (formerly NH 34). The municipality anchors major wholesale trade in FMCG grocery distribution, agro-processing, food manufacturing, and textile supply.',
    hubs: ['Ranaghat Station Road Wholesale Market', 'NH 12 Commercial & Industrial Belt', 'Rathtala Trading Corridor', 'Subhas Avenue Retail Hub', 'Ranaghat Court Road Business Zone'],
    useCases: [
      {
        title: 'FMCG & Grocery Wholesale Order Automation',
        desc: 'Enables Ranaghat wholesale distributors to ingest dealer purchase orders via WhatsApp 24/7, parse item quantities automatically, and route finalized orders directly into billing sheets without manual transcription.',
        impact: 'Reduces order transcription time by 85% and eliminates after-hours order drop-off across Nadia distributor networks.'
      },
      {
        title: 'Agricultural Food Processing & Distributor Inquiry Intake',
        desc: 'Automates bulk buyer inquiries, product specification delivery, and FSSAI compliance verification for Ranaghat agro-food processing facilities and packaged food manufacturers.',
        impact: 'Accelerates speed-to-lead from hours to under 30 seconds for regional B2B buyer inquiries.'
      }
    ],
    faqs: [
      {
        q: 'How does Conflux AI deliver digital automation services to Ranaghat businesses?',
        a: 'Conflux AI operates a remote-first engineering model from Kolkata. We collaborate with Ranaghat business owners, distributors, and manufacturers via secure video consultations, configure automated workflows in isolated cloud sandboxes, and provide end-to-end deployment and support without requiring physical office overhead.'
      },
      {
        q: 'How can Ranaghat wholesale distributors automate WhatsApp order handling?',
        a: 'We build structured WhatsApp Business API chatbots that present product catalogs, accept multi-line order requests from retailers, validate order details, and instantly notify your sales representatives or dispatch teams.'
      },
      {
        q: 'How does Conflux Verify authenticate registered businesses in Ranaghat?',
        a: 'Conflux Verify cross-references business entities against primary statutory registries—such as the Food Safety and Standards Authority of India (FoSCoS) for food business operators (e.g., Ranaghat Agro Processing Ltd) and the Ministry of Corporate Affairs (MCA)—to provide auditable, evidence-backed trust reports.'
      }
    ],
    verifiedEntities: [
      {
        name: 'Ranaghat Agro Processing Ltd',
        type: 'Registered Corporate Business',
        status: 'SUPPORTED',
        tier: 'Tier 1: Primary Official Registrar',
        identifier: 'FSSAI License: 12823019000452',
        summary: 'Holds an active Food Business Operator (FBO) manufacturing and processing license in Nadia district.',
        relevance: 'Primary agricultural food processing facility in Ranaghat subdivision, supporting commercial food manufacturing across Nadia district.',
        registrarName: 'Food Safety and Standards Authority of India (FoSCoS)',
        registrarUrl: 'https://foscos.fssai.gov.in',
        validThrough: '2028-05-09',
        benchmarkCaseId: 'GT-04',
        verifyUrl: '/verify?entity=Ranaghat+Agro+Processing+Ltd&claim=Ranaghat+Agro+Processing+Ltd+is+registered+under+the+FSSAI+with+an+active+food+business+operator+license+in+Nadia+district',
        articleSlug: 'ranaghat-fmcg-wholesale-grocery-order-intake-automation',
        guideSlug: 'how-to-verify-gst-udyam-registration'
      }
    ]
  },
  {
    slug: 'santipur',
    name: 'Santipur',
    districtSlug: 'nadia',
    districtName: 'Nadia',
    title: 'AI Automation & E-Commerce for Santipur Weavers | Conflux AI',
    desc: 'Conflux AI builds automated WhatsApp saree catalog bots and direct-to-consumer e-commerce platforms for Santipur textile manufacturers.',
    h1: 'AI Automation & Digital Sales Channels for Santipur Textile Trade',
    context: 'Empowering Santipur handloom manufacturers and wholesale saree traders with automated WhatsApp catalogs, B2B lead ingestion, and online sales platforms.',
    hubs: ['Santipur Saree Haat', 'Phulia Handloom Corridor', 'Shantipur Station Bazar'],
    useCases: [
      {
        title: 'Direct-to-Consumer WhatsApp Saree Catalog & Bulk Booking',
        desc: 'Automates festive seasonal wholesale booking and retail catalog distribution for Santipur handloom master weavers and cooperatives.',
        impact: 'Captures 100% of inbound buyer leads during peak Durga Puja inventory acquisition cycles.'
      }
    ],
    faqs: [
      {
        q: 'How can Santipur saree weavers sell directly to retail buyers across India?',
        a: 'Conflux AI builds instant WhatsApp catalog bots and lightweight e-commerce storefronts that display saree collections, calculate wholesale order quantities, and securely receive purchase inquiries.'
      }
    ],
    verifiedEntities: [
      {
        name: 'Santipur Cotton Handloom Weaving Tradition',
        type: 'Geographical Indication (GI) Heritage Cluster',
        status: 'SUPPORTED',
        tier: 'Tier 1: Primary Official Registrar',
        identifier: 'GI Docket: GI-DOCKET-SANTIPUR-84',
        summary: 'Recognized historical cotton handloom weaving craft under Nadia regional patronage documented since the 15th century.',
        relevance: 'Statutory Geographical Indication (GI) heritage craft cluster encompassing Santipur handloom weavers, master artisans, and textile guilds across Nadia.',
        registrarName: 'Geographical Indications Registry (CGPDTM), Govt of India',
        registrarUrl: 'https://ipindiaonline.gov.in',
        benchmarkCaseId: 'GT-47',
        verifyUrl: '/verify?entity=Santipur+Tant+Saree+Guild&claim=Santipur+has+been+a+recognized+center+of+cotton+handloom+weaving+since+the+15th+century+under+the+patronage+of+Nadia+royalty',
        articleSlug: 'santipur-phulia-saree-durga-puja-whatsapp-bulk-booking',
        guideSlug: 'how-to-verify-indian-company-legal-existence'
      }
    ]
  }
];

subLocations.forEach(sub => {
  const fullUrl = `https://confluxai.in/locations/west-bengal/${sub.districtSlug}/${sub.slug}`;
  
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": sub.title,
    "description": sub.desc,
    "url": fullUrl,
    "publisher": { "@type": "Organization", "name": "Conflux AI", "url": "https://confluxai.in/" }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" },
      { "@type": "ListItem", "position": 2, "name": "West Bengal", "item": "https://confluxai.in/locations/west-bengal" },
      { "@type": "ListItem", "position": 3, "name": `${sub.districtName} District`, "item": `https://confluxai.in/locations/west-bengal/${sub.districtSlug}` },
      { "@type": "ListItem", "position": 4, "name": sub.name, "item": fullUrl }
    ]
  };

  const entityItemListSchema = sub.verifiedEntities && sub.verifiedEntities.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Verified Entities and Statutory Registries in ${sub.name}`,
    "description": `Statutory registrations and accredited records verified by Conflux AI for ${sub.name}, ${sub.districtName}.`,
    "itemListElement": sub.verifiedEntities.map((ent, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": ent.name,
      "description": ent.summary,
      "url": `https://confluxai.in${ent.verifyUrl}`
    }))
  } : null;

  const faqSchema = sub.faqs && sub.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": sub.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  } : null;

  const subSchemas = [webPageSchema, breadcrumbSchema];
  if (entityItemListSchema) subSchemas.push(entityItemListSchema);
  if (faqSchema) subSchemas.push(faqSchema);

  const subHtml = `
  <div id="root">
    <header style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
      <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <a href="/" style="font-size: 18px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
        <nav style="font-size: 13px; font-weight: 700;">
          <a href="/locations/west-bengal/${escapeHtml(sub.districtSlug)}" style="color: #2563eb; text-decoration: none; margin-right: 16px;">&larr; ${escapeHtml(sub.districtName)} Hub</a>
          <a href="/verify" style="color: #475569; text-decoration: none; margin-right: 16px;">Verify</a>
          <a href="/blog" style="color: #475569; text-decoration: none; margin-right: 16px;">Blog</a>
          <a href="/contact" style="color: #475569; text-decoration: none;">Contact</a>
        </nav>
      </div>
    </header>
    <main style="max-width: 1100px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif;">
      <nav aria-label="Breadcrumbs" style="font-size: 12px; margin-bottom: 20px; color: #64748b;">
        <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> &gt; <a href="/locations/west-bengal" style="color: #2563eb; text-decoration: none;">West Bengal</a> &gt; <a href="/locations/west-bengal/${escapeHtml(sub.districtSlug)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(sub.districtName)}</a> &gt; <span style="color: #0f172a;">${escapeHtml(sub.name)}</span>
      </nav>

      <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #2563eb; letter-spacing: 0.1em; display: inline-block; margin-bottom: 10px;">
        ${escapeHtml(sub.name)} &bull; ${escapeHtml(sub.districtName)} District
      </span>
      <h1 style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.15; margin-bottom: 16px;">
        ${escapeHtml(sub.h1)}
      </h1>
      <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 30px;">
        ${escapeHtml(sub.context)}
      </p>

      <!-- VERIFIED LOCAL ENTITIES SECTION -->
      ${sub.verifiedEntities && sub.verifiedEntities.length > 0 ? `
      <section style="margin-top: 40px; margin-bottom: 40px;">
        <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.08em; display: block; margin-bottom: 6px;">
            Evidence &amp; Verification Layer
          </span>
          <h2 style="font-size: 26px; font-weight: 900; color: #0f172a; margin: 0;">
            Verified Local Entities &amp; Registries in ${escapeHtml(sub.name)}
          </h2>
          <p style="font-size: 13px; color: #64748b; margin-top: 6px; margin-bottom: 0;">
            Ground-truth statutory registrations, food safety licenses, and historical Geographical Indications (GI) verified against primary government databases for ${escapeHtml(sub.name)}.
          </p>
        </div>

        <div style="display: grid; gap: 24px;">
          ${sub.verifiedEntities.map(ent => `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px;">${escapeHtml(ent.status)}</span>
                  <span style="background: #eff6ff; color: #1e40af; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">${escapeHtml(ent.tier)}</span>
                </div>
                <span style="font-size: 11px; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 4px 10px; border-radius: 9999px;">${escapeHtml(ent.type)}</span>
              </div>

              <h3 style="font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 8px;">${escapeHtml(ent.name)}</h3>
              ${ent.identifier ? `<div style="font-family: monospace; font-size: 12px; font-weight: 700; color: #334155; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 8px; display: inline-block; margin-bottom: 12px;">${escapeHtml(ent.identifier)}</div>` : ''}
              
              <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px; font-weight: 500;">${escapeHtml(ent.summary)}</p>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">Local Industry Relevance:</span>
                <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 0;">${escapeHtml(ent.relevance)}</p>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; font-size: 12px;">
                <div style="background: white; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;">
                  <strong style="color: #64748b; display: block; font-size: 10px; text-transform: uppercase;">Primary Registrar</strong>
                  <span style="color: #0f172a; font-weight: 700;">${escapeHtml(ent.registrarName)}</span>
                </div>
                <div style="background: white; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;">
                  <strong style="color: #64748b; display: block; font-size: 10px; text-transform: uppercase;">Standing &amp; Validity</strong>
                  <span style="color: #059669; font-weight: 700;">${ent.validThrough ? `Active (Valid Through ${escapeHtml(ent.validThrough)})` : 'Active Statutory Docket'}</span>
                </div>
                <div style="background: white; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;">
                  <strong style="color: #64748b; display: block; font-size: 10px; text-transform: uppercase;">Benchmark Case</strong>
                  <span style="color: #0f172a; font-weight: 700; font-family: monospace;">${escapeHtml(ent.benchmarkCaseId)} (100% Deterministic)</span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 16px; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; gap: 16px; font-size: 12px; font-weight: 700;">
                  ${ent.articleSlug ? `<a href="/blog/${escapeHtml(ent.articleSlug)}" style="color: #2563eb; text-decoration: none;">Related ${escapeHtml(sub.name)} Strategy &rarr;</a>` : ''}
                  ${ent.guideSlug ? `<a href="/verify/guides/${escapeHtml(ent.guideSlug)}" style="color: #475569; text-decoration: none;">Verification Guide &rarr;</a>` : ''}
                </div>
                <div style="display: flex; gap: 10px;">
                  <a href="${escapeHtml(ent.registrarUrl)}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; font-weight: 700; color: #64748b; text-decoration: none; padding: 8px 14px;">Official Registrar &rarr;</a>
                  <a href="${escapeHtml(ent.verifyUrl)}" style="font-size: 12px; font-weight: 800; background: #2563eb; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none;">Verify on Conflux &rarr;</a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <!-- COMMERCIAL HUBS -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #2563eb; margin-bottom: 12px;">Key Commercial Trading Zones in ${escapeHtml(sub.name)}</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155; line-height: 1.8;">
          ${sub.hubs.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
        </ul>
      </div>

      <!-- USE CASES -->
      <section style="margin-bottom: 40px;">
        <h2 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 16px;">
          Proven Automation Workflows for ${escapeHtml(sub.name)}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
          ${sub.useCases.map(uc => `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
              <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">${escapeHtml(uc.title)}</h3>
              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 12px;">${escapeHtml(uc.desc)}</p>
              <div style="background: #eff6ff; color: #1e40af; font-size: 12px; font-weight: 700; padding: 8px 12px; border-radius: 8px;">
                Impact: ${escapeHtml(uc.impact)}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- FAQS -->
      ${sub.faqs && sub.faqs.length > 0 ? `
      <section style="margin-bottom: 40px;">
        <h2 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 16px;">
          Frequently Asked Questions: Business Automation in ${escapeHtml(sub.name)}
        </h2>
        <div style="display: grid; gap: 16px;">
          ${sub.faqs.map(f => `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
              <h4 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">${escapeHtml(f.q)}</h4>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">${escapeHtml(f.a)}</p>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <div style="margin-top: 40px; padding: 32px; background: #0f172a; border-radius: 20px; color: white; text-align: center;">
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 10px;">Automate Your ${escapeHtml(sub.name)} Business Operations</h3>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">
          Schedule a direct video consultation with our Kolkata engineering team to deploy custom WhatsApp order pipelines and high-speed web systems.
        </p>
        <a href="https://wa.me/918972517557?text=Hello%20Conflux%20AI,%20I%20am%20a%20business%20owner%20in%20${encodeURIComponent(sub.name)}%20interested%20in%20automation" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 13px;">
          WhatsApp Direct Consultation &rarr;
        </a>
      </div>
    </main>
  </div>
  `;

  writePage(`/locations/west-bengal/${sub.districtSlug}/${sub.slug}`, sub.title, sub.desc, fullUrl, subSchemas, subHtml);
  subLocationCount++;
});

// ── 5. PRE-RENDER CORE STATIC PAGES ───────────────────────────
const staticPages = [
  {
    path: '/discover',
    title: 'Discover Verified Local Businesses | Conflux Business Graph',
    desc: 'Search statutory-verified enterprises, manufacturing plants, artisans, and commercial services across West Bengal.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/discover" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Discover</a>
            <a href="/verify" style="margin: 0 10px; color: #475569; text-decoration: none;">Verify</a>
            <a href="/locations" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Discover Verified Local Businesses & Industry Leaders</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 30px;">
          Search statutory-verified enterprises, manufacturing plants, artisans, and commercial services across West Bengal on the Conflux Business Graph.
        </p>
      </main>
    </div>
    `
  },
  {
    path: '/about',
    title: 'About Us | Conflux AI - Mission & Leadership',
    desc: 'Learn about Conflux AI, founded by Tarunjit Biswas & Shouvik Majumdar. We are a remote-first AI automation and digital solutions agency based in Kolkata, India.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/locations" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">About Conflux AI</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 30px;">
          Conflux AI is a remote-first AI automation and digital solutions agency based in Kolkata, West Bengal, India, serving clients across India and globally. Founded by Tarunjit Biswas (CEO & CTO) and Shouvik Majumdar (CFO & CMO).
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 30px;">
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Tarunjit Biswas</h3>
            <p style="font-size: 12px; color: #2563eb; font-weight: 700; margin-bottom: 10px;">Founder, CEO & CTO</p>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Full-stack software architect specializing in autonomous AI agents, LLM orchestration, and high-concurrency systems.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Shouvik Majumdar</h3>
            <p style="font-size: 12px; color: #2563eb; font-weight: 700; margin-bottom: 10px;">Co-Founder, CFO & CMO</p>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Growth strategist and business development director driving enterprise adoption and strategic commercial partnerships.</p>
          </div>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/solutions',
    title: 'Enterprise AI Solutions & Automation Architecture | Conflux AI',
    desc: 'Explore Conflux AI enterprise automation workflows, custom chatbot integrations, web architecture, and digital transformation solutions.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Services</a>
            <a href="/locations" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Full-Stack AI & Digital Solutions</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 40px;">Explore our end-to-end commercial AI systems, WhatsApp automation bots, sub-second web platforms, and SEO optimization.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
          ${servicesList.map(s => `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
                <a href="/services/${s.id}" style="color: #0f172a; text-decoration: none;">${escapeHtml(s.name)}</a>
              </h2>
              <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 12px;">${escapeHtml(s.headline)}</p>
              <a href="/services/${s.id}" style="font-size: 12px; color: #2563eb; font-weight: 800; text-decoration: none;">Explore Details &rarr;</a>
            </div>
          `).join('')}
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/services',
    title: 'Enterprise AI Solutions & Full-Stack Automation Services | Conflux AI',
    desc: 'Explore Conflux AI enterprise automation workflows, custom chatbot integrations, web architecture, and digital transformation solutions.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Services</a>
            <a href="/locations" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Core Commercial Services</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 40px;">Explore our end-to-end commercial AI systems, WhatsApp automation bots, sub-second web platforms, and SEO optimization.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
          ${servicesList.map(s => `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
                <a href="/services/${s.id}" style="color: #0f172a; text-decoration: none;">${escapeHtml(s.name)}</a>
              </h2>
              <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 12px;">${escapeHtml(s.headline)}</p>
              <a href="/services/${s.id}" style="font-size: 12px; color: #2563eb; font-weight: 800; text-decoration: none;">Explore Details &rarr;</a>
            </div>
          `).join('')}
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/contact',
    title: 'Contact Us | Conflux AI Kolkata',
    desc: 'Connect with Conflux AI engineering leadership in Kolkata, India. Request custom proposals, AI blueprints, and project consultations.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/locations" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/contact" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 800px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 38px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Connect with Conflux AI</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px;">
          Reach out to our engineering leadership in Kolkata. We respond to inquiries and provide custom AI workflow audits within 24 hours.
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <p style="font-size: 15px; margin-bottom: 10px;"><strong>Email:</strong> <a href="mailto:confluxdotai@gmail.com" style="color: #2563eb;">confluxdotai@gmail.com</a></p>
          <p style="font-size: 15px; margin-bottom: 10px;"><strong>Phone / WhatsApp:</strong> <a href="tel:+918972517557" style="color: #2563eb;">+91 8972517557</a></p>
          <p style="font-size: 15px; margin-bottom: 0;"><strong>Headquarters:</strong> Kolkata, West Bengal, India (Remote-First Statewide & Global Collaboration)</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://wa.me/918972517557?text=Hello%20Conflux%20AI,%20I%20would%20like%20to%20consult%20regarding%20digital%20automation" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">
            Chat with Engineering on WhatsApp &rarr;
          </a>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions | Conflux AI',
    desc: 'Answers to common questions regarding AI automation, chatbot integrations, pricing, web development timelines, and services.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/locations" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 900px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 38px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 24px;">Frequently Asked Questions</h1>
        <div style="margin-bottom: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">What services does Conflux AI provide?</h3>
          <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0;">Conflux AI specializes in Enterprise AI Automation, Custom AI Chatbots, WhatsApp Business Automation, High-Performance Web Development, and SEO/GEO Optimization.</p>
        </div>
        <div style="margin-bottom: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">How does Conflux AI work with clients outside Kolkata?</h3>
          <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0;">We operate as a remote-first agency. We conduct comprehensive discovery audits via video calls, build automation workflows in sandbox environments, and deploy cloud infrastructure directly to your business stack with continuous monitoring.</p>
        </div>
        <div style="margin-bottom: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">How long does a standard project take?</h3>
          <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0;">Most custom WhatsApp bots and automated workflows are delivered within 7 to 14 business days. High-performance web applications typically take 2 to 3 weeks.</p>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/verify',
    title: 'Business Claim & Evidence Verification | Conflux Verify',
    desc: 'Investigate and verify business claims against primary registrars, first-party filings, and authoritative evidence sources.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/locations" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/verify" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Verify</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 900px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <div style="display: inline-block; background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; border: 1px solid #dbeafe;">
          Conflux Verify
        </div>
        <h1 style="font-size: 38px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Business Claim & Evidence Investigation</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px;">
          Establish whether an economically important business claim is backed by authoritative primary registrars, first-party records, or unverified secondary assertions.
        </p>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Query-Driven Verification Engine</h2>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 20px;">
            Submit any business or entity claim to inspect its provenance, source tiers, corroborating evidence, and potential conflicting records.
          </p>
          <a href="/verify" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px;">
            Launch Verification Portal &rarr;
          </a>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/verify/methodology',
    title: 'Conflux Verify Methodology & Evidence Standards | Conflux AI',
    desc: 'Deterministic evidence evaluation framework for business claims against primary statutory registries, MCA master data, GSTIN, and accredited ISO repositories.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/verify" style="margin: 0 10px; color: #475569; text-decoration: none;">Verify</a>
            <a href="/verify/methodology" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Methodology</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 900px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <div style="display: inline-block; background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; border: 1px solid #dbeafe;">
          Bounded Epistemic Architecture
        </div>
        <h1 style="font-size: 38px; font-weight: 900; color: #0f172a; line-height: 1.15; margin-bottom: 16px;">Conflux Verify Methodology & Evidence Standards</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 32px;">
          A deterministic evidence and verification framework designed to evaluate business assertions against primary statutory registries, accredited bodies, and verifiable provenance records.
        </p>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Core Safety Invariants</h2>
          <ul style="font-size: 14px; color: #475569; line-height: 1.8; margin-left: 20px;">
            <li><strong>Absence ≠ Contradiction:</strong> Missing records produce INSUFFICIENT_EVIDENCE, never false fraud labels.</li>
            <li><strong>Network Failure ≠ Evidence:</strong> HTTP timeouts and drops degrade safely to UNVERIFIED.</li>
            <li><strong>First-Party ≠ Independent:</strong> Self-disclosures require third-party registrar corroboration.</li>
            <li><strong>Ambiguous Entity ≠ Verified:</strong> Generic trade names require exact registration identifiers.</li>
            <li><strong>Expired ≠ Active:</strong> Lapsed historical certifications return OUTDATED status.</li>
          </ul>
        </div>
        <div style="margin-top: 32px; text-align: center;">
          <a href="/verify" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">
            Open Conflux Verify Portal &rarr;
          </a>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/verify/guides/how-to-verify-indian-company-legal-existence',
    title: 'How to Verify Indian Company Legal Existence (MCA Master Data Guide) | Conflux AI',
    desc: 'Step-by-step guide to verifying an Indian company’s legal existence, 21-character CIN syntax, active ROC status, and incorporation dockets on MCA Master Data.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/verify" style="margin: 0 10px; color: #475569; text-decoration: none;">Verify</a>
            <a href="/verify/methodology" style="margin: 0 10px; color: #475569; text-decoration: none;">Methodology</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 850px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.15; margin-bottom: 16px;">How to Verify Indian Company Legal Existence</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px;">
          Learn how to inspect 21-character Corporate Identity Numbers (CIN), check active Registrar of Companies (ROC) standing, and evaluate legal existence on mca.gov.in.
        </p>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Verification Protocol</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">1. Query MCA Master Data portal at mca.gov.in. 2. Verify CIN format and state ROC code. 3. Confirm Company Status is 'Active' rather than 'Strike Off' or 'Dissolved'.</p>
        </div>
        <a href="/verify" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px;">
          Verify a Company on Conflux Verify &rarr;
        </a>
      </main>
    </div>
    `
  },
  {
    path: '/verify/guides/how-to-verify-gst-udyam-registration',
    title: 'How to Verify GSTIN & MSME Udyam Registration in India | Conflux AI',
    desc: 'Learn how to verify 15-digit GSTIN tax numbers and 19-digit MSME Udyam registration certificates using official government portals.',
    body: `
    <div id="root">
      <main style="max-width: 850px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.15; margin-bottom: 16px;">How to Verify GSTIN & MSME Udyam Registration</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px;">
          Comprehensive guide to validating 15-digit GSTIN tax standing and 19-digit Udyam manufacturing certificates across Indian state jurisdictions.
        </p>
        <a href="/verify" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px;">
          Open Conflux Verify &rarr;
        </a>
      </main>
    </div>
    `
  },
  {
    path: '/verify/guides/how-to-verify-iso-certificate',
    title: 'How to Verify an ISO 9001 / 27001 Certificate (IAF CertSearch Guide) | Conflux AI',
    desc: 'Learn how to detect unaccredited certificate mills and verify authentic ISO 9001, ISO 14001, and ISO 27001 certifications via the IAF CertSearch database.',
    body: `
    <div id="root">
      <main style="max-width: 850px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.15; margin-bottom: 16px;">How to Verify an ISO 9001 / 27001 Certificate</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px;">
          Detect unaccredited certificate mills by validating accredited certification bodies against the International Accreditation Forum (IAF) CertSearch database.
        </p>
        <a href="/verify" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px;">
          Open Conflux Verify &rarr;
        </a>
      </main>
    </div>
    `
  },
  {
    path: '/verify/guides/how-to-check-expired-certification',
    title: 'How to Check Expired & Lapsed Certifications (Temporal Validity Guide) | Conflux AI',
    desc: 'Understand how temporal validity affects ISO accreditations, government licenses, and compliance claims, and learn how to identify lapsed certifications.',
    body: `
    <div id="root">
      <main style="max-width: 850px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.15; margin-bottom: 16px;">How to Check Expired & Lapsed Certifications</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px;">
          Understand 3-year certification cycles, surveillance audits, and why historical compliance differs from active legal standing.
        </p>
        <a href="/verify" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px;">
          Open Conflux Verify &rarr;
        </a>
      </main>
    </div>
    `
  },
  {
    path: '/verify/guides/active-vs-struck-off-company',
    title: 'Active vs Struck-Off Company: Legal Differences & Verification | Conflux AI',
    desc: 'Understand the legal consequences of MCA Section 248 Strike-Off status, and learn why struck-off companies cannot enter into enforceable commercial contracts.',
    body: `
    <div id="root">
      <main style="max-width: 850px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.15; margin-bottom: 16px;">Active vs Struck-Off Company: Legal Differences</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px;">
          Explore Section 248 of the Companies Act, 2013 and understand why struck-off corporate shells lose commercial contracting capacity.
        </p>
        <a href="/verify" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px;">
          Open Conflux Verify &rarr;
        </a>
      </main>
    </div>
    `
  },
  {
    path: '/verify/guides/company-not-found-does-not-mean-fake',
    title: 'Why "Company Not Found" Does Not Mean Fake (Absence ≠ Contradiction) | Conflux AI',
    desc: 'Learn why the absence of a record in a single database does not prove a business is fake, and understand Conflux Verify’s core principle: Absence ≠ Contradiction.',
    body: `
    <div id="root">
      <main style="max-width: 850px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.15; margin-bottom: 16px;">Why "Company Not Found" Does Not Mean Fake</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px;">
          Learn why database absence, unindexed proprietorships, and search timeouts must never be treated as fraud.
        </p>
        <a href="/verify" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px;">
          Open Conflux Verify &rarr;
        </a>
      </main>
    </div>
    `
  },
  {
    path: '/creative',
    title: 'Creative Suite & Video Editing Services | Conflux AI',
    desc: 'High-impact video editing, social media management, graphic design, and retention-focused creative direction by Conflux AI.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/creative" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Creative</a>
            <a href="/work" style="margin: 0 10px; color: #475569; text-decoration: none;">Work</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Digital Creative Suite</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 36px;">
          Premium visual assets, high-retention video editing, graphic design, and strategic branding that gives your business an unfair advantage in the attention economy.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 36px;">
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">High-Retention Video Editing</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Short-form and long-form video production, motion graphics, and retention-engineered pacing for commercial reach.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Brand Identity & UI Design</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Precision graphic design, high-converting thumbnails, social media creatives, and cohesive visual systems.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Social Media Growth Strategy</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Data-backed content distribution, audience engagement workflows, and continuous brand narrative scaling.</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="/contact" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">
            Book Creative Consultation &rarr;
          </a>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/impact',
    title: 'Client Impact & Growth Metrics | Conflux AI',
    desc: 'See how Conflux AI delivers measurable ROI, autonomous workflows, and accelerated growth for modern enterprises.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/impact" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Impact</a>
            <a href="/work" style="margin: 0 10px; color: #475569; text-decoration: none;">Work</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Client Impact & Growth Metrics</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 36px;">
          Scaling reach, fostering trust, and driving measurable social transformation through intelligent automation, autonomous lead pipelines, and community engagement.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 36px;">
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Empowerment</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Providing autonomous tools and digital infrastructure that allow local MSMEs and regional enterprises to compete on a global scale.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Transparency</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Building deterministic systems and verification engines that are open, auditable, and verifiable for every enterprise partner.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Innovation</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Pushing the boundaries of agentic AI workflows, sub-second web platforms, and generative search visibility.</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="/contact" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">
            Partner for Impact &rarr;
          </a>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/portfolio',
    title: 'Selected Client Work & Case Studies | Conflux AI',
    desc: 'View live client projects, screen video demos, and visual web applications built by Conflux AI across e-commerce, hospitality, and consultancy.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/work" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Work</a>
            <a href="/locations" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Selected Client Work & Case Studies</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 36px;">
          A curated selection of high-impact AI implementations, visual web applications, and growth strategies engineered by Conflux AI across e-commerce, hospitality, and consultancy.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 36px;">
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">AURA — Luxury Brand Platform</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">High-performance digital luxury experience featuring 3D product previews and automated WhatsApp inquiries.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">AURUM — High-Converting E-Commerce</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Sub-second product catalog with frictionless UPI payments and automated WhatsApp order dispatch.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Joy Consultancy — Enterprise Lead Engine</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Automated appointment booking and intelligent prospect qualification pipeline.</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="/contact" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">
            Launch Your Project &rarr;
          </a>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/work',
    title: 'Selected Client Work & Case Studies | Conflux AI',
    desc: 'View live client projects, screen video demos, and visual web applications built by Conflux AI across e-commerce, hospitality, and consultancy.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/work" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Work</a>
            <a href="/locations" style="margin: 0 10px; color: #475569; text-decoration: none;">Locations</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Selected Client Work & Case Studies</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 36px;">
          A curated selection of high-impact AI implementations, visual web applications, and growth strategies engineered by Conflux AI across e-commerce, hospitality, and consultancy.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 36px;">
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">AURA — Luxury Brand Platform</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">High-performance digital luxury experience featuring 3D product previews and automated WhatsApp inquiries.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">AURUM — High-Converting E-Commerce</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Sub-second product catalog with frictionless UPI payments and automated WhatsApp order dispatch.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Joy Consultancy — Enterprise Lead Engine</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Automated appointment booking and intelligent prospect qualification pipeline.</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="/contact" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">
            Launch Your Project &rarr;
          </a>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/careers',
    title: 'Careers & Engineering Opportunities | Join Conflux AI',
    desc: 'Join Conflux AI in building next-generation AI automation, web infrastructure, and generative engine optimization tools.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/careers" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Careers</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Careers & Engineering Opportunities</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 36px;">
          We are a high-performance engineering team of AI architects, full-stack developers, and growth strategists building autonomous systems and next-generation web platforms.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 36px;">
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Autonomous First</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">We build self-healing, intelligent microservices and workflows that execute 24/7 with zero manual overhead.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">High Impact</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Every line of code directly drives measurable client throughput, revenue growth, and conversion acceleration.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Continuous Innovation</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Experimentation with cutting-edge LLMs, multi-agent frameworks, vector indexing, and edge architectures.</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:confluxdotai@gmail.com?subject=Spontaneous Application — Conflux AI Talent Pool" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">
            Send Portfolio to Talent Pool &rarr;
          </a>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/authority',
    title: 'Technical Authority & Security Standards | Conflux AI',
    desc: 'Review Conflux AI verification signals, security benchmarks, clean web architecture, and data protection standards.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/authority" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Authority</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Technical Authority & Security Standards</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 36px;">
          Establishing unshakeable digital authority, entity signals, clean web architectures, and data verification across modern search and AI environments.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 36px;">
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Deterministic Verification</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Multi-tiered validation against statutory registries, MCA master records, GSTIN, and IAF accredited databases.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Security & Performance</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Sub-second TTFB, strict CSP guardrails, input sanitization, and enterprise-grade data isolation.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Entity Graph Signals</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Schema.org JSON-LD knowledge graphs engineered for Google AI Overviews, Perplexity, and ChatGPT citation.</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="/contact" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">
            Claim Your Authority &rarr;
          </a>
        </div>
      </main>
    </div>
    `
  },
  {
    path: '/semantic-map',
    title: 'Generative Engine Optimization (GEO) & Semantic Map | Conflux AI',
    desc: 'Learn how Conflux AI optimizes entity graphs and knowledge bases for AI search engines like Gemini, ChatGPT, and Perplexity.',
    body: `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
        <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <a href="/" style="font-size: 20px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
          <nav style="font-size: 13px; font-weight: 700;">
            <a href="/" style="margin: 0 10px; color: #475569; text-decoration: none;">Home</a>
            <a href="/services" style="margin: 0 10px; color: #475569; text-decoration: none;">Services</a>
            <a href="/semantic-map" style="margin: 0 10px; color: #2563eb; text-decoration: none;">Semantic Map</a>
            <a href="/blog" style="margin: 0 10px; color: #475569; text-decoration: none;">Blog</a>
            <a href="/contact" style="margin: 0 10px; color: #475569; text-decoration: none;">Contact</a>
          </nav>
        </div>
      </header>
      <main style="max-width: 1100px; margin: 0 auto; padding: 50px 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-size: 40px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 16px;">Generative Engine Optimization & Semantic Map</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 36px;">
          Deep ecosystem mapping, entity-relationship graphs, and knowledge connectivity strategies that position modern enterprises for next-generation AI model retrievals.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 36px;">
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Entity-Relationship Mapping</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Mapping relationships between business entities, geographic service areas, and commercial capabilities.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Vector Search & RAG Ready</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Structuring unstructured business data for high-accuracy embedding retrieval by AI search bots.</p>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Knowledge Graph Optimization</h2>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Nested JSON-LD schemas linking Organization, Services, Locations, FAQs, and Authoritative citations.</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="/contact" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">
            Start Semantic Mapping &rarr;
          </a>
        </div>
      </main>
    </div>
    `
  }
];

staticPages.forEach(p => {
  writePage(p.path, p.title, p.desc, `https://confluxai.in${p.path}`, [], p.body);
});

console.log(`[Prerender] Successfully generated:
  - 1 /blog index catalog (62 articles)
  - ${articleCount} individual /blog/:slug articles
  - ${serviceCount} service pages (including aliases)
  - 2 statewide hub pages (/locations and /locations/west-bengal)
  - ${districtCount * 2} district pages (/locations/:slug and /locations/west-bengal/:slug)
  - ${subLocationCount} published town hub pages (/locations/west-bengal/:district/:city)
  - ${staticPages.length} core static pages
Total pre-rendered snapshots: ${1 + articleCount + serviceCount + 2 + (districtCount * 2) + subLocationCount + staticPages.length}`);
