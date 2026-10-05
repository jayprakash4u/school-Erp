import type { NextConfig } from "next";
import os from "os";

// Automatically discover all local network IPs on the host machine
const getLocalIpOrigins = (): string[] => {
  const origins = [
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
    "192.168.1.69",
    "192.168.1.69:3000",
  ];

  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          origins.push(iface.address);
          origins.push(`${iface.address}:3000`);
        }
      }
    }
  } catch {
    // fallback
  }

  return Array.from(new Set(origins));
};

const backendUrl =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  // Allow Turbopack dev server cross-origin access from other devices
  allowedDevOrigins: getLocalIpOrigins(),

  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
    ];
  },

  async rewrites() {
    if (!backendUrl) {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
