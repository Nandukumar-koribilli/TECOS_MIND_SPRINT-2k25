import { useEffect } from 'react';

type SeoProps = {
  title: string;
  description?: string;
  url?: string;
};

const DEFAULT_DESCRIPTION =
  'Smart Kisan connects farmers and landowners with dashboards, crop insights, pest control, and smart irrigation controls.';

const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
  const selector = `meta[${attribute}="${key}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

export const Seo = ({ title, description, url }: SeoProps) => {
  useEffect(() => {
    const summary = description?.trim() || DEFAULT_DESCRIPTION;
    const canonicalUrl = url || window.location.href;

    document.title = title;
    setMetaTag('name', 'description', summary);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', summary);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', summary);
    setMetaTag('property', 'og:url', canonicalUrl);

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonicalUrl;
      document.head.appendChild(link);
    }
  }, [title, description, url]);

  return null;
};
