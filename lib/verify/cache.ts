// In-memory & Deduplication Cache for Conflux Verify

import type { VerificationResult } from '../../types/verify.ts';

class VerifyCacheStore {
  private cache = new Map<string, { result: VerificationResult; cachedAt: number }>();
  private defaultTTL = 1000 * 60 * 60 * 24; // 24 hours

  get(claimHash: string): VerificationResult | null {
    const item = this.cache.get(claimHash);
    if (!item) return null;

    const isExpired = Date.now() - item.cachedAt > this.defaultTTL;
    if (isExpired) {
      this.cache.delete(claimHash);
      return null;
    }

    return {
      ...item.result,
      cacheHit: true
    };
  }

  set(claimHash: string, result: VerificationResult): void {
    this.cache.set(claimHash, {
      result,
      cachedAt: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const verifyCache = new VerifyCacheStore();
