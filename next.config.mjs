/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["toasttexter.com"],
  },
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**.toasttexter.com",
    },
  ],
}

export default nextConfig
