class RateLimiter {
  private request = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    setInterval(() => this.cleanUp(), 60000);
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.request.get(identifier) || [];

    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.request.set(identifier, recentRequests);

    return true;
  }

  cleanUp() {
    const now = Date.now();
    for (const [key, timestamp] of this.request.entries()) {
      const recent = timestamp.filter(
        (timestamp) => now - timestamp < this.windowMs
      );
      if (recent.length === 0) {
        this.request.delete(key);
        return;
      }

      this.request.set(key, recent);
    }
  }
}
