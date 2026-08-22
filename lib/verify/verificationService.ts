// Modular Verification Engine Interface & Service for Conflux Verify

import type { VerifyRequest, VerificationResult } from '../../types/verify.ts';
import { runVerificationPipeline } from './pipeline.ts';

export class VerificationService {
  /**
   * Execute an evidence-backed verification request through the deterministic pipeline
   */
  async verifyClaim(req: VerifyRequest): Promise<VerificationResult> {
    const rawEntity = req.entityName || '';
    const rawClaim = req.claimText || '';

    // 1. Input Validation
    if (!rawEntity.trim() || rawEntity.trim().length < 2) {
      throw new Error('Entity name is required (minimum 2 characters).');
    }
    if (!rawClaim.trim() || rawClaim.trim().length < 5) {
      throw new Error('Claim statement is required (minimum 5 characters).');
    }
    if (rawEntity.length > 200) {
      throw new Error('Entity name exceeds maximum length of 200 characters.');
    }
    if (rawClaim.length > 1000) {
      throw new Error('Claim statement exceeds maximum length of 1000 characters.');
    }

    // 2. Delegate to deterministic pipeline
    return runVerificationPipeline({
      entityName: rawEntity.trim(),
      claimText: rawClaim.trim(),
      entityUrl: req.entityUrl ? String(req.entityUrl).trim() : undefined,
      forceFresh: Boolean(req.forceFresh)
    });
  }
}

export const verificationService = new VerificationService();
