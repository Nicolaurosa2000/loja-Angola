import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SITE_NAME = 'Angola Express';
const DEFAULT_DESC = 'A sua loja online de confiança em Angola';
const DEFAULT_IMAGE = '/og-image.png';
const BASE_URL = 'https://angolaexpress.co.ao';

export default function SEO({ title, description, image, url, type = 'website' }: SEOProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageDesc = description || DEFAULT_DESC;
  const pageImage = image || DEFAULT_IMAGE;
  const pageUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />
      {type === 'product' && <meta property="og:price:amount" content={''} />}
    </Helmet>
  );
}
