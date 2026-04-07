import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurazione per gestire pagine problematiche con useSearchParams/useRouter
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
