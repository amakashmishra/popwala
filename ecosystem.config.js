module.exports = {
  apps: [
    {
      name: "pop-wala-api",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "development",
      },
      env_development: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      env_staging: {
        NODE_ENV: "staging",
      },
    },
  ],
};
