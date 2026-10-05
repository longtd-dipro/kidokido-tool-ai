const { createSecureHeaders } = require("next-secure-headers");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@fullcalendar/common",
    "@fullcalendar/daygrid",
    "@fullcalendar/interaction",
    "@fullcalendar/react",
    "@fullcalendar/timegrid",
    "@fullcalendar/list",
  ],
  async headers() {
    return [{ source: "/(.*)", headers: createSecureHeaders() }];
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Custom webpack here
    }

    return config;
  },
};

module.exports = nextConfig;
