import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

export const guestLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "rl:guest",
    })
  : null;

export const joinLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:join",
    })
  : null;

export async function checkLimit(
  limiter: Ratelimit | null,
  key: string,
): Promise<{ ok: boolean; remaining: number }> {
  if (!limiter) return { ok: true, remaining: Infinity };
  const r = await limiter.limit(key);
  return { ok: r.success, remaining: r.remaining };
}
