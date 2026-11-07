import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Omite la verificación de ESLint durante la compilación en Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Omite errores menores de tipos durante la compilación si fuera necesario
    ignoreBuildErrors: true,
  },
};

export default nextConfig;