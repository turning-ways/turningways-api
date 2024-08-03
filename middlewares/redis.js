const { createClient } = require("redis");
const hash = require("object-hash");

let redisClient;

async function initializeRedisClient() {
  const redisURL = process.env.REDIS_URI;
  if (!redisURL) {
    throw new Error("Redis URI is not defined in environment variables");
  }

  redisClient = createClient({ url: redisURL });

  redisClient.on("error", (error) => {
    console.error("Redis client error:", error);
  });

  try {
    await redisClient.connect();
    console.log("Connected to Redis ⚡⚡⚡");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
}

function requestToKey(req) {
  // check the url is in the format /api/v1/churches/:churchId/members
  const url = req.originalUrl;
  console.log("Request URL:", url);
  const parts = url.split("/");
  if (
    parts.length !== 5 ||
    parts[1] !== "api" ||
    parts[2] !== "v1" ||
    parts[3] !== "churches"
  ) {
    return null;
  }
  // check if the request has query parameters
  // const query = req.query;
  // if (Object.keys(query).length > 0) {
  //   return null;
  // }
  // hash the request url
  return hash(url);
}

function isRedisWorking() {
  return redisClient?.isOpen || false;
}

async function writeData(key, data, options = {}) {
  if (!isRedisWorking()) {
    throw new Error("Redis client is not connected");
  }

  try {
    await redisClient.set(key, data, options);
  } catch (error) {
    console.error("Failed to write data to Redis:", error);
    throw error;
  }
}

async function readData(key) {
  if (!isRedisWorking()) {
    throw new Error("Redis client is not connected");
  }

  try {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error("Failed to read data from Redis:", error);
    throw error;
  }
}

function cacheMiddleware(options = { EX: 21600 }) {
  return async (req, res, next) => {
    if (!isRedisWorking()) {
      console.warn("Redis is not working, skipping cache middleware");
      return next();
    }

    const key = requestToKey(req);
    console.log("Cache key:", key);

    try {
      const cachedData = await readData(key);
      if (cachedData) {
        console.log("Cache hit");
        return res.json({
          source: "cache",
          data: JSON.parse(cachedData),
        });
      }
      console.log("Cache miss");
    } catch (error) {
      console.error("Error reading from cache:", error);
      // Continue without caching if there's an error
    }

    // Monkey-patch the res.json method
    const originalJson = res.json;
    res.json = async function (data) {
      res.json = originalJson; // Restore original json function

      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await writeData(key, data, options);
          console.log("Data cached successfully");
        } catch (error) {
          console.error("Error writing to cache:", error);
        }
      }

      return res.json(data);
    };

    next();
  };
}

async function clearCache(key) {
  if (!isRedisWorking()) {
    throw new Error("Redis client is not connected");
  }

  try {
    await redisClient.del(key);
    console.log("Cache cleared successfully");
  } catch (error) {
    console.error("Failed to clear cache:", error);
    throw error;
  }
}

module.exports = { initializeRedisClient, cacheMiddleware, clearCache };
