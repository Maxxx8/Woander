export interface SubdomainConfig {
  isAdmin: boolean;
  subdomain: string | null;
  mainDomain: string;
}

export function detectSubdomain(): SubdomainConfig {
  if (typeof window === 'undefined') {
    return {
      isAdmin: false,
      subdomain: null,
      mainDomain: ''
    };
  }

  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  if (parts.length >= 3) {
    const subdomain = parts[0];
    const mainDomain = parts.slice(1).join('.');

    return {
      isAdmin: subdomain === 'admin',
      subdomain,
      mainDomain
    };
  }

  if (parts.length === 2 && hostname.includes('localhost')) {
    const subdomain = parts[0];
    return {
      isAdmin: subdomain === 'admin',
      subdomain,
      mainDomain: 'localhost'
    };
  }

  return {
    isAdmin: false,
    subdomain: null,
    mainDomain: hostname
  };
}

export function isAdminSubdomain(): boolean {
  return detectSubdomain().isAdmin;
}

export function getMainSiteUrl(): string {
  const config = detectSubdomain();
  const protocol = window.location.protocol;

  if (config.mainDomain.includes('localhost')) {
    return `${protocol}//${config.mainDomain}:${window.location.port}`;
  }

  return `${protocol}//${config.mainDomain}`;
}

export function getAdminUrl(): string {
  const config = detectSubdomain();
  const protocol = window.location.protocol;

  if (config.mainDomain.includes('localhost')) {
    return `${protocol}//admin.${config.mainDomain}:${window.location.port}`;
  }

  return `${protocol}//admin.${config.mainDomain}`;
}
