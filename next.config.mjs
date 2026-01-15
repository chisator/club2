import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. ESTO ES VITAL PARA DOCKER
  output: 'standalone', 

  // 2. IMPORTANTE: Si usas <Image /> con fotos de Supabase, agrega esto:
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Permite cargar imágenes desde Supabase
      },
    ],
  },
};

export default withPWA(nextConfig);
