const { createClient } = require("redis");
const hash = require("object-hash");

let redisClient;

async function initializeRedisClient() {
  const redisURL = process.env.REDIS_URI;
  if (!redisURL) {
    console.error("Redis URI is not defined");
    return;
  }
  redisClient = createClient({ url: redisURL }).on("error", (error) => {
    console.error("Failed to connect to Redis", error);
  });

  try {
    await redisClient.connect();
    console.log("Connected to Redis ⚡⚡⚡");
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

function requestToKey(req) {
  // Add a custom object to use as part of the key
  const reqDataToHash = {
    query: req.query,
    body: req.body,
  };

  return `${req.path}@${hash.sha1(reqDataToHash)}`;
}

function isRedisWorking() {
  return !!redisClient && redisClient.isOpen;
}

async function writeData(key, data, options) {
  if (!isRedisWorking()) {
    return;
  }
  try {
    await redisClient.set(key, JSON.stringify(data), options);
  } catch (error) {
    console.error("Failed to write data to Redis", error);
  }
}

async function readData(key) {
  let cachedData;
  if (!isRedisWorking()) {
    return null;
  }
  try {
    cachedData = await redisClient.get(key);
  } catch (error) {
    console.error("Failed to read data from Redis", error);
  }
  if (!cachedData) {
    return null;
  }
  return JSON.parse(cachedData);
}

function cacheMiddleware(
  options = {
    EX: 21600, // 6 hours
  },
) {
  return async (req, res, next) => {
    if (!isRedisWorking()) {
      return next();
    }
    const key = requestToKey(req);
    // Check if the data is already cached
    console.log("Key", key);

    const cachedData = await readData(key);
    console.log("Cached Data", cachedData);
    if (cachedData) {
      return res.json({
        source: "cache",
        data: JSON.parse(cachedData),
      });
    }
    const originalSend = res.send;
    res.send = async (data) => {
      res.send = originalSend; // Restore original send function

      if (res.statusCode.toString().startsWith("2")) {
        await writeData(key, data, options);
      }

      return res.send(data);
    };
    next();
  };
}

module.exports = { initializeRedisClient, cacheMiddleware };
