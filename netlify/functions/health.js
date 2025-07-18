
// Health check function for Netlify
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      netlify: process.env.NETLIFY === "true",
      message: "Beauty GO API is running successfully on Netlify!"
    }),
  };
};
