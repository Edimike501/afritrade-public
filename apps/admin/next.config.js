/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@afritrade/shared", "@afritrade/ui"],
  async rewrites() {
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4040";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/+$/, "")}/api/:path*`,
      },
    ];
  },
};
