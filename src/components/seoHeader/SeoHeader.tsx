import React from "react";
import { Helmet } from "react-helmet-async";
import {
  greeting,
  seo,
  socialMediaLinks,
  experience,
} from "../../portfolio";

interface SchemaOrgPerson {
  "@context": "https://schema.org/";
  "@type": "Person";
  name: string;
  url?: string;
  email?: string;
  sameAs: string[];
  jobTitle?: string;
  worksFor?: {
    "@type": "Organization";
    name: string;
  };
  hasCredential: string[];
}

const SeoHeader: React.FC = () => {
  const sameAs: string[] = [
    socialMediaLinks.github,
    socialMediaLinks.linkedin,
    socialMediaLinks.instagram,
  ].filter(Boolean);

  const mail = socialMediaLinks.gmail;

  const job = experience.sections
    ?.find((section) => section.work)
    ?.experiences?.at(0);

  const credentials: string[] = [];

  const data: SchemaOrgPerson = {
    "@context": "https://schema.org/",
    "@type": "Person",
    name: greeting.title,
    url: seo?.og?.url,
    email: mail,
    sameAs: sameAs,
    jobTitle: job?.title,
    worksFor: job ? {
      "@type": "Organization",
      name: job.company,
    } : undefined,
    hasCredential: credentials,
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta property="og:title" content={seo?.og?.title} />
      <meta property="og:type" content={seo?.og?.type} />
      <meta property="og:url" content={seo?.og?.url} />
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

export default SeoHeader;
