// Canonical URL generator and normalizer

const BASE_URL = 'https://confluxai.in';

export const getCanonicalUrl = (pathname: string): string => {
  if (!pathname || pathname === '/') {
    return `${BASE_URL}/`;
  }

  // Remove query parameters, hashes, trailing slashes, and force lowercase
  const cleanPath = pathname
    .split('?')[0]
    .split('#')[0]
    .trim()
    .toLowerCase()
    .replace(/\/+$/, '')
    .replace(/^\/+/, '/');

  return `${BASE_URL}${cleanPath}`;
};

export const getArticleCanonicalUrl = (slug: string): string => {
  const cleanSlug = decodeURIComponent(slug || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\/+$/, '')
    .replace(/^\/+/, '');

  return `${BASE_URL}/blog/${cleanSlug}`;
};
