// Centralized SEO and Social Metadata Manager

import { getCanonicalUrl } from './canonicalUrl';

export interface MetaConfig {
  title: string;
  description: string;
  canonicalUrl?: string;
  imageUrl?: string;
  author?: string;
  publishedTime?: string;
  robots?: string; // e.g. 'index, follow' or 'noindex, follow'
  type?: 'website' | 'article';
}

const setOrCreateTag = (selector: string, createElementFn: () => HTMLElement, updateFn: (el: HTMLElement) => void) => {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(selector) as HTMLElement;
  if (!el) {
    el = createElementFn();
    document.head.appendChild(el);
  }
  updateFn(el);
};

export const applySeoMetadata = (config: MetaConfig) => {
  if (typeof document === 'undefined') return;

  // Title
  document.title = config.title;

  // Description
  setOrCreateTag(
    'meta[name="description"]',
    () => {
      const el = document.createElement('meta');
      el.setAttribute('name', 'description');
      return el;
    },
    (el) => el.setAttribute('content', config.description)
  );

  // Author
  if (config.author) {
    setOrCreateTag(
      'meta[name="author"]',
      () => {
        const el = document.createElement('meta');
        el.setAttribute('name', 'author');
        return el;
      },
      (el) => el.setAttribute('content', config.author!)
    );
  }

  // Robots
  const robotsValue = config.robots || 'index, follow';
  setOrCreateTag(
    'meta[name="robots"]',
    () => {
      const el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      return el;
    },
    (el) => el.setAttribute('content', robotsValue)
  );

  // Canonical Link
  const canonicalUrl = config.canonicalUrl || getCanonicalUrl(window.location.pathname);
  setOrCreateTag(
    'link[rel="canonical"]',
    () => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      return el;
    },
    (el) => el.setAttribute('href', canonicalUrl)
  );

  // Open Graph
  const ogTags: Record<string, string> = {
    'og:type': config.type || 'website',
    'og:site_name': 'Conflux AI',
    'og:url': canonicalUrl,
    'og:title': config.title,
    'og:description': config.description,
    'og:image': config.imageUrl || 'https://confluxai.in/logo.png',
    ...(config.publishedTime && { 'article:published_time': config.publishedTime }),
    ...(config.author && { 'article:author': config.author })
  };

  Object.entries(ogTags).forEach(([property, content]) => {
    setOrCreateTag(
      `meta[property="${property}"]`,
      () => {
        const el = document.createElement('meta');
        el.setAttribute('property', property);
        return el;
      },
      (el) => el.setAttribute('content', content)
    );
  });

  // Twitter Cards
  const twitterTags: Record<string, string> = {
    'twitter:card': 'summary_large_image',
    'twitter:site': '@ConfluxA12947',
    'twitter:title': config.title,
    'twitter:description': config.description,
    'twitter:image': config.imageUrl || 'https://confluxai.in/logo.png'
  };

  Object.entries(twitterTags).forEach(([name, content]) => {
    setOrCreateTag(
      `meta[name="${name}"]`,
      () => {
        const el = document.createElement('meta');
        el.setAttribute('name', name);
        return el;
      },
      (el) => el.setAttribute('content', content)
    );
  });
};
