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

const writePage = (routePath, pageTitle, metaDescription, canonicalUrl, schemas, bodyContent) => {
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
  }

  // OG & Twitter Meta
  if (html.includes('property="og:title"')) {
    html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`);
  }
  if (html.includes('property="og:description"')) {
    html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(metaDescription)}" />`);
  }
  if (html.includes('property="og:url"')) {
    html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonicalUrl}" />`);
  }
  if (html.includes('property="twitter:title"')) {
    html = html.replace(/<meta property="twitter:title"[^>]*>/, `<meta property="twitter:title" content="${escapeHtml(pageTitle)}" />`);
  }
  if (html.includes('property="twitter:description"')) {
    html = html.replace(/<meta property="twitter:description"[^>]*>/, `<meta property="twitter:description" content="${escapeHtml(metaDescription)}" />`);
  }
  if (html.includes('property="twitter:url"')) {
    html = html.replace(/<meta property="twitter:url"[^>]*>/, `<meta property="twitter:url" content="${canonicalUrl}" />`);
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

  writePage(`/blog/${slug}`, title, description, canonicalUrl, schemas, serverRenderedBody);
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

  // Find related local articles matching this district
  const districtArticles = articles.filter(a => 
    (a.districtIds && a.districtIds.includes(`dist-${d.slug}`)) ||
    (a.locationIds && a.locationIds.includes(`dist-${d.slug}`)) ||
    a.slug.toLowerCase().includes(d.slug) ||
    a.title.toLowerCase().includes(d.name.toLowerCase())
  );

  const getDistrictHtml = (currentUrl) => `
  <div id="root">
    <header style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif;">
      <div style="max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <a href="/" style="font-size: 18px; font-weight: 900; color: #0f172a; text-decoration: none;">CONFLUX <span style="color: #2563eb;">AI</span></a>
        <nav style="font-size: 13px; font-weight: 700;">
          <a href="/locations" style="color: #2563eb; text-decoration: none;">&larr; All Districts</a>
        </nav>
      </div>
    </header>
    <main style="max-width: 1000px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif;">
      <nav aria-label="Breadcrumbs" style="font-size: 12px; margin-bottom: 20px; color: #64748b;">
        <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> &gt; <a href="/locations" style="color: #2563eb; text-decoration: none;">Locations</a> &gt; <span style="color: #0f172a;">${escapeHtml(d.name)} District</span>
      </nav>

      <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #2563eb; letter-spacing: 0.1em; display: inline-block; margin-bottom: 10px;">
        West Bengal Regional Intelligence
      </span>
      <h1 style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.15; margin-bottom: 16px;">
        AI Automation &amp; Digital Growth for Businesses in ${escapeHtml(d.name)}
      </h1>
      <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 30px;">
        Serving commercial enterprises, local manufacturers, retailers, and tourism operators in ${escapeHtml(d.hubs)} with autonomous speed-to-lead systems and modern web platforms.
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #2563eb; margin-bottom: 8px;">Remote-First Service Delivery</h3>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
          Conflux AI operates a remote collaboration model from Kolkata. We collaborate with businesses across ${escapeHtml(d.name)} via video consultations, deploy systems to cloud sandboxes, and provide ongoing remote support.
        </p>
      </div>

      ${districtArticles.length > 0 ? `
      <section style="margin-top: 36px;">
        <h2 style="font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 16px;">
          Published Case Studies &amp; Local Business Guides for ${escapeHtml(d.name)}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
          ${districtArticles.map(art => `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px;">
              <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
                <a href="/blog/${art.slug}" style="color: #0f172a; text-decoration: none;">${escapeHtml(art.title)}</a>
              </h3>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 10px;">
                ${escapeHtml(art.excerpt || art.title)}
              </p>
              <a href="/blog/${art.slug}" style="font-size: 11px; color: #2563eb; font-weight: 800; text-decoration: none;">Read Guide &rarr;</a>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

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

  // Write /locations/:slug
  const shortUrl = `https://confluxai.in/locations/${d.slug}`;
  const shortSchema = { "@context": "https://schema.org", "@type": "WebPage", "name": districtTitle, "description": districtDesc, "url": shortUrl };
  const shortBreadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" }, { "@type": "ListItem", "position": 2, "name": "Locations", "item": "https://confluxai.in/locations" }, { "@type": "ListItem", "position": 3, "name": `${d.name} District`, "item": shortUrl }] };
  writePage(`/locations/${d.slug}`, districtTitle, districtDesc, shortUrl, [shortSchema, shortBreadcrumb], getDistrictHtml(shortUrl));

  // Write /locations/west-bengal/:slug
  const fullUrl = `https://confluxai.in/locations/west-bengal/${d.slug}`;
  const fullSchema = { "@context": "https://schema.org", "@type": "WebPage", "name": districtTitle, "description": districtDesc, "url": fullUrl };
  const fullBreadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://confluxai.in/" }, { "@type": "ListItem", "position": 2, "name": "West Bengal", "item": "https://confluxai.in/locations/west-bengal" }, { "@type": "ListItem", "position": 3, "name": `${d.name} District`, "item": fullUrl }] };
  writePage(`/locations/west-bengal/${d.slug}`, districtTitle, districtDesc, fullUrl, [fullSchema, fullBreadcrumb], getDistrictHtml(fullUrl));

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
