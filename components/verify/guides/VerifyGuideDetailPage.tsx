import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ArrowRight, 
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Building2,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface GuideData {
  slug: string;
  title: string;
  category: string;
  lastUpdated: string;
  readTime: string;
  metaDescription: string;
  introduction: string;
  whatIsVerified: string[];
  authoritativeSources: { name: string; url: string; note: string }[];
  stepByStepProtocol: { stepNumber: number; title: string; detail: string }[];
  keyPitfalls: { title: string; explanation: string }[];
  exampleScenarios: { claim: string; evidenceFound: string; decision: string; rationale: string }[];
  faq: { q: string; a: string }[];
}

const GUIDES_DATA: Record<string, GuideData> = {
  'how-to-verify-indian-company-legal-existence': {
    slug: 'how-to-verify-indian-company-legal-existence',
    title: 'How to Verify Indian Company Legal Existence (MCA Master Data Guide)',
    category: 'Legal Existence Verification',
    lastUpdated: '2026-08-22',
    readTime: '6 min read',
    metaDescription: 'Step-by-step guide to verifying an Indian company’s legal existence, 21-character CIN syntax, active ROC status, and incorporation dockets on MCA Master Data.',
    introduction: 'In India, a company gains recognized legal personality only upon incorporation under the Companies Act, 2013 (or predecessor statutes) through the Ministry of Corporate Affairs (MCA). This guide explains how to verify legal existence, decode the 21-character Corporate Identity Number (CIN), and confirm whether an entity is actively authorized to transact commerce.',
    whatIsVerified: [
      'Statutory Corporate Identity Number (CIN) or LLPIN format and checksum.',
      'Active legal status registered with the competent Registrar of Companies (ROC).',
      'Exact statutory corporate name and registered office address.',
      'Date of Incorporation and authorized/paid-up capital structures.'
    ],
    authoritativeSources: [
      { name: 'MCA Master Data Services (mca.gov.in)', url: 'https://www.mca.gov.in/mcafoportal/companyLLPMasterData.do', note: 'Primary statutory government registry for all Indian registered entities.' },
      { name: 'e-Courts National Judicial Data Grid', url: 'https://njdg.ecourts.gov.in/', note: 'Authoritative for verifying insolvency, winding up, or corporate dispute orders.' }
    ],
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Locate or Validate the 21-Character CIN',
        detail: 'An Indian CIN follows a strict 21-character structure: [L/U] (Listing status) + 5 digits (Industry/NIC code) + 2 letters (State code) + 4 digits (Year of incorporation) + [PTC/PLC/LLP] (Ownership class) + 6 digits (Registration number). Example: L27100MH1907PLC002604.'
      },
      {
        stepNumber: 2,
        title: 'Query MCA Master Data Portal',
        detail: 'Navigate to the MCA View Company / LLP Master Data portal. Enter the company name or CIN. Solve the security captcha to fetch the live statutory extract directly from the ROC database.'
      },
      {
        stepNumber: 3,
        title: 'Verify the "Company Status" Field',
        detail: 'Check the official "Company Status (for efiling)". An operating business must display "Active". If the status reads "Strike Off", "Amalgamated", "Under Liquidation", or "Dissolved", the company cannot claim current legal operating standing.'
      },
      {
        stepNumber: 4,
        title: 'Corroborate First-Party Commercial Claims',
        detail: 'Compare the corporate name on invoices or vendor agreements with the exact statutory title. Minor trade variations (e.g. trading under a brand name without a registered corporate entity) must be verified via GSTIN or Udyam registration.'
      }
    ],
    keyPitfalls: [
      { title: 'Scraped Directory Profiles are NOT Primary Evidence', explanation: 'Third-party private directories (Zauba Corp, Tofler, IndiaFilings) scrape MCA data at periodic intervals and can reflect stale records. Always verify against mca.gov.in.' },
      { title: 'Brand Name vs Legal Corporate Entity', explanation: 'A business often markets itself under a brand name distinct from its legal holding name. A search for the brand name alone will return no records unless cross-referenced with a GSTIN or trademark docket.' }
    ],
    exampleScenarios: [
      {
        claim: 'Tata Steel Limited is an active public company incorporated in India.',
        evidenceFound: 'MCA CIN: L27100MH1907PLC002604, ROC-Mumbai, Status: Active, Date of Incorporation: 26/08/1907.',
        decision: 'SUPPORTED',
        rationale: 'Primary Tier-1 MCA record validates 100+ years of continuous legal standing and active ROC status.'
      },
      {
        claim: 'Falcon Logistics Pvt Ltd is an active operating transport company in Kolkata.',
        evidenceFound: 'MCA CIN: U63090WB2018PTC225890, ROC-Kolkata, Status: Strike Off (Section 248).',
        decision: 'CONTRADICTED',
        rationale: 'Statutory registry explicitly records legal dissolution under Section 248. Active operating claims are directly refuted.'
      }
    ],
    faq: [
      { q: 'Can a company operate legally without an MCA CIN?', a: 'Sole proprietorships and unregistered partnerships operate without an MCA CIN, but they must hold municipal trade licenses, GSTIN, or Udyam registrations.' },
      { q: 'Does an active CIN guarantee financial solvency?', a: 'No. Active status indicates that statutory filings are current and the entity has not been dissolved; it does not constitute an audit of cash flow or profitability.' }
    ]
  },

  'how-to-verify-gst-udyam-registration': {
    slug: 'how-to-verify-gst-udyam-registration',
    title: 'How to Verify GSTIN & MSME Udyam Registration in India',
    category: 'Tax & MSME Verification',
    lastUpdated: '2026-08-22',
    readTime: '5 min read',
    metaDescription: 'Learn how to verify 15-digit GSTIN tax numbers and 19-digit MSME Udyam registration certificates using official government portals.',
    introduction: 'For small and medium enterprises (MSMEs), partnerships, and proprietorships, GSTIN and Udyam registrations represent the primary statutory evidence of commercial existence. This guide covers how to inspect GSTIN structures, verify active taxpayer standing, and validate MSME enterprise classifications.',
    whatIsVerified: [
      '15-digit Goods and Services Tax Identification Number (GSTIN) validity.',
      'Taxpayer Status: Active, Cancelled, or Suspended.',
      'Legal Name of Business vs Trade Name.',
      '19-digit Udyam Registration Number (UDYAM-XX-00-0000000) and Enterprise Category (Micro, Small, Medium).'
    ],
    authoritativeSources: [
      { name: 'GST Services Portal (services.gst.gov.in)', url: 'https://services.gst.gov.in/services/searchtp', note: 'Primary statutory tax registry for verifying GSTIN active standing and jurisdiction.' },
      { name: 'Ministry of MSME Udyam Portal', url: 'https://udyamregistration.gov.in/Udyam_Verify.aspx', note: 'Official government portal for verifying Udyam registration certificates and NIC manufacturing codes.' }
    ],
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Verify GSTIN Format (15 Characters)',
        detail: 'GSTIN structure: 2 digits (State Code, e.g. 19 for West Bengal, 27 for Maharashtra) + 10 characters (Entity PAN) + 1 digit (Entity number) + "Z" (Default character) + 1 checksum character.'
      },
      {
        stepNumber: 2,
        title: 'Search Taxpayer on GST Portal',
        detail: 'Access the official "Search Taxpayer by GSTIN/UIN" tool on services.gst.gov.in. Enter the 15-digit GSTIN and solve the captcha.'
      },
      {
        stepNumber: 3,
        title: 'Check Legal Name & Status',
        detail: 'Verify that "Taxpayer Status" displays "Active". Note the "Legal Name" (the registered individual or company) and "Trade Name" (the commercial brand). Check the "Principal Place of Business" for geographic match.'
      },
      {
        stepNumber: 4,
        title: 'Verify MSME Udyam Certificate',
        detail: 'If the entity claims MSME classification, verify the Udyam number (format: UDYAM-XX-00-0000000) on udyamregistration.gov.in. Check the major activity (Manufacturing vs Services).'
      }
    ],
    keyPitfalls: [
      { title: 'Cancelled or Suspended GSTINs', explanation: 'A business may display an authentic GSTIN on its marketing collateral that was subsequently cancelled due to non-filing of returns. Always verify the live taxpayer status.' },
      { title: 'Entity Ambiguity with Generic Names', explanation: 'Many businesses share generic trade names (e.g. "Apex Technologies", "Star Engineering"). A GSTIN/Udyam lookup requires matching the exact state code and PAN identifier.' }
    ],
    exampleScenarios: [
      {
        claim: 'Ranaghat Agro Processing Ltd holds active food business tax registration in Nadia.',
        evidenceFound: 'GSTIN: 19AAACR4190Q1ZB, Legal Name: Ranaghat Agro Processing Ltd, Status: Active, State: West Bengal (19).',
        decision: 'SUPPORTED',
        rationale: 'Primary GST portal records confirm active taxpayer standing and matching Nadia geographical jurisdiction.'
      },
      {
        claim: 'Apex Technologies is a registered MSME unit based in Salt Lake Sector V.',
        evidenceFound: 'Search returns 40+ distinct registered units named "Apex Technologies" across West Bengal.',
        decision: 'PARTIALLY_SUPPORTED',
        rationale: 'Generic name ambiguity requires specific Udyam or GSTIN registration code for unique entity disambiguation.'
      }
    ],
    faq: [
      { q: 'Can a cancelled GSTIN still be used for commercial billing?', a: 'No. Issuing tax invoices under a cancelled or suspended GSTIN violates Section 122 of the CGST Act.' },
      { q: 'Is an MSME Udyam certificate valid indefinitely?', a: 'Udyam registration is ongoing, but enterprises must file annual returns on the portal to maintain classified status based on updated investment and turnover.' }
    ]
  },

  'how-to-verify-iso-certificate': {
    slug: 'how-to-verify-iso-certificate',
    title: 'How to Verify an ISO 9001 / 27001 Certificate (IAF CertSearch Guide)',
    category: 'Certification Verification',
    lastUpdated: '2026-08-22',
    readTime: '6 min read',
    metaDescription: 'Learn how to detect unaccredited certificate mills and verify authentic ISO 9001, ISO 14001, and ISO 27001 certifications via the IAF CertSearch database.',
    introduction: 'ISO (International Organization for Standardization) develops management standards, but ISO itself does not issue certificates. Certifications are issued by independent Certification Bodies (CBs), which must be accredited by national accreditation bodies (e.g. NABCB in India, UKAS in the UK, ANAB in the USA) under the International Accreditation Forum (IAF). This guide explains how to verify authentic accreditations.',
    whatIsVerified: [
      'Accredited Certification Body (CB) credentials.',
      'Recognition under the International Accreditation Forum (IAF) Multilateral Recognition Arrangement (MLA).',
      'Certificate status in the global IAF CertSearch registry (Active, Expired, Suspended, Withdrawn).',
      'Specific Scope of Certification (e.g. "Precision CNC Machining" vs general commercial trading).'
    ],
    authoritativeSources: [
      { name: 'IAF CertSearch Global Database (iafcertsearch.org)', url: 'https://www.iafcertsearch.org', note: 'The global statutory database of accredited management system certifications.' },
      { name: 'National Accreditation Board for Certification Bodies (NABCB)', url: 'https://nabcb.qci.org.in', note: 'India’s national accreditation body under the Quality Council of India.' }
    ],
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Inspect Certificate Accreditation Logos',
        detail: 'An authentic ISO certificate must feature two distinct logos: 1) The Certification Body’s logo, and 2) The National Accreditation Body’s logo (e.g. NABCB, UKAS, JAS-ANZ) alongside the IAF MLA mark.'
      },
      {
        stepNumber: 2,
        title: 'Query IAF CertSearch Database',
        detail: 'Visit iafcertsearch.org. Enter the company name or exact Certificate Number. Search across accredited global registrars.'
      },
      {
        stepNumber: 3,
        title: 'Verify the Scope of Certification',
        detail: 'Read the "Scope" text carefully. A company holding an ISO 9001 certificate for "Packaging and Storage" cannot legitimately claim that its manufacturing or software engineering is ISO 9001 certified.'
      },
      {
        stepNumber: 4,
        title: 'Check Surveillance Audit Validity',
        detail: 'ISO certificates follow a 3-year cycle with mandatory annual surveillance audits. If an annual audit was missed, the certificate may be suspended or withdrawn.'
      }
    ],
    keyPitfalls: [
      { title: 'Unaccredited "Certificate Mills"', explanation: 'Hundreds of private entities issue self-printed "ISO Certificates" in 24 hours without an accredited audit. These carry zero IAF recognition and are invalid in government and enterprise tenders.' },
      { title: 'Self-Issued Website Badges', explanation: 'A website displaying an ISO logo in its footer is a first-party claim, not proof of certification. Independent IAF CertSearch verification is mandatory.' }
    ],
    exampleScenarios: [
      {
        claim: 'ABC Precision Components Pvt Ltd holds active ISO 9001:2015 certification for CNC machining.',
        evidenceFound: 'IAF CertSearch ID: QMS-IND-2023-09841, Accredited by NABCB, Status: Active, Valid until: 2026-09-14.',
        decision: 'SUPPORTED',
        rationale: 'Primary IAF registrar records validate accredited certification body, active standing, and exact manufacturing scope.'
      },
      {
        claim: 'Bengal Organic Tea Traders holds valid USDA NOP Organic export accreditation.',
        evidenceFound: 'USDA Organic Integrity Database lists NOP export certificate as Revoked.',
        decision: 'CONTRADICTED',
        rationale: 'Primary USDA statutory database confirms explicit administrative revocation; claims of active accreditation are contradicted.'
      }
    ],
    faq: [
      { q: 'Does ISO directly issue certificates to companies?', a: 'No. ISO publishes standards only. Certificates are issued exclusively by third-party accredited certification bodies.' },
      { q: 'How long is an ISO certificate valid?', a: 'Standard ISO certificates are valid for 3 years, conditional upon passing annual surveillance audits.' }
    ]
  },

  'how-to-check-expired-certification': {
    slug: 'how-to-check-expired-certification',
    title: 'How to Check Expired & Lapsed Certifications (Temporal Validity Guide)',
    category: 'Temporal Evidence Analysis',
    lastUpdated: '2026-08-22',
    readTime: '5 min read',
    metaDescription: 'Understand how temporal validity affects ISO accreditations, government licenses, and compliance claims, and learn how to identify lapsed certifications.',
    introduction: 'Evidence is not static. A certification or statutory license that was fully authentic two years ago may be completely invalid today due to expiration, non-renewal, or regulatory revocation. This guide explores temporal validity windows, the 3-year recertification lifecycle, and why expired records must be classified as OUTDATED rather than blindly accepted.',
    whatIsVerified: [
      'Original date of issuance and certificate expiry date.',
      'Mandatory surveillance audit milestone completion.',
      'Recertification cycle audit status.',
      'Distinction between historical compliance and active legal authority.'
    ],
    authoritativeSources: [
      { name: 'IAF CertSearch Database', url: 'https://www.iafcertsearch.org', note: 'Authoritative for checking active vs expired ISO certification lifecycles.' },
      { name: 'FSSAI FoSCoS Portal', url: 'https://foscos.fssai.gov.in', note: 'Authoritative for food license validity and annual renewal status.' }
    ],
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Examine the Expiry Date on the Certificate',
        detail: 'Look for "Valid Until", "Expiry Date", or "Recertification Due Date". If the current date is past this milestone without an official extension letter, the certificate is temporally expired.'
      },
      {
        stepNumber: 2,
        title: 'Check Annual Surveillance Milestones',
        detail: 'ISO certificates require Year-1 and Year-2 surveillance audits. If the issuing body marks the surveillance as "Overdue", the certification is suspended.'
      },
      {
        stepNumber: 3,
        title: 'Query Live Registrar for Recertification Records',
        detail: 'Check whether a newly issued certificate supersedes the older document. A superseding certificate will carry a new certificate ID and updated 3-year term.'
      },
      {
        stepNumber: 4,
        title: 'Apply Epistemic Classification',
        detail: 'If the entity previously held authentic certification that has now lapsed, classify the claim as OUTDATED. Never classify an expired certificate as SUPPORTED.'
      }
    ],
    keyPitfalls: [
      { title: 'Assuming "Once Certified, Always Certified"', explanation: 'Businesses frequently keep expired ISO or food safety badges on their websites for years after non-renewal. Conflux Verify explicitly flags these as OUTDATED.' },
      { title: 'Conflating Past Compliance with Active Fraud', explanation: 'An expired certificate proves past compliance, not necessarily intentional deception. It must be treated as OUTDATED, distinct from a fraudulent certificate.' }
    ],
    exampleScenarios: [
      {
        claim: 'Metro Cold Storage Asansol holds valid ISO 22000:2018 Food Safety certification.',
        evidenceFound: 'ISO 22000 certificate FSMS-2020-04198 was valid from 2020-10-15 to 2023-10-14; no recertification audit recorded.',
        decision: 'OUTDATED',
        rationale: 'Historical certification was authentic but lapsed in October 2023. Claim of currently valid certification is outdated.'
      },
      {
        claim: 'Kalyani Minerals holds active mining clearance from SEIAA.',
        evidenceFound: 'Environmental Clearance EC-MIN-2018-091 expired in December 2024; public docket records non-renewal.',
        decision: 'OUTDATED',
        rationale: 'Prior clearance verified, but statutory term has ended without renewal.'
      }
    ],
    faq: [
      { q: 'What is the difference between OUTDATED and CONTRADICTED?', a: 'OUTDATED means the claim was historically true but has expired over time. CONTRADICTED means the claim is affirmatively refuted (e.g. revoked, struck off, or never existed).' },
      { q: 'How does Conflux Verify handle expired records?', a: 'Conflux Verify returns an explicit OUTDATED status with calibrated confidence and historical provenance notes.' }
    ]
  },

  'active-vs-struck-off-company': {
    slug: 'active-vs-struck-off-company',
    title: 'Active vs Struck-Off Company: Legal Differences & Verification',
    category: 'Corporate Insolvency & Strike-Off',
    lastUpdated: '2026-08-22',
    readTime: '6 min read',
    metaDescription: 'Understand the legal consequences of MCA Section 248 Strike-Off status, and learn why struck-off companies cannot enter into enforceable commercial contracts.',
    introduction: 'Under Section 248 of the Indian Companies Act, 2013, the Registrar of Companies (ROC) has the statutory power to strike off companies that fail to commence operations or fail to file statutory financial statements for consecutive financial years. This guide explains what Strike-Off status means legally and how to detect it.',
    whatIsVerified: [
      'MCA Master Data status code: Active vs Strike Off (Section 248).',
      'Loss of corporate legal personality and commercial contracting capacity.',
      'Director disqualification and statutory filing defaults.',
      'Distinction between voluntary strike-off (FTE) and suo-motu regulatory strike-off.'
    ],
    authoritativeSources: [
      { name: 'Ministry of Corporate Affairs (mca.gov.in)', url: 'https://www.mca.gov.in', note: 'Primary statutory source for corporate status and ROC gazette strike-off notices.' },
      { name: 'Insolvency and Bankruptcy Board of India (IBBI)', url: 'https://ibbi.gov.in', note: 'Authoritative for insolvency resolution and liquidation dockets.' }
    ],
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Check MCA Company Master Data',
        detail: 'Look up the CIN on mca.gov.in. Inspect the "Company Status (for efiling)" field.'
      },
      {
        stepNumber: 2,
        title: 'Inspect the ROC Gazette Notification',
        detail: 'Regulatory strike-offs are preceded by Form STK-5 public notices and finalized via Form STK-7 gazette notifications published by the Ministry.'
      },
      {
        stepNumber: 3,
        title: 'Verify Director Identification Numbers (DIN)',
        detail: 'Directors of companies struck off for non-filing may face statutory disqualification under Section 164(2) of the Companies Act.'
      },
      {
        stepNumber: 4,
        title: 'Evaluate Commercial Enforceability',
        detail: 'A struck-off company ceases to exist as a corporate legal entity. Contracts signed in its name during strike-off are void ab initio unless formally revived by the National Company Law Tribunal (NCLT).'
      }
    ],
    keyPitfalls: [
      { title: 'Assuming Struck-Off Means Never Existed', explanation: 'A struck-off company did exist legally in the past. Historical claims regarding its incorporation are factual, but current operating claims are refuted.' },
      { title: 'Trading Under a Dead Corporate Shell', explanation: 'Occasionally promoters continue commercial invoicing using a struck-off entity name. A live MCA check immediately reveals the statutory closure.' }
    ],
    exampleScenarios: [
      {
        claim: 'Falcon Logistics Private Limited is an active logistics service provider in West Bengal.',
        evidenceFound: 'MCA CIN: U63090WB2018PTC225890, Status: Strike Off (Section 248), ROC-Kolkata.',
        decision: 'CONTRADICTED',
        rationale: 'Primary statutory MCA register confirms the company is dissolved. Operating assertions are contradicted.'
      },
      {
        claim: 'Bengal Heavy Engineering was founded in 1998 as a registered public company.',
        evidenceFound: 'MCA historical records verify incorporation on 1998-05-12; company was voluntarily dissolved in 2022.',
        decision: 'SUPPORTED (HISTORICAL)',
        rationale: 'Historical founding claim is fully supported despite subsequent corporate closure.'
      }
    ],
    faq: [
      { q: 'Can a struck-off company be revived?', a: 'Yes. An aggrieved party or shareholder can petition the NCLT under Section 252 within 20 years for restoration of the company name.' },
      { q: 'Can a struck-off company legally operate bank accounts?', a: 'No. Upon strike-off, banks are mandated by the RBI to freeze operating accounts of the dissolved entity.' }
    ]
  },

  'company-not-found-does-not-mean-fake': {
    slug: 'company-not-found-does-not-mean-fake',
    title: 'Why "Company Not Found" Does Not Mean Fake (Absence ≠ Contradiction)',
    category: 'Epistemic Logic & Verification Ethics',
    lastUpdated: '2026-08-22',
    readTime: '6 min read',
    metaDescription: 'Learn why the absence of a record in a single database does not prove a business is fake, and understand Conflux Verify’s core principle: Absence ≠ Contradiction.',
    introduction: 'In automated data systems, one of the most dangerous errors is treating the absence of a record as proof of fraud. India has millions of legitimate businesses operating as sole proprietorships, unregistered partnerships, or local artisans that do not appear in central corporate registries. This guide explores the foundational epistemic principle: Absence ≠ Contradiction.',
    whatIsVerified: [
      'Why a database query returning 0 results is not factual refutation.',
      'The difference between sole proprietorships, MSMEs, and MCA incorporated companies.',
      'Trade name vs legal name discrepancies in Indian commerce.',
      'How search timeouts and registry downtime must be handled safely.'
    ],
    authoritativeSources: [
      { name: 'Ministry of MSME Udyam Database', url: 'https://udyamregistration.gov.in', note: 'Primary for unincorporated small business validation.' },
      { name: 'Central Board of Indirect Taxes and Customs (CBIC)', url: 'https://www.cbic.gov.in', note: 'Tax registration guidelines for turnover thresholds.' }
    ],
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Check the Scope of the Query',
        detail: 'An MCA lookup only indexes Private Limited, Public Limited, One Person Companies (OPC), Section 8, and LLPs. It does NOT index proprietorships or standard partnership firms.'
      },
      {
        stepNumber: 2,
        title: 'Search Alternative Statutory Registers',
        detail: 'If an entity is not found on MCA, query the GST Services Portal, MSME Udyam Register, Shop & Establishment Municipal registers, or FSSAI food business registers.'
      },
      {
        stepNumber: 3,
        title: 'Verify Trade Name Variations',
        detail: 'A shop known locally as "Sharma Sweets" may be registered under the proprietor’s individual name (e.g. "Ramesh Sharma"). Cross-reference the trade name on the GSTIN.'
      },
      {
        stepNumber: 4,
        title: 'Assign Calibrated Epistemic Status',
        detail: 'If exhaustive cross-registry lookups yield no records, assign INSUFFICIENT_EVIDENCE or UNVERIFIED with calibrated confidence. NEVER manufacture a false CONTRADICTED status without affirmative statutory refutation.'
      }
    ],
    keyPitfalls: [
      { title: 'Falsely Labeling Small Businesses as Fraudulent', explanation: 'Businesses with turnover below Rs 40 lakhs (goods) or Rs 20 lakhs (services) are legally exempt from GST registration. Lack of GSTIN does not imply illegality.' },
      { title: 'Treating Network Timeouts as Negative Evidence', explanation: 'When a government server times out, the system cannot know if the record exists. It must degrade safely to UNVERIFIED, never CONTRADICTED.' }
    ],
    exampleScenarios: [
      {
        claim: 'Bagula Precision Hand Tools produces the highest tensile strength clamps in Eastern India.',
        evidenceFound: 'Exhaustive search across BIS and NABL laboratory registers found zero comparative test bench records.',
        decision: 'INSUFFICIENT_EVIDENCE',
        rationale: 'Absence of public lab benchmarks means the claim cannot be independently confirmed. It is NOT labeled fraudulent.'
      },
      {
        claim: 'Siliguri Micro Finance Society is a licensed NBFC authorized by RBI.',
        evidenceFound: 'RBI official master registry of authorized NBFC Certificate of Registration (CoR) holders does not list the entity.',
        decision: 'CONTRADICTED',
        rationale: 'Because banking and NBFC operations legally require mandatory RBI licensing, absence from the closed statutory registry constitutes affirmative contradiction.'
      }
    ],
    faq: [
      { q: 'When does absence become a contradiction?', a: 'Absence becomes contradiction only when 1) the activity is strictly regulated, 2) the closed statutory registry is exhaustive, and 3) operating without registration is legally prohibited (e.g. RBI NBFC licensing, SEBI brokers, MCA incorporated claims).' },
      { q: 'How does Conflux Verify protect against false negative labels?', a: 'Conflux Verify strictly mandates that record absence produces INSUFFICIENT_EVIDENCE with calibrated uncertainty, never CONTRADICTED.' }
    ]
  }
};

export const VerifyGuideDetailPage: React.FC = () => {
  const { guideSlug } = useParams<{ guideSlug: string }>();

  const guide = guideSlug ? GUIDES_DATA[guideSlug] : null;

  if (!guide) {
    return <Navigate to="/verify/methodology" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6 gap-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/verify" className="hover:text-blue-600 transition-colors">Verify</Link>
          <span>/</span>
          <Link to="/verify/methodology" className="hover:text-blue-600 transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-blue-600 truncate max-w-[200px] md:max-w-none">{guide.title}</span>
        </nav>

        {/* Article Header */}
        <article className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <BookOpen size={14} className="text-blue-600" />
            {guide.category}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-[1.18]">
            {guide.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pb-8 mb-8 border-b border-slate-100">
            <span>Last Updated: <strong className="text-slate-800">{guide.lastUpdated}</strong></span>
            <span>•</span>
            <span>{guide.readTime}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck size={14} /> Authoritative Reference
            </span>
          </div>

          {/* Introduction */}
          <div className="prose prose-slate max-w-none mb-10">
            <p className="text-lg text-slate-700 leading-relaxed font-normal">
              {guide.introduction}
            </p>
          </div>

          {/* What is Being Verified */}
          <div className="mb-10 p-6 rounded-xl bg-slate-50 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              What Is Being Verified
            </h2>
            <ul className="space-y-2 text-sm text-slate-700">
              {guide.whatIsVerified.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Primary Statutory Authorities */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Primary Statutory & Accredited Registries
            </h2>
            <div className="space-y-3">
              {guide.authoritativeSources.map((src, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{src.name}</h3>
                    <p className="text-xs text-slate-500">{src.note}</p>
                  </div>
                  <a 
                    href={src.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0"
                  >
                    Open Registry <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Protocol */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Step-by-Step Verification Protocol
            </h2>
            <div className="space-y-6">
              {guide.stepByStepProtocol.map((step) => (
                <div key={step.stepNumber} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {step.stepNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Pitfalls & Warnings */}
          <div className="mb-12 p-6 rounded-xl bg-amber-50/70 border border-amber-200">
            <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-700" />
              Common Pitfalls & False Inferences
            </h2>
            <div className="space-y-4">
              {guide.keyPitfalls.map((pitfall, idx) => (
                <div key={idx}>
                  <h3 className="text-sm font-bold text-amber-950 mb-1">
                    • {pitfall.title}
                  </h3>
                  <p className="text-xs text-amber-800 leading-relaxed pl-3">
                    {pitfall.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Real-World Case Studies */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Real-World Verification Scenarios
            </h2>
            <div className="space-y-4">
              {guide.exampleScenarios.map((sc, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scenario {idx + 1}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                      sc.decision.includes('SUPPORTED') ? 'bg-emerald-100 text-emerald-800' :
                      sc.decision === 'CONTRADICTED' ? 'bg-rose-100 text-rose-800' :
                      sc.decision === 'OUTDATED' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {sc.decision}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mb-2">
                    Claim: "{sc.claim}"
                  </div>
                  <div className="text-xs text-slate-600 mb-2 font-mono bg-white p-2.5 rounded border border-slate-200">
                    Evidence: {sc.evidenceFound}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Decision Rationale:</strong> {sc.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HelpCircle size={20} className="text-blue-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {guide.faq.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.q}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive CTA to Verify Portal */}
          <div className="bg-slate-900 text-white rounded-xl p-6 md:p-8 text-center mt-8">
            <h2 className="text-xl font-bold mb-2">
              Verify This Entity on Conflux Verify
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto mb-6">
              Enter any Indian corporate name or registration identifier into Conflux Verify for instant deterministic evaluation.
            </p>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-bold shadow-md transition-all"
            >
              Open Conflux Verify Portal
              <ArrowRight size={14} />
            </Link>
          </div>

        </article>

        {/* Back Link to Methodology */}
        <div className="flex justify-between items-center text-sm font-semibold">
          <Link 
            to="/verify/methodology"
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} /> Back to Methodology
          </Link>
          <Link 
            to="/verify"
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800"
          >
            Verify a Claim <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyGuideDetailPage;
