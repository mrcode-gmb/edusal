import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteSEO {
  title: string;
  description: string;
  canonical: string;
}

const routeSEOMap: Record<string, RouteSEO> = {
  '/': {
    title: 'Nexus Edutech Consult Ltd — Career Service Centre Management Platform for Nigerian Tertiary Institutions',
    description: 'Empowering Nigerian Universities, Polytechnics, and Colleges of Education with evidence-backed employability scores, NUC/NBTE/NCCE compliance, SIWES management, and AI career guidance.',
    canonical: 'https://edusal.ng/',
  },
  '/portal/register/institution': {
    title: 'Onboard & Register Your Institution | Nexus Edutech Consult Ltd',
    description: 'Register your Nigerian university, polytechnic, or college of education on the Edusal Career Service Platform. Scoped 4-tier governance, accreditation compliance, and SIWES deployment.',
    canonical: 'https://edusal.ng/portal/register/institution',
  },
  '/portal/login': {
    title: 'Institutional Portal Login | Nexus Edutech Consult Ltd',
    description: 'Sign in to the Institutional Governance & Student Career Portal for FUTMinna, YabaTech, FCE Zaria, Gombe State University, and affiliated tertiary institutions.',
    canonical: 'https://edusal.ng/portal/login',
  },
  '/portal/register': {
    title: 'Create an Account — Student, Counsellor & Employer Workspaces | Edusal',
    description: 'Join the Edusal ecosystem. Create your account as a student, departmental counsellor, institutional administrator, or industry employer.',
    canonical: 'https://edusal.ng/portal/register',
  },
  '/portal/institution': {
    title: 'Institutional Governance Workspace | Nexus Edutech Consult Ltd',
    description: 'Real-time governance pulse, 4-tier academic hierarchy, knowledge base citation verification, staff evaluator directory, and Senate audit pack generation.',
    canonical: 'https://edusal.ng/portal/institution',
  },
  '/portal/forgot-password': {
    title: 'Reset Password | Nexus Edutech Consult Ltd',
    description: 'Recover access to your institutional account or student portal on Nexus Edutech Consult Ltd.',
    canonical: 'https://edusal.ng/portal/forgot-password',
  },
  '/portal/reset-password': {
    title: 'Set New Password | Nexus Edutech Consult Ltd',
    description: 'Update your institutional account credentials securely.',
    canonical: 'https://edusal.ng/portal/reset-password',
  },
};

export const SEOHead = () => {
  const location = useLocation();

  useEffect(() => {
    // Find matching route or fallback to prefix match
    const pathname = location.pathname;
    let seo = routeSEOMap[pathname];

    if (!seo) {
      if (pathname.startsWith('/portal/institution')) {
        seo = routeSEOMap['/portal/institution'];
      } else {
        seo = routeSEOMap['/'];
      }
    }

    // Update title
    document.title = seo.title;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', seo.description);

    // Update OpenGraph Title & Description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seo.description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', seo.canonical);

    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo.canonical);
  }, [location]);

  return null;
};
