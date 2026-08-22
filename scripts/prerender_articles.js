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

// ── 5. PRE-RENDER CORE STATIC PAGES ───────────────────────────
const staticPages = [
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
  - ${staticPages.length} core static pages
Total pre-rendered snapshots: ${1 + articleCount + serviceCount + 2 + (districtCount * 2) + staticPages.length}`);
