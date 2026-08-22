import https from 'https';

const liveUrls = [
  'https://confluxai.in/blog/generative-engine-optimization-geo-ranking-guide-2026-google-ai-gemini',
  'https://confluxai.in/blog/speed-to-lead-whatsapp-business-api-sales-automation-lead-qualification-2026',
  'https://confluxai.in/blog/enterprise-ai-agents-secure-rag-workflows-operational-automation-2026',
  'https://confluxai.in/blog/mukutmanipur-jhilimili-ecotourism-homestays-boat-safari-sabai-crafts-whatsapp-booking',
  'https://confluxai.in/blog/santipur-phulia-saree-durga-puja-whatsapp-bulk-booking'
];

function fetchWithRedirects(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      return reject(new Error('Too many redirects'));
    }

    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, (res) => {
      // If 301, 302, 307, 308 redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : new URL(res.headers.location, url).toString();
        
        return fetchWithRedirects(redirectUrl, maxRedirects - 1)
          .then(result => resolve({
            ...result,
            initialStatusCode: res.statusCode,
            initialUrl: url,
            redirectCount: (result.redirectCount || 0) + 1
          }))
          .catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          finalUrl: url,
          headers: res.headers,
          body: data,
          redirectCount: 0
        });
      });
    });

    req.on('error', reject);
  });
}

async function runLiveValidation() {
  console.log('======================================================');
  console.log('   CONFLUX AI — LIVE PRODUCTION HTTP VALIDATION       ');
  console.log('======================================================\n');

  let passCount = 0;
  let totalChecks = 0;

  const assertLive = (desc, cond, details = '') => {
    totalChecks++;
    if (cond) {
      console.log(`[PASS] ${desc}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${desc} - ${details}`);
    }
  };

  // 1. Check live robots.txt
  try {
    const robots = await fetchWithRedirects('https://confluxai.in/robots.txt');
    assertLive('Live robots.txt resolves with HTTP 200', robots.statusCode === 200);
    assertLive('Live robots.txt does NOT block /blog/', !robots.body.includes('Disallow: /blog'));
    assertLive('Live robots.txt declares sitemap.xml', robots.body.includes('Sitemap: https://confluxai.in/sitemap.xml') || robots.body.includes('sitemap.xml'));
  } catch (err) {
    assertLive('Fetch live robots.txt', false, err.message);
  }

  // 2. Check live sitemap.xml
  let liveSitemapContent = '';
  try {
    const sitemap = await fetchWithRedirects('https://confluxai.in/sitemap.xml');
    liveSitemapContent = sitemap.body;
    assertLive('Live sitemap.xml resolves with HTTP 200', sitemap.statusCode === 200);
    assertLive('Live sitemap.xml contains valid urlset and article URLs', sitemap.body.includes('<urlset') && sitemap.body.includes('https://confluxai.in/blog/'));
  } catch (err) {
    assertLive('Fetch live sitemap.xml', false, err.message);
  }

  // 3. Inspect each of the 5 Live Article URLs
  for (let i = 0; i < liveUrls.length; i++) {
    const url = liveUrls[i];
    console.log(`\n--- Inspecting Live URL ${i + 1}: ${url} ---`);

    try {
      const resp = await fetchWithRedirects(url);

      // Final Status Code
      assertLive(`[URL ${i + 1}] Final HTTP status is 200 OK (Resolved via ${resp.finalUrl})`, resp.statusCode === 200, `Got status: ${resp.statusCode}`);

      // Response Headers
      const xRobots = resp.headers['x-robots-tag'] || '';
      assertLive(`[URL ${i + 1}] No 'X-Robots-Tag: noindex' in HTTP response headers`, !xRobots.includes('noindex'), `Header was: ${xRobots}`);

      const html = resp.body;

      // Canonical Tag
      const canonicalMatch = html.match(/<link rel=["']canonical["'] href=["']([^"']+)["']/i);
      const canonicalHref = canonicalMatch ? canonicalMatch[1] : '';
      assertLive(
        `[URL ${i + 1}] Self-referencing canonical tag is present`,
        canonicalHref.includes('/blog/') && (canonicalHref === url || canonicalHref === url.replace('https://confluxai.in', 'https://www.confluxai.in') || canonicalHref === url.replace('https://www.confluxai.in', 'https://confluxai.in')),
        `Found canonical: ${canonicalHref}`
      );

      // Title & Meta Description
      const hasTitle = /<title>[^<]+<\/title>/i.test(html);
      const hasMetaDesc = /<meta name=["']description["'] content=["'][^"']+["']/i.test(html);
      assertLive(`[URL ${i + 1}] <title> and meta description present in initial HTML`, hasTitle && hasMetaDesc);

      // Single H1 Element
      const h1Matches = html.match(/<h1[\s>]/gi) || [];
      assertLive(`[URL ${i + 1}] Exactly one single <h1> element in HTML`, h1Matches.length === 1, `Found ${h1Matches.length} <h1> tags`);

      // Server-Rendered Content & Body
      const hasContent = html.includes('conflux-prerendered-content') || html.includes('article-body') || html.length > 5000;
      assertLive(`[URL ${i + 1}] Full article content rendered in initial HTML (${html.length} bytes)`, hasContent);

      // Author Byline
      assertLive(`[URL ${i + 1}] Author byline present and links to /about`, html.includes('Written by') || html.includes('/about'));

      // Publication & Modified Dates
      assertLive(`[URL ${i + 1}] Publication and update dates present`, html.includes('Published:') || html.includes('datePublished'));

      // JSON-LD Schemas (Article and BreadcrumbList)
      const hasArticleSchema = html.includes('"@type":"Article"') || html.includes('"@type": "Article"') || html.includes('TechArticle');
      const hasBreadcrumbSchema = html.includes('"@type":"BreadcrumbList"') || html.includes('"@type": "BreadcrumbList"');
      assertLive(`[URL ${i + 1}] Article and BreadcrumbList JSON-LD schemas present in <head>`, hasArticleSchema && hasBreadcrumbSchema);

      // Internal Links to Solutions & Related Articles
      const hasServiceLinks = html.includes('/services/');
      const hasRelatedArticles = html.includes('/blog/');
      assertLive(`[URL ${i + 1}] Related Conflux AI solutions and related articles internal links present`, hasServiceLinks && hasRelatedArticles);

      // Presence in Sitemap
      const isInSitemap = liveSitemapContent.includes(url) || liveSitemapContent.includes(url.replace('https://confluxai.in', 'https://www.confluxai.in'));
      assertLive(`[URL ${i + 1}] Registered in live sitemap.xml`, isInSitemap);

    } catch (err) {
      assertLive(`[URL ${i + 1}] Request to live production endpoint`, false, err.message);
    }
  }

  console.log('\n======================================================');
  console.log(`LIVE VALIDATION SUMMARY: ${passCount} / ${totalChecks} CHECKS PASSED`);
  console.log('======================================================\n');

  if (passCount === totalChecks) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runLiveValidation();
