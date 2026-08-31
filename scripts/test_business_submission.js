// Conflux Platform — Business Submission & Listing System Test Suite

import { businessService } from '../lib/businessService.ts';

console.log('======================================================================');
console.log('    CONFLUX PLATFORM — BUSINESS ONBOARDING & LISTING TEST SUITE       ');
console.log('======================================================================\n');

let passCount = 0;
let totalChecks = 0;

const assert = (name, cond, details = '') => {
  totalChecks++;
  if (cond) {
    console.log(`[PASS] ${name}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${name} - ${details}`);
  }
};

async function runSubmissionTests() {
  // 1. Validation: Reject Empty Required Fields
  let caughtNameError = false;
  try {
    await businessService.submitApplication({
      submissionType: 'CONFLUX_VERIFIED',
      businessName: '',
      businessType: 'LOCAL_BUSINESS',
      categoryId: 'retail-trade',
      description: 'Valid long description for testing purposes.',
      services: ['Retail'],
      district: 'nadia',
      city: 'ranaghat',
      fullAddress: 'Main Road, Ranaghat',
      phone: '+919830011223',
      ownerName: 'Owner Test',
      ownerRole: 'Proprietor'
    });
  } catch (err) {
    caughtNameError = true;
  }
  assert('Rejects submission with missing business name', caughtNameError === true);

  let caughtLocError = false;
  try {
    await businessService.submitApplication({
      submissionType: 'CONFLUX_VERIFIED',
      businessName: 'Ranaghat Sweets',
      businessType: 'LOCAL_BUSINESS',
      categoryId: 'food-hospitality',
      description: 'Traditional sweets in Ranaghat.',
      services: [],
      district: 'nadia',
      city: '',
      fullAddress: '',
      phone: '+919830011223',
      ownerName: 'Subhas Bose',
      ownerRole: 'Proprietor'
    });
  } catch (err) {
    caughtLocError = true;
  }
  assert('Rejects submission with missing location address', caughtLocError === true);

  // 2. Streamlined Onboarding: Missing Website + Missing Online Sources + Service Requests
  const missingWebsiteApp = await businessService.submitApplication({
    submissionType: 'CONFLUX_VERIFIED',
    businessName: 'Maa Tara Electricals & Motor Winding',
    businessType: 'LOCAL_BUSINESS',
    categoryId: 'services-repairs',
    description: 'Motor winding, domestic pump repair, and commercial electrical fittings in Ranaghat.',
    district: 'nadia',
    city: 'ranaghat',
    fullAddress: 'Palpara Road, Ranaghat, Nadia',
    phone: '+919830112233',
    ownerName: 'Gouranga Ghosh',
    ownerRole: 'Proprietor',
    hasWebsite: false,
    onlineSources: undefined,
    serviceInterestRequests: {
      needWebsite: true,
      needGooglePresence: true,
      needSocialPresence: false,
      needWhatsAppSystem: true,
      needBookingSystem: false
    }
  });

  assert('Submits application with status SUBMITTED', missingWebsiteApp.status === 'SUBMITTED');
  assert('Captures missing-website status accurately', missingWebsiteApp.hasWebsite === false);
  assert('Captures service-interest requests for website help', missingWebsiteApp.serviceInterestRequests.needWebsite === true);
  assert('Captures service-interest requests for Google presence', missingWebsiteApp.serviceInterestRequests.needGooglePresence === true);
  assert('Captures service-interest requests for WhatsApp routing', missingWebsiteApp.serviceInterestRequests.needWhatsAppSystem === true);
  assert('Pre-allocates Conflux Business ID', Boolean(missingWebsiteApp.confluxBusinessId));

  // 3. Streamlined Onboarding: Provided Website + Multi-Source URLs
  const multiSourceApp = await businessService.submitApplication({
    submissionType: 'CONFLUX_VERIFIED',
    businessName: 'Nadia Ortho Care & Physiotherapy Clinic',
    legalName: 'Nadia Ortho Health Services LLP',
    businessType: 'HEALTHCARE',
    categoryId: 'healthcare',
    description: 'Advanced orthopedic physiotherapy, rehabilitation, and joint pain clinic.',
    services: ['Physiotherapy', 'Orthopedic Rehab', 'Spine Care'],
    district: 'nadia',
    city: 'ranaghat',
    landmark: 'Near Sub-Divisional Hospital',
    fullAddress: 'Hospital Road, Ranaghat, Nadia, West Bengal 741201',
    phone: '+919830991122',
    email: 'clinic@nadiaortho.in',
    websiteUrl: 'https://nadiaorthocare.in',
    hasWebsite: true,
    ownerName: 'Dr. Anirban Mukherjee',
    ownerRole: 'Medical Director',
    onlineSources: {
      googleBusinessUrl: 'https://maps.google.com/?cid=10928374',
      facebookUrl: 'https://facebook.com/nadiaorthocare',
      instagramUrl: 'https://instagram.com/nadiaortho',
      justdialUrl: 'https://justdial.com/Ranaghat/Nadia-Ortho-Care'
    },
    serviceInterestRequests: {
      needWebsite: false,
      needGooglePresence: false,
      needSocialPresence: false,
      needWhatsAppSystem: false,
      needBookingSystem: true
    }
  });

  assert('Submits application with provided website and sources', Boolean(multiSourceApp.websiteUrl));
  assert('Captures submitted Google Maps / GBP source', Boolean(multiSourceApp.onlineSources.googleBusinessUrl));
  assert('Captures submitted Facebook profile URL', Boolean(multiSourceApp.onlineSources.facebookUrl));
  assert('Captures submitted Justdial directory profile URL', Boolean(multiSourceApp.onlineSources.justdialUrl));

  // 4. Admin Review: Retrieve All Applications
  const allApps = await businessService.getAllApplications();
  assert('Admin retrieves all submitted applications', allApps.length >= 2);

  // 5. Admin: Mark Insufficient Evidence Workflow
  const insufficientApp = await businessService.markApplicationInsufficientEvidence(
    missingWebsiteApp.id,
    'Physical storefront photo and trade license required before statutory badge can be granted.'
  );
  assert('Admin can mark application as INSUFFICIENT_EVIDENCE', insufficientApp.evidenceStatus === 'INSUFFICIENT_EVIDENCE');
  assert('Records admin audit notes for evidence gaps', Boolean(insufficientApp.adminNotes));

  // 6. Admin: Update Commercial Plan & Payment Status (SEPARATE from verification!)
  const commercialApp = await businessService.updateApplicationCommercialPlan(
    missingWebsiteApp.id,
    'GROWTH',
    'PAID'
  );
  assert('Admin sets commercial plan to GROWTH', commercialApp.confluxPlan === 'GROWTH');
  assert('Admin sets payment status to PAID', commercialApp.paymentStatus === 'PAID');
  assert('CRITICAL: Commercial payment does NOT change evidence status', commercialApp.evidenceStatus === 'INSUFFICIENT_EVIDENCE');

  // 7. Admin: Approve Application as Standard Listing
  const publishedStandardBiz = await businessService.approveApplicationAsStandard(missingWebsiteApp.id);
  assert('Approves standard application and publishes business entity', publishedStandardBiz.status === 'PUBLISHED');
  assert('Standard listing is marked with claimStatus VERIFIED_OWNER', publishedStandardBiz.claimStatus === 'VERIFIED_OWNER');
  assert('Standard listing defaults to basic verification without statutory badge', publishedStandardBiz.verificationLevel === 'BASIC');

  // 8. Admin: Approve Application as Conflux Verified
  const publishedVerifiedBiz = await businessService.approveApplicationAsVerified(
    multiSourceApp.id,
    'West Bengal Clinical Establishments Regulatory Commission',
    'Clinical Establishment Act #WB/CEA/NAD/2024-1102 verified in Nadia district.'
  );
  assert('Approves verified application and sets verificationStatus SUPPORTED', publishedVerifiedBiz.verificationStatus === 'SUPPORTED');
  assert('Verified listing receives STATUTORY_VERIFIED verification level', publishedVerifiedBiz.verificationLevel === 'STATUTORY_VERIFIED');
  assert('Verified listing attaches confidence score >= 90%', publishedVerifiedBiz.confidenceScore >= 90);
  assert('Verified listing attaches primary registrar', Boolean(publishedVerifiedBiz.primaryRegistrar));

  // 9. Admin: Request Clarification / Changes Workflow
  const testApp3 = await businessService.submitApplication({
    submissionType: 'CONFLUX_VERIFIED',
    businessName: 'Ranaghat Quick Print',
    businessType: 'LOCAL_BUSINESS',
    categoryId: 'services-repairs',
    description: 'Digital printing, photocopy, and document scanning services.',
    district: 'nadia',
    city: 'ranaghat',
    fullAddress: 'Court Road, Ranaghat, Nadia',
    phone: '+919830556677',
    ownerName: 'Manoj Roy',
    ownerRole: 'Proprietor'
  });

  const changedApp = await businessService.requestApplicationChanges(testApp3.id, 'Please provide exact building number.');
  assert('Admin can request changes updating status to CHANGES_REQUESTED', changedApp.status === 'CHANGES_REQUESTED');
  assert('Records changes requested message', changedApp.changesRequestedMessage.includes('building number'));

  // 10. Admin: Reject Application Workflow
  const rejectedApp = await businessService.rejectApplication(testApp3.id, 'Incomplete commercial credentials.');
  assert('Admin can reject application updating status to REJECTED', rejectedApp.status === 'REJECTED');

  // Clean up created entities
  await businessService.deleteBusiness(publishedStandardBiz.id);
  await businessService.deleteBusiness(publishedVerifiedBiz.id);

  console.log('\n======================================================================');
  console.log(`SUBMISSION TEST SUMMARY: ${passCount} / ${totalChecks} TESTS PASSED`);
  console.log('======================================================================\n');

  if (passCount !== totalChecks) {
    process.exit(1);
  }
}

runSubmissionTests().catch(err => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
