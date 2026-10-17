/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@afritrade/shared", "@afritrade/ui"],
  async rewrites() {
    const rules = [
      {
        source: "/supplier",
        destination: "/dashboard",
      },
      {
        source: "/supplier/:path*",
        destination: "/:path*",
      },
    ];
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4040";
    if (apiUrl) {
      rules.push({
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/+$/, "")}/api/:path*`,
      });
    }
    return rules;
  },
};
