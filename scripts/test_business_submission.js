// Conflux Platform — Business Submission & Listing System Test Suite

import { businessService } from '../lib/businessService.ts';

console.log('======================================================================');
console.log('    CONFLUX PLATFORM — BUSINESS SUBMISSION & LISTING TEST SUITE       ');
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
      submissionType: 'STANDARD_LISTING',
      businessName: '',
      businessType: 'LOCAL_BUSINESS',
      categoryId: 'retail-trade',
      description: 'Valid long description for testing purposes.',
      services: ['Retail'],
      district: 'nadia',
      city: 'ranaghat',
      fullAddress: 'Main Road, Ranaghat',
      phone: '+919830011223',
      email: 'test@business.in',
      ownerName: 'Owner Test',
      ownerRole: 'Proprietor',
      ownerPhone: '+919830011223',
      ownerEmail: 'test@business.in',
      declarationConfirmed: true,
      noStockImagesConfirmed: true,
      privateEvidence: []
    });
  } catch (err) {
    caughtNameError = true;
  }
  assert('Rejects submission with missing business name', caughtNameError === true);

  let caughtDeclError = false;
  try {
    await businessService.submitApplication({
      submissionType: 'STANDARD_LISTING',
      businessName: 'Ranaghat Sweet Corner',
      businessType: 'LOCAL_BUSINESS',
      categoryId: 'food-hospitality',
      description: 'Traditional Bengali sweets and confectioneries in Ranaghat.',
      services: ['Sweets', 'Snacks'],
      district: 'nadia',
      city: 'ranaghat',
      fullAddress: 'Station Road, Ranaghat, Nadia',
      phone: '+919830011223',
      email: 'sweets@ranaghat.in',
      ownerName: 'Subhas Bose',
      ownerRole: 'Proprietor',
      ownerPhone: '+919830011223',
      ownerEmail: 'sweets@ranaghat.in',
      declarationConfirmed: false, // Unconfirmed declaration
      noStockImagesConfirmed: true,
      privateEvidence: []
    });
  } catch (err) {
    caughtDeclError = true;
  }
  assert('Rejects submission with unconfirmed ownership declaration', caughtDeclError === true);

  // 2. Submit Standard Business Listing with Business Picture and Brand Logo
  const standardApp = await businessService.submitApplication({
    submissionType: 'STANDARD_LISTING',
    businessName: 'Ranaghat Modern Book House',
    legalName: 'Modern Book Distributors',
    businessType: 'RETAIL',
    categoryId: 'retail-trade',
    description: 'Educational books, stationery supplies, and competitive exam guides in Ranaghat.',
    services: ['Textbooks', 'Academic Stationery', 'School Supplies'],
    district: 'nadia',
    city: 'ranaghat',
    landmark: 'Opposite Ranaghat College',
    fullAddress: 'College Road, Ranaghat, Nadia, West Bengal 741201',
    phone: '+919830445566',
    email: 'contact@modernbooks.in',
    ownerName: 'Debabrata Roy',
    ownerRole: 'Managing Partner',
    ownerPhone: '+919830445566',
    ownerEmail: 'debabrata@modernbooks.in',
    storefrontPhotoUrl: 'https://images.unsplash.com/photo-1507842229451-79b1be88688e',
    logoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
    declarationConfirmed: true,
    noStockImagesConfirmed: true,
    privateEvidence: []
  });

  assert('Submits standard business application with status SUBMITTED', standardApp.status === 'SUBMITTED');
  assert('Standard application retains business photo', Boolean(standardApp.storefrontPhotoUrl));
  assert('Standard application retains business brand logo', Boolean(standardApp.logoUrl));
  assert('Assigns valid application reference ID', standardApp.id.startsWith('APP-2026-'));
  assert('Pre-allocates Conflux Business ID', Boolean(standardApp.confluxBusinessId));

  // 3. Submit Conflux Verified Application (with Owner Original Photo, Business Photo, Logo, & Statutory Evidence)
  const verifiedApp = await businessService.submitApplication({
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
    ownerName: 'Dr. Anirban Mukherjee',
    ownerRole: 'Medical Director',
    ownerPhone: '+919830991122',
    ownerEmail: 'anirban@nadiaortho.in',
    ownerPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    storefrontPhotoUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3',
    logoUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528',
    declarationConfirmed: true,
    noStockImagesConfirmed: true,
    privateEvidence: [
      {
        id: 'doc_ortho_01',
        documentType: 'CLINICAL_ESTABLISHMENT',
        documentName: 'WB Clinical Establishments Act Registration',
        documentNumber: 'WB/CEA/NAD/2024-1102',
        mimeType: 'application/pdf',
        fileSizeBytes: 1024 * 300,
        uploadedAt: new Date().toISOString(),
        isPrivate: true,
        fileData: 'data:application/pdf;base64,JVBERi0xLjQK...'
      }
    ]
  });

  assert('Submits Conflux Verified application with private statutory evidence', verifiedApp.submissionType === 'CONFLUX_VERIFIED');
  assert('Verified application includes mandatory owner original photo', Boolean(verifiedApp.ownerPhotoUrl));
  assert('Verified application includes mandatory business storefront photo', Boolean(verifiedApp.storefrontPhotoUrl));
  assert('Verified application includes business logo', Boolean(verifiedApp.logoUrl));
  assert('Private evidence document retains file payload reference', Boolean(verifiedApp.privateEvidence[0].fileData));
  assert('Private evidence is marked isPrivate = true', verifiedApp.privateEvidence[0].isPrivate === true);

  // 4. Admin Review: Retrieve All Applications
  const allApps = await businessService.getAllApplications();
  assert('Admin retrieves all submitted applications', allApps.length >= 2);

  // 5. Admin: Approve Application as Standard Listing
  const publishedStandardBiz = await businessService.approveApplicationAsStandard(standardApp.id);
  assert('Approves standard application and publishes business entity', publishedStandardBiz.status === 'PUBLISHED');
  assert('Standard listing is marked with claimStatus VERIFIED_OWNER', publishedStandardBiz.claimStatus === 'VERIFIED_OWNER');
  assert('Standard listing defaults to basic verification without statutory badge', publishedStandardBiz.verificationLevel === 'BASIC');

  // 6. Admin: Approve Application as Conflux Verified
  const publishedVerifiedBiz = await businessService.approveApplicationAsVerified(
    verifiedApp.id,
    'West Bengal Clinical Establishments Regulatory Commission',
    'Clinical Establishment Act #WB/CEA/NAD/2024-1102 verified in Nadia district.'
  );
  assert('Approves verified application and sets verificationStatus SUPPORTED', publishedVerifiedBiz.verificationStatus === 'SUPPORTED');
  assert('Verified listing receives STATUTORY_VERIFIED verification level', publishedVerifiedBiz.verificationLevel === 'STATUTORY_VERIFIED');
  assert('Verified listing attaches confidence score >= 90%', publishedVerifiedBiz.confidenceScore >= 90);
  assert('Verified listing attaches primary registrar', Boolean(publishedVerifiedBiz.primaryRegistrar));

  // 7. Admin: Request Changes Workflow
  const testApp3 = await businessService.submitApplication({
    submissionType: 'STANDARD_LISTING',
    businessName: 'Ranaghat Quick Print & Xeroxing',
    businessType: 'LOCAL_BUSINESS',
    categoryId: 'services-repairs',
    description: 'Digital printing, photocopy, and document scanning services.',
    services: ['Digital Printing', 'Xerox', 'Lamination'],
    district: 'nadia',
    city: 'ranaghat',
    fullAddress: 'Court Road, Ranaghat, Nadia',
    phone: '+919830556677',
    email: 'print@ranaghat.in',
    ownerName: 'Manoj Roy',
    ownerRole: 'Proprietor',
    ownerPhone: '+919830556677',
    ownerEmail: 'print@ranaghat.in',
    declarationConfirmed: true,
    noStockImagesConfirmed: true,
    privateEvidence: []
  });

  const changedApp = await businessService.requestApplicationChanges(testApp3.id, 'Please provide exact building number.');
  assert('Admin can request changes updating status to CHANGES_REQUESTED', changedApp.status === 'CHANGES_REQUESTED');
  assert('Records changes requested message', changedApp.changesRequestedMessage.includes('building number'));

  // 8. Admin: Reject Application Workflow
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
