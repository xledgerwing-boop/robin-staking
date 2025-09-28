type RateLimitEntry = { count: number; resetTime: number };

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(ip: string, endpoint: string, maxRequests = 10, windowMs = 1000): boolean {
    const key = `${ip}:${endpoint}`;
    const now = Date.now();

    if (!rateLimitMap.has(key)) {
        // First request in the time window
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return true;
    }

    const entry = rateLimitMap.get(key)!;

    if (now > entry.resetTime) {
        // Time window has expired → reset counter
        entry.count = 1;
        entry.resetTime = now + windowMs;
        return true;
    }

    if (entry.count < maxRequests) {
        // Allow request and increase count
        entry.count++;
        return true;
    }

    return false; // Too many requests
}
