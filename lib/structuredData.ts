// Reusable Schema.org JSON-LD Structured Data Generators

export interface SchemaArticleParams {
  title: string;
  slug: string;
  description: string;
  authorName: string;
  authorRole?: string;
  publishedAt: string;
  updatedAt?: string;
  imageUrl?: string;
  category?: string;
  language?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SchemaFAQItem {
  question: string;
  answer: string;
}

export const generateArticleSchema = (params: SchemaArticleParams) => {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": params.title,
    "inLanguage": params.language === 'bn' ? 'bn-IN' : 'en-US',
    "mainEntityOfPage": `https://confluxai.in/blog/${params.slug}`,
    "articleSection": params.category || "AI Automation & Local Intelligence",
    "author": {
      "@type": "Person",
      "name": params.authorName || "Tarunjit Biswas",
      "jobTitle": params.authorRole || "Founder, CEO & CTO, Conflux AI"
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
    "datePublished": params.publishedAt,
    "dateModified": params.updatedAt || params.publishedAt,
    "description": params.description,
    "image": params.imageUrl || "https://confluxai.in/logo.png"
  };
};

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `https://confluxai.in${item.url}`
    }))
  };
};

export const generateFAQSchema = (faqList: SchemaFAQItem[]) => {
  if (!faqList || faqList.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqList.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
};

export const generateLocalBusinessSchema = (business: {
  name: string;
  address: string;
  city: string;
  category?: string;
  phone?: string;
  priceRange?: string;
  url?: string;
  schemaType?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": business.schemaType || "LocalBusiness",
    "name": business.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address,
      "addressLocality": business.city,
      "addressRegion": "West Bengal",
      "addressCountry": "IN"
    },
    ...(business.phone && { "telephone": business.phone }),
    ...(business.priceRange && { "priceRange": business.priceRange }),
    "url": business.url || "https://confluxai.in"
  };
};
