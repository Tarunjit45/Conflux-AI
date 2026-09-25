// Conflux Platform — Verification Payment & Review Queue Service Layer
// Manages Cashfree order lifecycle, post-payment evidence intake, and admin review queue.
// Core Invariant: Payment covers the manual review; Verified status is only granted upon admin approval.

import { supabase, isSupabaseConfigured } from './supabase.ts';
import type {
  VerificationOrder,
  VerificationEvidencePayload,
  CreateVerificationOrderRequest,
  CreateVerificationOrderResponse
} from '../types/verificationPayment.ts';
import { businessService } from './businessService.ts';
import { emailService } from './emailService.ts';

const LOCAL_STORAGE_ORDERS_KEY = 'conflux_verification_orders_v1';
let memoryVerificationOrders: VerificationOrder[] = [];

export interface EvidenceEvaluationOutcome {
  verificationStatus: 'SUPPORTED' | 'PARTIALLY_SUPPORTED';
  verificationLevel: 'BASIC' | 'STATUTORY_VERIFIED';
  verificationLevelLabel: 'Statutory evidence confirmed' | 'Primary-source evidence confirmed' | 'Corroborated' | 'Applicant evidence only' | 'Unable to verify';
  confidenceScore: number; // Internal non-probabilistic triage weight (0-100)
  evaluatedClaim: string;
  claimsReviewed: string[];
  evidenceUsed: string;
  claimType: 'REGISTRATION' | 'CERTIFICATION' | 'GENERAL_FACT';
  primaryRegistrar: string;
  evidenceSummary: string;
  maskedDocumentNumber: string;
}

export function maskDocumentNumber(num?: string): string {
  if (!num) return 'Verified on file';
  const trimmed = num.trim();
  if (trimmed.length <= 4) return '••••';
  const prefix = trimmed.slice(0, 2);
  const suffix = trimmed.slice(-2);
  const maskLength = Math.min(8, Math.max(4, trimmed.length - 4));
  return `${prefix}${'•'.repeat(maskLength)}${suffix}`;
}

export function getVerificationLevelLabel(
  status?: string,
  level?: string,
  primaryRegistrar?: string,
  evidenceDocType?: string
): 'Statutory evidence confirmed' | 'Primary-source evidence confirmed' | 'Corroborated' | 'Applicant evidence only' | 'Unable to verify' {
  if (level === 'STATUTORY_VERIFIED' || (status === 'SUPPORTED' && primaryRegistrar && primaryRegistrar !== 'None' && evidenceDocType !== 'STOREFRONT_PHOTO')) {
    return 'Statutory evidence confirmed';
  }
  if (primaryRegistrar && (primaryRegistrar.includes('Directorate') || primaryRegistrar.includes('Ministry') || primaryRegistrar.includes('FSSAI'))) {
    return 'Primary-source evidence confirmed';
  }
  if (status === 'SUPPORTED' || level === 'BASIC' || level === 'GEO_CORROBORATED' || status === 'PARTIALLY_SUPPORTED') {
    return 'Corroborated';
  }
  if (status === 'UNVERIFIED' || status === 'PENDING') {
    return 'Applicant evidence only';
  }
  return 'Unable to verify';
}

export function evaluateVerificationEvidence(
  evidence?: VerificationEvidencePayload,
  adminRegistrarOverride?: string,
  approvalDate?: Date
): EvidenceEvaluationOutcome {
  const now = approvalDate || new Date();
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const expiryFormatted = oneYearFromNow.toLocaleDateString();

  if (!evidence) {
    return {
      verificationStatus: 'PARTIALLY_SUPPORTED',
      verificationLevel: 'BASIC',
      verificationLevelLabel: 'Applicant evidence only',
      confidenceScore: 50.0,
      evaluatedClaim: 'Proprietor Business Profile Claim',
      claimsReviewed: [
        'Proprietor Business Profile Claim',
        'Declared Contact & Address Information'
      ],
      evidenceUsed: 'Self-Declared Business Onboarding Submission',
      claimType: 'GENERAL_FACT',
      primaryRegistrar: adminRegistrarOverride || 'Proprietor Declaration',
      evidenceSummary: `Conflux reviewed defined business information provided by proprietor. No primary statutory registry documentation was evaluated. Valid through ${expiryFormatted}.`,
      maskedDocumentNumber: 'None'
    };
  }

  const docType = evidence.statutoryDocType || 'OTHER';
  const rawDocNumber = evidence.statutoryDocNumber || '';
  const maskedDoc = maskDocumentNumber(rawDocNumber);
  const hasDocUrl = Boolean(evidence.evidenceDocUrl);
  const hasStorefront = Boolean(evidence.storefrontPhotoUrl);

  switch (docType) {
    case 'GSTIN': {
      const confidence = hasDocUrl ? 92.0 : 88.0;
      const registrar = adminRegistrarOverride || 'Directorate of Commercial Taxes / GST Portal';
      return {
        verificationStatus: 'SUPPORTED',
        verificationLevel: 'STATUTORY_VERIFIED',
        verificationLevelLabel: 'Statutory evidence confirmed',
        confidenceScore: confidence,
        evaluatedClaim: 'GST Registration Claim',
        claimsReviewed: [
          'Operational business identity & commercial trade name',
          'Declared business operating address in declared district',
          'Active GSTIN statutory tax registration under GST Act 2017',
          'Direct customer communication channels'
        ],
        evidenceUsed: `GST Registration Certificate (Docket: ${maskedDoc})`,
        claimType: 'REGISTRATION',
        primaryRegistrar: registrar,
        evidenceSummary: `Conflux reviewed defined business information and submitted evidence for GST registration against ${registrar}. Docket identifier: ${maskedDoc}. Valid through ${expiryFormatted}. Scope bounded strictly to statutory tax registration; operational or product claims remain unevidenced.`,
        maskedDocumentNumber: maskedDoc
      };
    }

    case 'FSSAI': {
      const confidence = hasDocUrl ? 90.0 : 86.0;
      const registrar = adminRegistrarOverride || 'Food Safety and Standards Authority of India (FSSAI)';
      return {
        verificationStatus: 'SUPPORTED',
        verificationLevel: 'STATUTORY_VERIFIED',
        verificationLevelLabel: 'Statutory evidence confirmed',
        confidenceScore: confidence,
        evaluatedClaim: 'Food Safety & Standards Authority of India (FSSAI) License Claim',
        claimsReviewed: [
          'Operational food business identity & trade name',
          'Declared premise location in declared district',
          'Statutory food safety license under FSS Act 2006',
          'Direct customer communication channels'
        ],
        evidenceUsed: `FSSAI Food Safety License (Docket: ${maskedDoc})`,
        claimType: 'CERTIFICATION',
        primaryRegistrar: registrar,
        evidenceSummary: `Conflux reviewed defined business information and submitted evidence for statutory food business licensing under ${registrar}. License identifier: ${maskedDoc}. Valid through ${expiryFormatted}. Scope bounded strictly to food safety registration; other commercial claims remain unevidenced.`,
        maskedDocumentNumber: maskedDoc
      };
    }

    case 'TRADE_LICENSE': {
      const confidence = hasDocUrl ? 88.0 : 84.0;
      const registrar = adminRegistrarOverride || 'Municipal Corporation / Local Panchayat Trade Licensing Registry';
      return {
        verificationStatus: 'SUPPORTED',
        verificationLevel: 'STATUTORY_VERIFIED',
        verificationLevelLabel: 'Statutory evidence confirmed',
        confidenceScore: confidence,
        evaluatedClaim: 'Municipal / Panchayat Trade License Claim',
        claimsReviewed: [
          'Operational business identity & commercial trade name',
          'Declared establishment address in declared locality',
          'Statutory municipal trade license standing',
          'Direct customer communication channels'
        ],
        evidenceUsed: `Municipal / Panchayat Trade License (Docket: ${maskedDoc})`,
        claimType: 'REGISTRATION',
        primaryRegistrar: registrar,
        evidenceSummary: `Conflux reviewed defined business information and submitted evidence for local municipal trade license against ${registrar}. License identifier: ${maskedDoc}. Valid through ${expiryFormatted}. Scope bounded strictly to municipal establishment operation.`,
        maskedDocumentNumber: maskedDoc
      };
    }

    case 'MSME_UDYAM': {
      const confidence = hasDocUrl ? 88.0 : 84.0;
      const registrar = adminRegistrarOverride || 'Ministry of Micro, Small and Medium Enterprises (Udyam)';
      return {
        verificationStatus: 'SUPPORTED',
        verificationLevel: 'STATUTORY_VERIFIED',
        verificationLevelLabel: 'Statutory evidence confirmed',
        confidenceScore: confidence,
        evaluatedClaim: 'MSME Udyam Registration Claim',
        claimsReviewed: [
          'Operational business enterprise identity & trade name',
          'Declared enterprise address in declared district',
          'Statutory MSME Udyam registration standing',
          'Direct customer communication channels'
        ],
        evidenceUsed: `MSME Udyam Registration (Docket: ${maskedDoc})`,
        claimType: 'REGISTRATION',
        primaryRegistrar: registrar,
        evidenceSummary: `Conflux reviewed defined business information and submitted evidence for MSME enterprise registration against ${registrar}. Registration identifier: ${maskedDoc}. Valid through ${expiryFormatted}. Scope bounded strictly to micro/small enterprise standing.`,
        maskedDocumentNumber: maskedDoc
      };
    }

    case 'CLINICAL_ESTABLISHMENT': {
      const confidence = hasDocUrl ? 90.0 : 86.0;
      const registrar = adminRegistrarOverride || 'State Health & Clinical Establishments Regulatory Council';
      return {
        verificationStatus: 'SUPPORTED',
        verificationLevel: 'STATUTORY_VERIFIED',
        verificationLevelLabel: 'Statutory evidence confirmed',
        confidenceScore: confidence,
        evaluatedClaim: 'Clinical Establishment Registration Claim',
        claimsReviewed: [
          'Clinical establishment identity & medical institution name',
          'Declared healthcare facility address',
          'Statutory clinical establishment licensing standing',
          'Direct patient appointment & contact channels'
        ],
        evidenceUsed: `Clinical Establishment License (Docket: ${maskedDoc})`,
        claimType: 'CERTIFICATION',
        primaryRegistrar: registrar,
        evidenceSummary: `Conflux reviewed defined business information and submitted evidence for clinical establishment registration against ${registrar}. Registration identifier: ${maskedDoc}. Valid through ${expiryFormatted}. Scope bounded strictly to statutory clinical registration.`,
        maskedDocumentNumber: maskedDoc
      };
    }

    case 'PROFESSIONAL_COUNCIL': {
      const confidence = hasDocUrl ? 90.0 : 86.0;
      const registrar = adminRegistrarOverride || 'Statutory Professional Council / Bar / Medical Registry';
      return {
        verificationStatus: 'SUPPORTED',
        verificationLevel: 'STATUTORY_VERIFIED',
        verificationLevelLabel: 'Statutory evidence confirmed',
        confidenceScore: confidence,
        evaluatedClaim: 'Professional Council Accreditation Claim',
        claimsReviewed: [
          'Professional practice identity & credentials',
          'Declared office/chamber address',
          'Statutory professional council standing',
          'Direct client contact channels'
        ],
        evidenceUsed: `Professional Council Accreditation (Docket: ${maskedDoc})`,
        claimType: 'CERTIFICATION',
        primaryRegistrar: registrar,
        evidenceSummary: `Conflux reviewed defined business information and submitted evidence for professional practice credentials against ${registrar}. Registration identifier: ${maskedDoc}. Valid through ${expiryFormatted}. Scope bounded strictly to statutory professional standing.`,
        maskedDocumentNumber: maskedDoc
      };
    }

    case 'STOREFRONT_PHOTO': {
      // Visual premise evidence ONLY -> Basic level, not statutory verified
      const confidence = hasStorefront ? 65.0 : 55.0;
      const registrar = adminRegistrarOverride || 'Storefront Visual Corroboration';
      return {
        verificationStatus: 'PARTIALLY_SUPPORTED',
        verificationLevel: 'BASIC',
        verificationLevelLabel: 'Corroborated',
        confidenceScore: confidence,
        evaluatedClaim: 'Exterior Storefront & Premise Visual Claim',
        claimsReviewed: [
          'Declared business identity & exterior signboard imagery',
          'Visual premise existence at declared address',
          'Declared direct contact channels'
        ],
        evidenceUsed: 'Storefront Signboard Photography (Visual Evidence)',
        claimType: 'GENERAL_FACT',
        primaryRegistrar: registrar,
        evidenceSummary: `Conflux reviewed defined business information and visual storefront evidence supporting a premise visual claim at the declared address. Scope is visual/location evidence only; actual physical site inspection was not conducted, and statutory registrations were not evaluated.`,
        maskedDocumentNumber: maskedDoc
      };
    }

    case 'OTHER':
    default: {
      const confidence = hasDocUrl ? 70.0 : 60.0;
      const registrar = adminRegistrarOverride || 'Proprietor Submitted Documentation';
      return {
        verificationStatus: 'PARTIALLY_SUPPORTED',
        verificationLevel: 'BASIC',
        verificationLevelLabel: 'Applicant evidence only',
        confidenceScore: confidence,
        evaluatedClaim: 'Proprietor Documentation Claim',
        claimsReviewed: [
          'Operational business identity & trade name',
          'Declared address presence at declared locality',
          'Declared direct contact channels'
        ],
        evidenceUsed: `Proprietor Submitted Documentation (${docType})`,
        claimType: 'GENERAL_FACT',
        primaryRegistrar: registrar,
        evidenceSummary: `Conflux reviewed defined business information and submitted documentation on file. Scope is bounded to the specific submitted documents; actual physical site inspection was not conducted.`,
        maskedDocumentNumber: maskedDoc
      };
    }
  }
}

export class VerificationPaymentService {
  /**
   * Helper to retrieve orders from local storage / memory
   */
  private getLocalOrders(): VerificationOrder[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return memoryVerificationOrders;
  }

  /**
   * Helper to persist orders to local storage & memory
   */
  private saveLocalOrder(order: VerificationOrder) {
    const orders = this.getLocalOrders();
    const existingIndex = orders.findIndex(o => o.orderId === order.orderId);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.unshift(order);
    }
    memoryVerificationOrders = orders;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
      } catch {}
    }
  }

  /**
   * Create a verification order (₹499 for 1-year review)
   */
  async createOrder(req: CreateVerificationOrderRequest): Promise<CreateVerificationOrderResponse> {
    const orderId = `cfx_verify_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newOrder: VerificationOrder = {
      id: orderId,
      orderId,
      businessId: req.businessId,
      businessSlug: req.businessSlug,
      businessName: req.businessName,
      customerName: req.customerName,
      customerEmail: req.customerEmail,
      customerPhone: req.customerPhone,
      amountInr: 499.00,
      currency: 'INR',
      paymentStatus: 'PENDING',
      verificationStatus: 'PAYMENT_PENDING',
      createdAt: now,
      updatedAt: now
    };

    // Check local store for active applications to prevent duplicate payment attempts
    const localOrders = this.getLocalOrders();
    const existingActive = localOrders.find(
      o => o.businessSlug === req.businessSlug &&
      ['PAID', 'UNDER_REVIEW', 'MORE_EVIDENCE_REQUIRED', 'VERIFIED'].includes(o.verificationStatus)
    );
    if (existingActive) {
      return {
        success: false,
        error: `An active verification order is already in progress (${existingActive.verificationStatus}) for this business.`,
        orderId: existingActive.orderId
      };
    }

    // Reuse recent pending order (< 15 mins) to prevent duplicate order generation
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    const existingPending = localOrders.find(
      o => o.businessSlug === req.businessSlug &&
      o.verificationStatus === 'PAYMENT_PENDING' &&
      new Date(o.createdAt).getTime() >= fifteenMinsAgo &&
      Boolean(o.paymentSessionId)
    );
    if (existingPending) {
      return {
        success: true,
        orderId: existingPending.orderId,
        paymentSessionId: existingPending.paymentSessionId,
        amountInr: 499.00,
        environment: 'SANDBOX'
      };
    }

    // 1. Try to call the serverless Cashfree backend endpoint
    try {
      const response = await fetch('/api/create-verification-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.success && result.orderId) {
          newOrder.orderId = result.orderId;
          newOrder.paymentSessionId = result.paymentSessionId;
          this.saveLocalOrder(newOrder);
          return {
            success: true,
            orderId: result.orderId,
            paymentSessionId: result.paymentSessionId,
            amountInr: 499.00,
            environment: result.environment || 'SANDBOX'
          };
        }
      } else if (response.status === 409) {
        const errResult = await response.json().catch(() => null);
        return {
          success: false,
          error: errResult?.error || 'An active verification order is already in progress.',
          orderId: errResult?.orderId
        };
      }
    } catch {
      // Backend serverless endpoint unavailable (e.g. offline dev, test suites, or direct client mode)
    }

    // 2. Client / Sandbox fallback: Generate sandbox session & record order in database / memory
    newOrder.paymentSessionId = `session_sandbox_${orderId}`;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('verification_orders').insert([{
          order_id: newOrder.orderId,
          business_id: newOrder.businessId || null,
          business_slug: newOrder.businessSlug,
          business_name: newOrder.businessName,
          customer_name: newOrder.customerName,
          customer_email: newOrder.customerEmail,
          customer_phone: newOrder.customerPhone,
          amount_inr: newOrder.amountInr,
          currency: newOrder.currency,
          payment_status: newOrder.paymentStatus,
          verification_status: newOrder.verificationStatus,
          payment_session_id: newOrder.paymentSessionId,
          created_at: newOrder.createdAt,
          updated_at: newOrder.updatedAt
        }]);
      } catch (err) {
        console.warn('[VerificationPaymentService.createOrder] Supabase insert warning:', err);
      }
    }

    this.saveLocalOrder(newOrder);

    return {
      success: true,
      orderId: newOrder.orderId,
      paymentSessionId: newOrder.paymentSessionId,
      amountInr: 499.00,
      environment: 'SANDBOX'
    };
  }

  /**
   * Retrieve order details by order ID
   */
  async getOrder(orderId: string): Promise<VerificationOrder | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('verification_orders')
          .select('*')
          .eq('order_id', orderId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            orderId: data.order_id,
            cfOrderId: data.cf_order_id,
            businessId: data.business_id,
            businessSlug: data.business_slug,
            businessName: data.business_name,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerPhone: data.customer_phone,
            amountInr: Number(data.amount_inr) || 499.00,
            currency: data.currency || 'INR',
            paymentStatus: data.payment_status,
            verificationStatus: data.verification_status,
            paymentSessionId: data.payment_session_id,
            paymentReference: data.payment_reference,
            paymentMethod: data.payment_method,
            paymentTime: data.payment_time,
            evidence: data.evidence_payload,
            reviewNotes: data.review_notes,
            evidenceRequestedNotes: data.evidence_requested_notes,
            reviewedBy: data.reviewed_by,
            reviewedAt: data.reviewed_at,
            verifiedAt: data.verified_at,
            expiresAt: data.expires_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
        }
      } catch (err) {
        console.warn('[VerificationPaymentService.getOrder] Supabase query warning:', err);
      }
    }

    const localOrders = this.getLocalOrders();
    return localOrders.find(o => o.orderId === orderId) || null;
  }

  /**
   * Confirm successful payment for an order (called by return URL verification or webhook)
   * Transitions verification_status to 'PAID', ready for evidence onboarding form.
   */
  async confirmPaymentSuccess(
    orderId: string,
    paymentRef: string,
    paymentMethod: string = 'ONLINE'
  ): Promise<VerificationOrder> {
    const existing = await this.getOrder(orderId);
    if (!existing) throw new Error(`Order ${orderId} not found.`);

    const now = new Date().toISOString();
    existing.paymentStatus = 'PAID';
    if (existing.verificationStatus === 'PAYMENT_PENDING') {
      existing.verificationStatus = 'PAID';
    }
    existing.paymentReference = paymentRef;
    existing.paymentMethod = paymentMethod;
    existing.paymentTime = now;
    existing.updatedAt = now;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('verification_orders').update({
          payment_status: 'PAID',
          verification_status: existing.verificationStatus,
          payment_reference: paymentRef,
          payment_method: paymentMethod,
          payment_time: now,
          updated_at: now
        }).eq('order_id', orderId);
      } catch (err) {
        console.warn('[VerificationPaymentService.confirmPaymentSuccess] Supabase update warning:', err);
      }
    }

    this.saveLocalOrder(existing);

    // Dispatch transactional payment confirmation email & admin alert (non-blocking)
    emailService.sendVerificationPaymentSuccess(existing).catch(err => {
      console.warn('[VerificationPaymentService] Payment success email notice:', err);
    });
    emailService.sendAdminVerificationPayment(existing).catch(err => {
      console.warn('[VerificationPaymentService] Admin payment alert notice:', err);
    });

    return existing;
  }

  /**
   * Submit post-payment verification evidence onboarding form
   * Transitions status to 'UNDER_REVIEW' for admin manual evaluation.
   */
  async submitEvidence(
    orderId: string,
    evidence: VerificationEvidencePayload
  ): Promise<VerificationOrder> {
    const existing = await this.getOrder(orderId);
    if (!existing) throw new Error(`Order ${orderId} not found.`);

    const now = new Date().toISOString();
    existing.evidence = evidence;
    existing.verificationStatus = 'UNDER_REVIEW';
    existing.updatedAt = now;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('verification_orders').update({
          evidence_payload: evidence,
          verification_status: 'UNDER_REVIEW',
          updated_at: now
        }).eq('order_id', orderId);
      } catch (err) {
        console.warn('[VerificationPaymentService.submitEvidence] Supabase update warning:', err);
      }
    }

    this.saveLocalOrder(existing);

    // Dispatch evidence received notification & admin queue alert (non-blocking)
    emailService.sendVerificationSubmitted(existing).catch(err => {
      console.warn('[VerificationPaymentService] Evidence submitted email notice:', err);
    });
    emailService.sendAdminVerificationSubmitted(existing).catch(err => {
      console.warn('[VerificationPaymentService] Admin review queue alert notice:', err);
    });

    return existing;
  }

  /**
   * Retrieve all verification applications for Admin Review Queue
   */
  async getAllApplications(): Promise<VerificationOrder[]> {
    let list: VerificationOrder[] = [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('verification_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          list = data.map(row => ({
            id: row.id,
            orderId: row.order_id,
            cfOrderId: row.cf_order_id,
            businessId: row.business_id,
            businessSlug: row.business_slug,
            businessName: row.business_name,
            customerName: row.customer_name,
            customerEmail: row.customer_email,
            customerPhone: row.customer_phone,
            amountInr: Number(row.amount_inr) || 499.00,
            currency: row.currency || 'INR',
            paymentStatus: row.payment_status,
            verificationStatus: row.verification_status,
            paymentSessionId: row.payment_session_id,
            paymentReference: row.payment_reference,
            paymentMethod: row.payment_method,
            paymentTime: row.payment_time,
            evidence: row.evidence_payload,
            reviewNotes: row.review_notes,
            evidenceRequestedNotes: row.evidence_requested_notes,
            reviewedBy: row.reviewed_by,
            reviewedAt: row.reviewed_at,
            verifiedAt: row.verified_at,
            expiresAt: row.expires_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
        }
      } catch (err) {
        console.warn('[VerificationPaymentService.getAllApplications] Supabase query warning:', err);
      }
    }

    // Merge local orders that are not in list
    const existingIds = new Set(list.map(o => o.orderId));
    this.getLocalOrders().forEach(lo => {
      if (!existingIds.has(lo.orderId)) {
        list.push(lo);
      }
    });

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Admin: Approve application as Conflux Verified (1-year validity)
   * Evaluates evidence claims deterministically, grants verified badge, sets 1-year expiry.
   */
  async adminApprove(
    orderId: string,
    reviewNotes?: string,
    primaryRegistrar?: string,
    reviewedBy: string = 'Conflux Admin'
  ): Promise<VerificationOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error(`Order ${orderId} not found.`);

    const now = new Date();
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Compute evidence evaluation outcome according to Conflux Verify methodology
    const evaluation = evaluateVerificationEvidence(order.evidence, primaryRegistrar, now);

    order.verificationStatus = 'VERIFIED';
    order.decision = 'APPROVED';
    order.claimsReviewed = evaluation.claimsReviewed;
    order.evidenceUsed = evaluation.evidenceUsed;
    order.evidenceSource = evaluation.primaryRegistrar;
    order.reviewNotes = reviewNotes || evaluation.evidenceSummary;
    order.reviewedBy = reviewedBy;
    order.reviewedAt = now.toISOString();
    order.verifiedAt = now.toISOString();
    order.expiresAt = oneYearFromNow.toISOString();
    order.updatedAt = now.toISOString();

    // 1. Update verification_orders table
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('verification_orders').update({
          verification_status: 'VERIFIED',
          review_notes: order.reviewNotes,
          reviewed_by: order.reviewedBy,
          reviewed_at: order.reviewedAt,
          verified_at: order.verifiedAt,
          expires_at: order.expiresAt,
          updated_at: order.updatedAt
        }).eq('order_id', orderId);
      } catch (err) {
        console.warn('[VerificationPaymentService.adminApprove] Supabase order update warning:', err);
      }
    }

    // 2. Update target business in businesses table with DERIVED status & confidence
    if (order.businessSlug || order.businessId) {
      try {
        const targetBiz = order.businessId 
          ? await businessService.getBusinessById(order.businessId)
          : await businessService.getBusinessBySlug(order.businessSlug);

        if (targetBiz) {
          await businessService.updateBusiness(targetBiz.id, {
            verificationStatus: evaluation.verificationStatus,
            verificationLevel: evaluation.verificationLevel,
            confidenceScore: evaluation.confidenceScore,
            primaryRegistrar: evaluation.primaryRegistrar,
            evidenceSummary: evaluation.evidenceSummary,
            lastVerifiedAt: now.toISOString(),
            isIndexable: true,
            isClaimed: true
          });
        }
      } catch (err) {
        console.warn('[VerificationPaymentService.adminApprove] Business entity update warning:', err);
      }
    }

    this.saveLocalOrder(order);

    // Dispatch verification approved email to applicant (non-blocking)
    emailService.sendVerificationApproved(order).catch(err => {
      console.warn('[VerificationPaymentService] Verification approved email notice:', err);
    });

    return order;
  }

  /**
   * Admin: Request more evidence from applicant
   */
  async adminRequestMoreEvidence(
    orderId: string,
    notes: string,
    reviewedBy: string = 'Conflux Admin'
  ): Promise<VerificationOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error(`Order ${orderId} not found.`);

    const now = new Date().toISOString();
    order.verificationStatus = 'MORE_EVIDENCE_REQUIRED';
    order.decision = 'MORE_EVIDENCE_REQUIRED';
    order.evidenceRequestedNotes = notes;
    order.reviewNotes = notes;
    order.reviewedBy = reviewedBy;
    order.reviewedAt = now;
    order.updatedAt = now;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('verification_orders').update({
          verification_status: 'MORE_EVIDENCE_REQUIRED',
          evidence_requested_notes: notes,
          reviewed_by: reviewedBy,
          reviewed_at: now,
          updated_at: now
        }).eq('order_id', orderId);
      } catch (err) {
        console.warn('[VerificationPaymentService.adminRequestMoreEvidence] Supabase update warning:', err);
      }
    }

    this.saveLocalOrder(order);

    // Dispatch action required email to applicant (non-blocking)
    emailService.sendVerificationMoreEvidence(order, notes).catch(err => {
      console.warn('[VerificationPaymentService] More evidence email notice:', err);
    });

    return order;
  }

  /**
   * Admin: Reject verification application
   */
  async adminReject(
    orderId: string,
    reason: string,
    reviewedBy: string = 'Conflux Admin'
  ): Promise<VerificationOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error(`Order ${orderId} not found.`);

    const now = new Date().toISOString();
    order.verificationStatus = 'REJECTED';
    order.decision = 'REJECTED';
    order.rejectionReason = reason;
    order.reviewNotes = reason;
    order.reviewedBy = reviewedBy;
    order.reviewedAt = now;
    order.updatedAt = now;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('verification_orders').update({
          verification_status: 'REJECTED',
          review_notes: reason,
          reviewed_by: reviewedBy,
          reviewed_at: now,
          updated_at: now
        }).eq('order_id', orderId);
      } catch (err) {
        console.warn('[VerificationPaymentService.adminReject] Supabase update warning:', err);
      }
    }

    this.saveLocalOrder(order);

    // Dispatch verification rejected evaluation outcome email (non-blocking)
    emailService.sendVerificationRejected(order, reason).catch(err => {
      console.warn('[VerificationPaymentService] Verification rejected email notice:', err);
    });

    return order;
  }

  /**
   * Clear cache/memory (for automated testing)
   */
  clearStore() {
    memoryVerificationOrders = [];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_ORDERS_KEY);
      } catch {}
    }
  }
}

export const verificationPaymentService = new VerificationPaymentService();
