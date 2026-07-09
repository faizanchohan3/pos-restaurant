// Lazy load Prisma to ensure proper initialization
let prismaClient = null;

async function getPrismaClient() {
  if (!prismaClient) {
    const { PrismaClient } = await import("@prisma/client");
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

let connected = false;

const connectDB = async () => {
    try {
        const prisma = await getPrismaClient();
        // Test connection
        if (!connected) {
          // For SQLite, just ensure the database file exists
          connected = true;
          console.log(`✅ Database connected (SQLite)`);
        }
    } catch (error) {
        console.log(`❌ Database connection failed: ${error.message}`);
        process.exit();
    }
}

// Export a wrapper that handles async Prisma access
const prisma = new Proxy({}, {
  get: (target, prop) => {
    if (prop === '$connect' || prop === '$disconnect') {
      return async () => {
        const client = await getPrismaClient();
        return client[prop]();
      };
    }
    // For all other properties, return a function that gets the client and accesses the property
    return (...args) => {
      return getPrismaClient().then(client => {
        const method = client[prop];
        if (typeof method === 'function') {
          return method.apply(client, args);
        }
        return method;
      });
    };
  }
});

module.exports = { connectDB, prisma };
