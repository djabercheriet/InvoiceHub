import { Redis } from '@upstash/redis';

type CacheEntry<T> = {
  value: T;
  expiry: number;
};

// Simple global memory cache for development / VPS single-instance
const memoryCache = new Map<string, CacheEntry<any>>();

// Redis client setup
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

/**
 * Generic caching wrapper.
 * Defaults to memory cache but can be extended to use Redis.
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 3600 // 1 hour default
): Promise<T> {
  const now = Date.now();

  // Prefer Redis if configured
  if (redis) {
    const cached = await redis.get<T>(key);
    if (cached) {
      console.log(`[Cache: HIT (Redis)] ${key}`);
      return cached;
    }
    
    console.log(`[Cache: MISS (Redis)] ${key}`);
    const freshData = await fetchFn();
    await redis.setex(key, ttlSeconds, freshData);
    return freshData;
  }

  // Fallback to memory
  const cached = memoryCache.get(key);

  if (cached && cached.expiry > now) {
    console.log(`[Cache: HIT (Memory)] ${key}`);
    return cached.value;
  }

  console.log(`[Cache: MISS (Memory)] ${key}`);
  const freshData = await fetchFn();
  
  memoryCache.set(key, {
    value: freshData,
    expiry: now + (ttlSeconds * 1000),
  });

  return freshData;
}

/**
 * Clear cache by key or pattern
 */
export async function invalidateCache(pattern?: string) {
  if (redis) {
    if (!pattern) return; // Full flush not recommended here typically
    const keys = await redis.keys(`*${pattern}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return;
  }

  if (!pattern) {
    memoryCache.clear();
    return;
  }
  
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
}
