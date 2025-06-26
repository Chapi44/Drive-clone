module.exports = {
    apps: [
      {
        name: "starpay-npg",
        script: "npm run dev", // Adjust based on your project structure
        instances: 1, // Adjust for clustering (e.g., "max" for all CPU cores)
        autorestart: true,
        //watch: process.env.NODE_ENV === "development", // Auto-reload in dev mode
        //max_memory_restart: "500M", // Restart if memory usage exceeds 500MB
        env: {
          NODE_ENV: "development",
          PORT: 19938,
        },
        env_production: {
          NODE_ENV: "production",
          PORT: 19938,
        },
      },
    ],
  };
  