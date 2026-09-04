// Conflux Platform — Admin Business Management Command Center (Web-Operable CRUD, Applications Queue, Claim Audits, Moderation & Telemetry)

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Globe,
  ExternalLink,
  RefreshCw,
  Phone,
  MessageSquare,
  MapPin,
  Check,
  AlertCircle,
  ArrowRight,
  X,
  Clock,
  Layers,
  BarChart3,
  TrendingUp,
  Users,
  Send,
  Eye,
  MousePointer,
  Activity,
  UserCheck,
  ShieldOff,
  FileCheck,
  ThumbsUp,
  ThumbsDown,
  Lock,
  FileText,
  HelpCircle,
  AlertTriangle,
  Star,
  Flag,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { businessService } from "../../lib/businessService";
import {
  connectService,
  type MeasurementReport,
} from "../../lib/connectService";
import { contributionService } from "../../lib/contributionService";
import type {
  ConfluxBusiness,
  BusinessPublishStatus,
  BusinessSubmissionApplication,
  SubmissionStatus,
} from "../../types/business";
import type {
  UserContribution,
  ModerationStatus,
} from "../../types/contribution";
import { WEST_BENGAL_DISTRICTS } from "../../data/locationsData";
import { BUSINESS_CATEGORY_TAXONOMY } from "../../data/taxonomiesData";

export const AdminBusinessDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "ENTITIES" | "APPLICATIONS" | "CLAIMS" | "CONTRIBUTIONS" | "MEASUREMENT"
  >("ENTITIES");
  const [businesses, setBusinesses] = useState<ConfluxBusiness[]>([]);
  const [applications, setApplications] = useState<
    BusinessSubmissionApplication[]
  >([]);
  const [contributions, setContributions] = useState<UserContribution[]>([]);
  const [measurementReport, setMeasurementReport] =
    useState<MeasurementReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVerStatus, setSelectedVerStatus] = useState("all");
  const [selectedAppStatus, setSelectedAppStatus] = useState("all");
  const [selectedContribStatus, setSelectedContribStatus] = useState("all");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] =
    useState<ConfluxBusiness | null>(null);
  const [verifyingBusiness, setVerifyingBusiness] =
    useState<ConfluxBusiness | null>(null);
  const [verifyClaimStatement, setVerifyClaimStatement] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State for Create / Edit
  const [formState, setFormState] = useState({
    name: "",
    legalName: "",
    businessType: "LOCAL_BUSINESS" as ConfluxBusiness["businessType"],
    categoryId: "retail-trade",
    description: "",
    shortSummary: "",
    district: "nadia",
    city: "ranaghat",
    landmark: "",
    services: "",
    fullAddress: "",
    phone: "",
    whatsapp: "",
    email: "",
    websiteUrl: "",
    bookingUrl: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    const data = await businessService.getAllBusinesses();
    setBusinesses(data);
    const apps = await businessService.getAllApplications();
    setApplications(apps);
    const contribs = await contributionService.getAllContributions();
    setContributions(contribs);
    const report = await connectService.getMeasurementReport();
    setMeasurementReport(report);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setFormState({
      name: "",
      legalName: "",
      businessType: "LOCAL_BUSINESS",
      categoryId: "retail-trade",
      description: "",
      shortSummary: "",
      district: "nadia",
      city: "ranaghat",
      landmark: "",
      services: "",
      fullAddress: "",
      phone: "",
      whatsapp: "",
      email: "",
      websiteUrl: "",
      bookingUrl: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (biz: ConfluxBusiness) => {
    setEditingBusiness(biz);
    setFormState({
      name: biz.name,
      legalName: biz.legalName || "",
      businessType: biz.businessType,
      categoryId: biz.categoryId,
      description: biz.description,
      shortSummary: biz.shortSummary || "",
      district: biz.location.district,
      city: biz.location.city,
      landmark: biz.landmark || "",
      services: (biz.services || []).join(", "),
      fullAddress: biz.location.fullAddress,
      phone: biz.contact.phone || "",
      whatsapp: biz.contact.whatsapp || "",
      email: biz.contact.email || "",
      websiteUrl: biz.contact.websiteUrl || "",
      bookingUrl: biz.contact.bookingUrl || "",
    });
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.description || !formState.fullAddress) {
      alert("Please fill all required fields (Name, Description, Address).");
      return;
    }

    const servicesArray = formState.services
      ? formState.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    try {
      if (editingBusiness) {
        await businessService.updateBusiness(editingBusiness.id, {
          name: formState.name,
          legalName: formState.legalName || undefined,
          businessType: formState.businessType,
          categoryId: formState.categoryId,
          description: formState.description,
          shortSummary: formState.shortSummary || undefined,
          landmark: formState.landmark || undefined,
          services: servicesArray,
          location: {
            ...editingBusiness.location,
            district: formState.district,
            city: formState.city,
            landmark: formState.landmark || undefined,
            fullAddress: formState.fullAddress,
          },
          contact: {
            ...editingBusiness.contact,
            phone: formState.phone || undefined,
            whatsapp: formState.whatsapp || undefined,
            email: formState.email || undefined,
            websiteUrl: formState.websiteUrl || undefined,
            bookingUrl: formState.bookingUrl || undefined,
          },
        });
        showNotification(`Updated "${formState.name}" successfully.`);
      } else {
        const created = await businessService.createBusiness({
          name: formState.name,
          legalName: formState.legalName || undefined,
          businessType: formState.businessType,
          categoryId: formState.categoryId,
          description: formState.description,
          shortSummary: formState.shortSummary || undefined,
          district: formState.district,
          city: formState.city,
          landmark: formState.landmark || undefined,
          services: servicesArray,
          fullAddress: formState.fullAddress,
          phone: formState.phone || undefined,
          whatsapp: formState.whatsapp || undefined,
          email: formState.email || undefined,
          websiteUrl: formState.websiteUrl || undefined,
          bookingUrl: formState.bookingUrl || undefined,
        });
        showNotification(
          `Created business ${created.confluxBusinessId} (Status: DRAFT, Unverified).`,
        );
      }

      setIsCreateModalOpen(false);
      setEditingBusiness(null);
      await loadData();
    } catch (err: any) {
      alert(`Error saving business: ${err.message}`);
    }
  };

  const handleTogglePublish = async (biz: ConfluxBusiness) => {
    const nextStatus: BusinessPublishStatus =
      biz.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await businessService.setPublishStatus(biz.id, nextStatus);
    showNotification(`Status for ${biz.name} set to ${nextStatus}.`);
    await loadData();
  };

  const handleSuspend = async (biz: ConfluxBusiness) => {
    if (
      confirm(
        `Are you sure you want to SUSPEND "${biz.name}"? It will be removed from public discovery immediately.`,
      )
    ) {
      await businessService.suspendBusiness(biz.id);
      showNotification(`"${biz.name}" suspended successfully.`);
      await loadData();
    }
  };

  const handleApproveClaim = async (biz: ConfluxBusiness) => {
    if (
      confirm(
        `Approve ownership claim for "${biz.name}"? The verified owner will gain full management privileges.`,
      )
    ) {
      await businessService.approveClaim(biz.id);
      showNotification(`Ownership claim for "${biz.name}" APPROVED.`);
      await loadData();
    }
  };

  const handleRejectClaim = async (biz: ConfluxBusiness) => {
    if (
      confirm(
        `Reject ownership claim for "${biz.name}"? The entity will revert to publicly documented unclaimed status.`,
      )
    ) {
      await businessService.rejectClaim(biz.id);
      showNotification(`Ownership claim for "${biz.name}" REJECTED.`);
      await loadData();
    }
  };

  // ── APPLICATION ACTIONS ──────────────────────────────────────────
  const handleApproveStandardApp = async (
    app: BusinessSubmissionApplication,
  ) => {
    if (
      confirm(
        `Approve "${app.businessName}" as Standard Listing? It will be published as an owner-claimed listing.`,
      )
    ) {
      await businessService.approveApplicationAsStandard(app.id);
      showNotification(
        `Application "${app.businessName}" APPROVED as Standard Listing.`,
      );
      await loadData();
    }
  };

  const handleApproveVerifiedApp = async (
    app: BusinessSubmissionApplication,
  ) => {
    const defaultRegistrar =
      app.privateEvidence?.[0]?.documentName ||
      "Official Regulatory Registry Docket";
    const registrar = prompt(
      "Enter primary statutory registrar / license identifier to ground this verification:",
      defaultRegistrar,
    );
    if (registrar) {
      await businessService.approveApplicationAsVerified(app.id, registrar);
      showNotification(
        `Application "${app.businessName}" APPROVED as CONFLUX VERIFIED.`,
      );
      await loadData();
    }
  };

  const handleRequestChangesApp = async (
    app: BusinessSubmissionApplication,
  ) => {
    const msg = prompt(
      "Enter specific change or evidence required from applicant:",
    );
    if (msg) {
      await businessService.requestApplicationChanges(app.id, msg);
      showNotification(
        `Changes requested for application "${app.businessName}".`,
      );
      await loadData();
    }
  };

  const handleMarkInsufficientEvidenceApp = async (
    app: BusinessSubmissionApplication,
  ) => {
    const notes = prompt(
      "Enter notes detailing insufficient evidence or discrepancies for this application:",
      app.adminNotes ||
        "Public sources and submitted data are insufficient for statutory verification.",
    );
    if (notes) {
      await businessService.markApplicationInsufficientEvidence(app.id, notes);
      showNotification(
        `Application "${app.businessName}" marked as INSUFFICIENT EVIDENCE.`,
      );
      await loadData();
    }
  };

  const handleUpdateCommercialPlanApp = async (
    app: BusinessSubmissionApplication,
  ) => {
    const plan = prompt(
      "Enter Conflux Plan (FREE, STARTER, GROWTH, ENTERPRISE):",
      app.confluxPlan || "FREE",
    ) as any;
    const payment = prompt(
      "Enter Payment Status (UNPAID, PAID, WAIVED, NOT_APPLICABLE):",
      app.paymentStatus || "NOT_APPLICABLE",
    ) as any;
    if (plan && payment) {
      await businessService.updateApplicationCommercialPlan(
        app.id,
        plan,
        payment,
      );
      showNotification(
        `Commercial plan for "${app.businessName}" updated to ${plan} (${payment}). Note: Verification status remains independent.`,
      );
      await loadData();
    }
  };

  const handleRejectApp = async (app: BusinessSubmissionApplication) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      await businessService.rejectApplication(app.id, reason);
      showNotification(`Application "${app.businessName}" REJECTED.`);
      await loadData();
    }
  };

  const handleDeleteApp = async (app: BusinessSubmissionApplication) => {
    if (
      confirm(
        `PERMANENTLY DELETE: Are you sure you want to delete application "${app.businessName}" (${app.id})? This action cannot be undone.`,
      )
    ) {
      await businessService.deleteApplication(app.id);
      showNotification(
        `Application "${app.businessName}" deleted permanently.`,
      );
      await loadData();
    }
  };

  // ── CONTRIBUTION MODERATION ACTIONS ──────────────────────────────
  const handleApproveContribution = async (contribId: string) => {
    await contributionService.moderateContribution(contribId, "APPROVED");
    showNotification(
      "Contribution APPROVED and published to business profile.",
    );
    await loadData();
  };

  const handleRejectContribution = async (contribId: string) => {
    const notes =
      prompt("Enter rejection reason for this contribution:") ||
      "Moderated out";
    await contributionService.moderateContribution(
      contribId,
      "REJECTED",
      notes,
    );
    showNotification("Contribution REJECTED.");
    await loadData();
  };

  const handleOpenVerifyModal = (biz: ConfluxBusiness) => {
    setVerifyingBusiness(biz);
    setVerifyClaimStatement(
      `${biz.name} is an active registered enterprise operating in ${biz.location.city}, ${biz.location.district}, West Bengal.`,
    );
  };

  const handleExecuteVerification = async () => {
    if (!verifyingBusiness || !verifyClaimStatement.trim()) return;
    setIsVerifying(true);

    try {
      const updated = await businessService.verifyBusinessClaim(
        verifyingBusiness.id,
        verifyClaimStatement.trim(),
      );
      showNotification(
        `Verification evaluated. Status: ${updated.verificationStatus} (${updated.confidenceScore}% confidence)`,
      );
      setVerifyingBusiness(null);
      await loadData();
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDelete = async (biz: ConfluxBusiness) => {
    if (
      confirm(
        `CONFIRM DELETION: Are you sure you want to permanently remove "${biz.name}" (${biz.confluxBusinessId}) from the Business Graph?`,
      )
    ) {
      await businessService.deleteBusiness(biz.id);
      showNotification(`Removed "${biz.name}" from Business Graph.`);
      await loadData();
    }
  };

  const filtered = businesses.filter((biz) => {
    if (
      selectedDistrict !== "all" &&
      biz.location.district.toLowerCase() !== selectedDistrict.toLowerCase()
    ) {
      return false;
    }
    if (selectedStatus !== "all" && biz.status !== selectedStatus) {
      return false;
    }
    if (
      selectedVerStatus !== "all" &&
      biz.verificationStatus !== selectedVerStatus
    ) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        biz.name.toLowerCase().includes(q) ||
        biz.confluxBusinessId.toLowerCase().includes(q) ||
        biz.location.city.toLowerCase().includes(q) ||
        biz.categoryId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredApps = applications.filter((app) => {
    if (selectedAppStatus !== "all" && app.status !== selectedAppStatus) {
      return false;
    }
    return true;
  });

  const filteredContribs = contributions.filter((c) => {
    if (
      selectedContribStatus !== "all" &&
      c.moderationStatus !== selectedContribStatus
    ) {
      return false;
    }
    return true;
  });

  const pendingClaims = businesses.filter(
    (b) => b.claimStatus === "CLAIM_PENDING",
  );
  const pendingApps = applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW",
  );
  const pendingContribs = contributions.filter(
    (c) => c.moderationStatus === "PENDING_MODERATION",
  );
  const publishedBusinesses = businesses.filter(
    (business) => business.status === "PUBLISHED",
  ).length;
  const verifiedBusinesses = businesses.filter(
    (business) => business.verificationStatus === "SUPPORTED",
  ).length;
  const attentionCount =
    pendingApps.length + pendingClaims.length + pendingContribs.length;

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 pb-20 pt-5 sm:pt-8">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Private Admin Header Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 p-5 sm:p-7 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-xl shadow-slate-900/10">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-300 uppercase tracking-[0.16em] mb-2 font-mono">
              <Lock size={14} /> Private operations workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-orbitron text-white tracking-tight">
              Business operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl">
              Review intake, ownership, community signals, and canonical entities from one controlled workspace.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              to="/list-business"
              target="_blank"
              className="inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition-all border border-white/10"
            >
              <ExternalLink size={16} /> Open Public Submission Form
            </Link>
            <button
              onClick={handleOpenCreate}
              className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-400/20 transition-all cursor-pointer"
            >
              <Plus size={16} /> Manual Add
            </button>
          </div>
        </div>

        {/* Operational overview */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-label="Operational overview">
          {[
            { label: "Total entities", value: businesses.length, detail: `${publishedBusinesses} published`, icon: Building2, tone: "text-blue-600 bg-blue-50" },
            { label: "Verified entities", value: verifiedBusinesses, detail: `${businesses.length - verifiedBusinesses} need review`, icon: ShieldCheck, tone: "text-emerald-600 bg-emerald-50" },
            { label: "Needs attention", value: attentionCount, detail: `${pendingApps.length} applications`, icon: AlertCircle, tone: "text-amber-600 bg-amber-50" },
            { label: "Contributions", value: contributions.length, detail: `${pendingContribs.length} awaiting moderation`, icon: MessageCircle, tone: "text-violet-600 bg-violet-50" },
          ].map(({ label, value, detail, icon: Icon, tone }) => (
            <div key={label} className="min-w-0 rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.12em] font-bold text-slate-500">{label}</span>
                <span className={`rounded-lg p-2 ${tone}`}><Icon size={16} /></span>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-bold font-orbitron text-slate-950">{isLoading ? "--" : value}</div>
              <div className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">{detail}</div>
            </div>
          ))}
        </section>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 w-full overflow-x-auto overscroll-x-contain">
          <button
            onClick={() => setActiveTab("ENTITIES")}
              className={`inline-flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ENTITIES"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 size={15} /> Business Entities ({businesses.length})
          </button>

          <button
            onClick={() => setActiveTab("APPLICATIONS")}
              className={`inline-flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "APPLICATIONS"
                ? "bg-white text-blue-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText size={15} /> Applications ({pendingApps.length} Pending)
          </button>

          <button
            onClick={() => setActiveTab("CLAIMS")}
              className={`inline-flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "CLAIMS"
                ? "bg-white text-amber-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck size={15} /> Owner Claims ({pendingClaims.length})
          </button>

          <button
            onClick={() => setActiveTab("CONTRIBUTIONS")}
              className={`inline-flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "CONTRIBUTIONS"
                ? "bg-white text-purple-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageCircle size={15} /> User Contributions (
            {pendingContribs.length} Pending)
          </button>

          <button
            onClick={() => setActiveTab("MEASUREMENT")}
              className={`inline-flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "MEASUREMENT"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 size={15} /> Telemetry &amp; Metrics
          </button>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 size={18} className="text-emerald-600" />
            {statusMessage}
          </motion.div>
        )}

        {/* ── TAB 1: ENTITIES MANAGEMENT ─────────────────────────── */}
        {activeTab === "ENTITIES" && (
          <div className="space-y-6">
            {/* Filters & Search Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID, city..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:outline-none"
                >
                  <option value="all">
                    All Districts ({WEST_BENGAL_DISTRICTS.length})
                  </option>
                  {WEST_BENGAL_DISTRICTS.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:outline-none"
                >
                  <option value="all">All Publishing Statuses</option>
                  <option value="PUBLISHED">Published Only</option>
                  <option value="DRAFT">Draft Only</option>
                  <option value="SUSPENDED">Suspended Only</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedVerStatus}
                  onChange={(e) => setSelectedVerStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:outline-none"
                >
                  <option value="all">All Verification Statuses</option>
                  <option value="SUPPORTED">Verified (Supported)</option>
                  <option value="PARTIALLY_SUPPORTED">
                    Partially Supported
                  </option>
                  <option value="UNVERIFIED">Unverified</option>
                </select>
              </div>
            </div>

            {/* Business Graph Table */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-bold font-orbitron text-slate-900">
                  Businesses in Graph ({filtered.length})
                </h2>
                <button
                  onClick={loadData}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={14} /> Refresh Graph
                </button>
              </div>

              {isLoading ? (
                <div className="p-16 text-center text-slate-400">
                  Loading Business Graph nodes...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-16 text-center text-slate-500 space-y-2">
                  <div className="font-bold text-slate-800 text-sm">
                    No businesses listed in production graph yet.
                  </div>
                  <p className="text-xs text-slate-400">
                    Add legitimate businesses manually or approve incoming
                    applications.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-6">ID &amp; Name</th>
                        <th className="py-4 px-4">Location</th>
                        <th className="py-4 px-4">Verification</th>
                        <th className="py-4 px-4">Publish Status</th>
                        <th className="py-4 px-4">Claim Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filtered.map((biz) => {
                        const isVerified =
                          biz.verificationStatus === "SUPPORTED";
                        const isPublished = biz.status === "PUBLISHED";
                        const isSuspended = biz.status === "SUSPENDED";
                        const profilePath = `/business/india/west-bengal/${biz.location.district}/${biz.location.city}/${biz.slug}`;

                        return (
                          <tr
                            key={biz.id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="py-4 px-6 space-y-1">
                              <div className="font-mono text-xs font-bold text-blue-700">
                                {biz.confluxBusinessId}
                              </div>
                              <div className="font-bold text-slate-900 text-sm">
                                {biz.name}
                              </div>
                              <div className="text-[11px] text-slate-500 capitalize">
                                {biz.categoryName || biz.categoryId}
                              </div>
                            </td>

                            <td className="py-4 px-4 space-y-0.5">
                              <div className="capitalize font-bold text-slate-800">
                                {biz.location.city}
                              </div>
                              <div className="text-[11px] text-slate-500 capitalize">
                                {biz.location.district}
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                {isVerified ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono">
                                    <ShieldCheck size={12} />{" "}
                                    {biz.confidenceScore}% VERIFIED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold font-mono">
                                    {biz.verificationStatus}
                                  </span>
                                )}
                                <div>
                                  <button
                                    onClick={() => handleOpenVerifyModal(biz)}
                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                  >
                                    Run Verification
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 space-y-1.5">
                              <div>
                                <button
                                  onClick={() => handleTogglePublish(biz)}
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                                    isPublished
                                      ? "bg-emerald-600 text-white shadow-sm"
                                      : isSuspended
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                  }`}
                                >
                                  {biz.status}
                                </button>
                              </div>
                              {isPublished && (
                                <button
                                  onClick={() => handleSuspend(biz)}
                                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold block cursor-pointer"
                                >
                                  Suspend Listing
                                </button>
                              )}
                            </td>

                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                                  biz.claimStatus === "VERIFIED_OWNER"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : biz.claimStatus === "CLAIM_PENDING"
                                      ? "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                                      : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {biz.claimStatus || "UNCLAIMED_PUBLIC"}
                              </span>
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="inline-flex items-center gap-2">
                                <Link
                                  to={profilePath}
                                  target="_blank"
                                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                  title="View Public Profile"
                                >
                                  <ExternalLink size={16} />
                                </Link>

                                <button
                                  onClick={() => handleOpenEdit(biz)}
                                  className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Edit Business"
                                >
                                  <Edit3 size={16} />
                                </button>

                                <button
                                  onClick={() => handleDelete(biz)}
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Business"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: BUSINESS APPLICATIONS QUEUE ──────────────────── */}
        {activeTab === "APPLICATIONS" && (
          <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold font-orbitron text-slate-900">
                    Business Submission Intake Queue ({applications.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review submitted business details, evaluate private
                    statutory documents, and approve or request changes.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedAppStatus}
                    onChange={(e) => setSelectedAppStatus(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none"
                  >
                    <option value="all">All Application Statuses</option>
                    <option value="SUBMITTED">
                      Submitted (Pending Review)
                    </option>
                    <option value="APPROVED">Approved (Standard)</option>
                    <option value="VERIFIED">
                      Verified (Conflux Verified)
                    </option>
                    <option value="CHANGES_REQUESTED">Changes Requested</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <button
                    onClick={loadData}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              {filteredApps.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No applications found matching the selected filter.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredApps.map((app) => (
                    <div
                      key={app.id}
                      className="py-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-slate-100 last:border-0"
                    >
                      <div className="space-y-3 max-w-3xl flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                            {app.id}
                          </span>
                          <span className="font-bold text-slate-900 text-base">
                            {app.businessName}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              app.submissionType === "CONFLUX_VERIFIED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {app.submissionType === "CONFLUX_VERIFIED"
                              ? "CONFLUX VERIFIED"
                              : "STANDARD LISTING"}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold font-mono">
                            {app.status}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                              app.evidenceStatus === "EVIDENCE_VERIFIED"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : app.evidenceStatus === "INSUFFICIENT_EVIDENCE"
                                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                                  : app.evidenceStatus === "CONFLICT_DETECTED"
                                    ? "bg-purple-50 text-purple-800 border border-purple-200"
                                    : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            EVIDENCE: {app.evidenceStatus || "PENDING_REVIEW"}
                          </span>
                        </div>

                        {/* Location, Description & Representative */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-700">
                              Location:
                            </span>{" "}
                            {app.fullAddress}, {app.city}, {app.district}
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">
                              Representative:
                            </span>{" "}
                            {app.ownerName} ({app.ownerRole})
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">
                              Contact Phone:
                            </span>{" "}
                            {app.phone}{" "}
                            {app.whatsapp ? `• WA: ${app.whatsapp}` : ""}
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">
                              Website:
                            </span>{" "}
                            {app.websiteUrl ? (
                              <a
                                href={app.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {app.websiteUrl}
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">
                                No website provided
                              </span>
                            )}
                          </div>
                          {app.description && (
                            <div className="col-span-1 sm:col-span-2 pt-1 border-t border-slate-200/60">
                              <span className="font-bold text-slate-700">
                                Description:
                              </span>{" "}
                              {app.description}
                            </div>
                          )}
                        </div>

                        {/* Submitted Online Sources */}
                        {app.onlineSources &&
                          Object.values(app.onlineSources).some(Boolean) && (
                            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-1.5">
                              <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px] font-mono block">
                                Submitted Online Sources (For Attributable
                                Evidence Discovery):
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {app.onlineSources.googleBusinessUrl && (
                                  <a
                                    href={app.onlineSources.googleBusinessUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-[11px] font-medium"
                                  >
                                    <Globe size={12} /> Google Maps / GBP{" "}
                                    <ExternalLink size={10} />
                                  </a>
                                )}
                                {app.onlineSources.facebookUrl && (
                                  <a
                                    href={app.onlineSources.facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-[11px] font-medium"
                                  >
                                    Facebook <ExternalLink size={10} />
                                  </a>
                                )}
                                {app.onlineSources.instagramUrl && (
                                  <a
                                    href={app.onlineSources.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-[11px] font-medium"
                                  >
                                    Instagram <ExternalLink size={10} />
                                  </a>
                                )}
                                {app.onlineSources.justdialUrl && (
                                  <a
                                    href={app.onlineSources.justdialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-[11px] font-medium"
                                  >
                                    Justdial / IndiaMART{" "}
                                    <ExternalLink size={10} />
                                  </a>
                                )}
                                {app.onlineSources.otherUrl && (
                                  <a
                                    href={app.onlineSources.otherUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-[11px] font-medium"
                                  >
                                    Other Source <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Service Interest Requests */}
                        {app.serviceInterestRequests &&
                          Object.values(app.serviceInterestRequests).some(
                            Boolean,
                          ) && (
                            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs space-y-1">
                              <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px] font-mono block">
                                Service Interest / Assistance Requests
                                (Non-Verification Metadata):
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-[11px] text-amber-800">
                                {app.serviceInterestRequests.needWebsite && (
                                  <span className="px-2 py-0.5 rounded bg-white border border-amber-200">
                                    &bull; Website Info
                                  </span>
                                )}
                                {app.serviceInterestRequests
                                  .needGooglePresence && (
                                  <span className="px-2 py-0.5 rounded bg-white border border-amber-200">
                                    &bull; Google Presence Help
                                  </span>
                                )}
                                {app.serviceInterestRequests
                                  .needSocialPresence && (
                                  <span className="px-2 py-0.5 rounded bg-white border border-amber-200">
                                    &bull; Social Presence Help
                                  </span>
                                )}
                                {app.serviceInterestRequests
                                  .needWhatsAppSystem && (
                                  <span className="px-2 py-0.5 rounded bg-white border border-amber-200">
                                    &bull; WhatsApp Routing
                                  </span>
                                )}
                                {app.serviceInterestRequests
                                  .needBookingSystem && (
                                  <span className="px-2 py-0.5 rounded bg-white border border-amber-200">
                                    &bull; Online Booking
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Commercial Plan & Payment Status */}
                        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-fit">
                          <span className="font-bold text-slate-700">
                            Commercial Plan:
                          </span>
                          <span className="font-mono font-bold text-blue-600">
                            {app.confluxPlan || "FREE"}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="font-bold text-slate-700">
                            Payment:
                          </span>
                          <span className="font-mono font-bold text-slate-700">
                            {app.paymentStatus || "NOT_APPLICABLE"}
                          </span>
                        </div>
                      </div>

                      {/* Admin Decision Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0 w-full lg:w-44">
                        {app.submissionType === "CONFLUX_VERIFIED" ? (
                          <button
                            onClick={() => handleApproveVerifiedApp(app)}
                            className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShieldCheck size={14} /> Approve Verified
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveStandardApp(app)}
                            className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check size={14} /> Approve Standard
                          </button>
                        )}

                        <button
                          onClick={() => handleRequestChangesApp(app)}
                          className="w-full px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          Request Clarification
                        </button>

                        <button
                          onClick={() => handleMarkInsufficientEvidenceApp(app)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          Mark Insufficient
                        </button>

                        <button
                          onClick={() => handleUpdateCommercialPlanApp(app)}
                          className="w-full px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          Plan &amp; Payment
                        </button>

                        <button
                          onClick={() => handleRejectApp(app)}
                          className="w-full px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer text-center"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleDeleteApp(app)}
                          className="w-full px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Trash2 size={13} /> Delete Permanently
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: OWNER CLAIMS REVIEW ─────────────────────────── */}
        {activeTab === "CLAIMS" && (
          <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold font-orbitron text-slate-900">
                    Pending Ownership Claims Review ({pendingClaims.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review and corroborate ownership claims submitted by real
                    business proprietors before unlocking profile control.
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={14} /> Refresh Claims
                </button>
              </div>

              {pendingClaims.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No pending ownership claims awaiting review at this time.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingClaims.map((biz) => (
                    <div
                      key={biz.id}
                      className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {biz.confluxBusinessId}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {biz.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                            CLAIM PENDING
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold">Location:</span>{" "}
                          {biz.location.fullAddress}
                        </div>
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold">Phone:</span>{" "}
                          {biz.contact.phone || "N/A"} •{" "}
                          <span className="font-semibold">Email:</span>{" "}
                          {biz.contact.email || "N/A"}
                        </div>
                        {biz.evidenceSummary && (
                          <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-700 font-mono">
                            Claim Proof: {biz.evidenceSummary}
                          </div>
                        )}
                      </div>

                      <div className="flex w-full flex-col sm:flex-row md:w-auto items-stretch sm:items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveClaim(biz)}
                          className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsUp size={14} /> Approve Claim
                        </button>
                        <button
                          onClick={() => handleRejectClaim(biz)}
                          className="flex-1 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsDown size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: USER CONTRIBUTIONS MODERATION QUEUE ──────────── */}
        {activeTab === "CONTRIBUTIONS" && (
          <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold font-orbitron text-slate-900">
                    Community Reviews &amp; Knowledge Contributions (
                    {contributions.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Moderate customer reviews, verify suggested edits, and audit
                    inaccuracy reports from authenticated users.
                  </p>
                </div>

                <div className="flex w-full flex-col sm:flex-row sm:w-auto items-stretch sm:items-center gap-3">
                  <select
                    value={selectedContribStatus}
                    onChange={(e) => setSelectedContribStatus(e.target.value)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none"
                  >
                    <option value="all">All Moderation Statuses</option>
                    <option value="PENDING_MODERATION">
                      Pending Moderation ({pendingContribs.length})
                    </option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <button
                    onClick={loadData}
                    className="self-end text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              {filteredContribs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No contributions found matching the selected filter.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredContribs.map((c) => (
                    <div
                      key={c.id}
                      className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {c.id}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {c.businessName || `Business ID: ${c.businessId}`}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              c.contributionType === "REVIEW_RATING"
                                ? "bg-amber-100 text-amber-900"
                                : c.contributionType === "SUGGESTED_EDIT"
                                  ? "bg-blue-100 text-blue-900"
                                  : "bg-rose-100 text-rose-900"
                            }`}
                          >
                            {c.contributionType.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                              c.moderationStatus === "APPROVED"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : c.moderationStatus === "PENDING_MODERATION"
                                  ? "bg-amber-50 text-amber-900 border border-amber-200 animate-pulse"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {c.moderationStatus}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600">
                          <span className="font-semibold">Contributor:</span>{" "}
                          {c.userDisplayName} ({c.userEmail}) •{" "}
                          <span className="font-mono text-[11px] text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {c.contributionType === "REVIEW_RATING" && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              ★ {c.rating} / 5 Stars
                            </div>
                            <p className="leading-relaxed">
                              &ldquo;{c.reviewText}&rdquo;
                            </p>
                          </div>
                        )}

                        {c.contributionType === "SUGGESTED_EDIT" && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                            <div>
                              <span className="font-bold text-slate-700">
                                Field:
                              </span>{" "}
                              {c.fieldName} &rarr;{" "}
                              <span className="font-bold text-blue-700">
                                {c.suggestedValue}
                              </span>
                            </div>
                            <div className="text-slate-600">
                              <span className="font-semibold">Rationale:</span>{" "}
                              {c.rationale}
                            </div>
                          </div>
                        )}

                        {c.contributionType === "INACCURACY_REPORT" && (
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                            <div>
                              <span className="font-bold">Issue Type:</span>{" "}
                              {c.issueType}
                            </div>
                            <div>
                              <span className="font-semibold">Details:</span>{" "}
                              {c.details}
                            </div>
                          </div>
                        )}
                      </div>

                      {c.moderationStatus === "PENDING_MODERATION" && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveContribution(c.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <ThumbsUp size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectContribution(c.id)}
                            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <ThumbsDown size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: REVENUE VALIDATION & MEASUREMENT ─────────────── */}
        {activeTab === "MEASUREMENT" && measurementReport && (
          <div className="space-y-8">
            {/* Top Scorecard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Onboarded */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold font-mono uppercase">
                  <span>Onboarded</span>
                  <Building2 size={16} className="text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                  {measurementReport.businessesOnboarded.total}
                </div>
                <div className="text-[11px] text-slate-500 flex gap-1.5 flex-wrap">
                  <span className="text-emerald-700 font-bold">
                    {measurementReport.businessesOnboarded.published} Published
                  </span>
                  <span>•</span>
                  <span className="text-amber-700 font-bold">
                    {measurementReport.businessesOnboarded.draft} Draft
                  </span>
                </div>
              </div>

              {/* Card 2: Verified */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold font-mono uppercase">
                  <span>Verified</span>
                  <ShieldCheck size={16} className="text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                  {measurementReport.verifiedBusinesses.totalVerified}
                </div>
                <div className="text-[11px] text-slate-500 flex gap-1.5 flex-wrap">
                  <span className="text-emerald-700 font-bold">
                    {measurementReport.verifiedBusinesses.supported} Supported
                  </span>
                  <span>•</span>
                  <span>
                    {measurementReport.verifiedBusinesses.unverified} Unverified
                  </span>
                </div>
              </div>

              {/* Card 3: Claims Audited */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold font-mono uppercase">
                  <span>Owner Claims</span>
                  <UserCheck size={16} className="text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                  {measurementReport.claims?.total || 0}
                </div>
                <div className="text-[11px] text-slate-500 flex gap-1.5 flex-wrap">
                  <span className="text-amber-700 font-bold">
                    {measurementReport.claims?.pending || 0} Pending
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">
                    {measurementReport.claims?.verifiedOwners || 0} Verified
                  </span>
                </div>
              </div>

              {/* Card 4: Connect Actions */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold font-mono uppercase">
                  <span>Connects</span>
                  <MousePointer size={16} className="text-purple-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                  {measurementReport.connectActions.total}
                </div>
                <div className="text-[11px] text-slate-500">
                  {measurementReport.connectActions.whatsapp} WA •{" "}
                  {measurementReport.connectActions.calls} Calls •{" "}
                  {measurementReport.connectActions.bookings} Book
                </div>
              </div>

              {/* Card 5: Inbound Leads */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold font-mono uppercase">
                  <span>Inbound Leads</span>
                  <Send size={16} className="text-indigo-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-orbitron text-slate-900">
                  {measurementReport.leads.total}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold">
                  Dispatched via Resend
                </div>
              </div>
            </div>

            {/* Real Recorded Telemetry Events Stream */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold font-orbitron text-slate-900 flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" /> Real
                  Telemetry Event Stream (
                  {measurementReport.recentEvents.length})
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Zero Synthetic Traffic
                </span>
              </div>

              {measurementReport.recentEvents.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No interaction events recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-6">Timestamp</th>
                        <th className="py-3 px-4">Event Type</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Business ID / Intent</th>
                        <th className="py-3 px-6">Session ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {measurementReport.recentEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-6 text-slate-500">
                            {new Date(evt.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                              {evt.eventType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {evt.channel}
                          </td>
                          <td className="py-3 px-4 text-slate-900 font-bold">
                            {evt.intentId || evt.businessId}
                          </td>
                          <td className="py-3 px-6 text-slate-400">
                            {evt.sessionPseudonym}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {(isCreateModalOpen || editingBusiness) && (
          <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 sm:p-8 my-8 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold font-orbitron text-slate-900">
                  {editingBusiness
                    ? `Edit Business (${editingBusiness.confluxBusinessId})`
                    : "Register New Business"}
                </h3>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingBusiness(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveBusiness} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Business Brand Name *
                    </label>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({ ...formState, name: e.target.value })
                      }
                      placeholder="e.g. Ranaghat Apex Diagnostic Centre"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Legal Registered Name
                    </label>
                    <input
                      type="text"
                      value={formState.legalName}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          legalName: e.target.value,
                        })
                      }
                      placeholder="e.g. Apex Health Diagnostic LLP"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      District *
                    </label>
                    <select
                      value={formState.district}
                      onChange={(e) =>
                        setFormState({ ...formState, district: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                    >
                      {WEST_BENGAL_DISTRICTS.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      value={formState.city}
                      onChange={(e) =>
                        setFormState({ ...formState, city: e.target.value })
                      }
                      placeholder="e.g. ranaghat"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Landmark (e.g. Near Station, Court More)
                  </label>
                  <input
                    type="text"
                    value={formState.landmark}
                    onChange={(e) =>
                      setFormState({ ...formState, landmark: e.target.value })
                    }
                    placeholder="e.g. Near Sub-Divisional Hospital Gate"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Full Physical Address *
                  </label>
                  <input
                    type="text"
                    value={formState.fullAddress}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        fullAddress: e.target.value,
                      })
                    }
                    placeholder="e.g. College Road, Near Sub-Divisional Hospital, Ranaghat, Nadia 741201"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Category *
                  </label>
                  <select
                    value={formState.categoryId}
                    onChange={(e) =>
                      setFormState({ ...formState, categoryId: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                  >
                    <option value="healthcare">
                      Healthcare &amp; Diagnostics
                    </option>
                    <option value="food-hospitality">
                      Restaurants &amp; Food Services
                    </option>
                    <option value="fitness-wellness">Gyms &amp; Fitness</option>
                    <option value="services-repairs">
                      Repairs &amp; HVAC Services
                    </option>
                    <option value="tourism-hospitality">
                      Hotels &amp; Tourism
                    </option>
                    <option value="salons-beauty">
                      Salons &amp; Personal Care
                    </option>
                    <option value="handloom-textiles">
                      Handloom &amp; Textiles
                    </option>
                    <option value="agriculture-farming">
                      Agro-Processing &amp; Farming
                    </option>
                    <option value="manufacturing-industrial">
                      Manufacturing &amp; Machining
                    </option>
                    <option value="it-software">IT, AI &amp; Software</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Services Offered (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formState.services}
                    onChange={(e) =>
                      setFormState({ ...formState, services: e.target.value })
                    }
                    placeholder="e.g. Ultrasound (USG), Digital X-Ray, Pathology Blood Tests, Doctor Chamber"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    value={formState.description}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        description: e.target.value,
                      })
                    }
                    placeholder="Comprehensive description of operations, products, and specialties..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Direct Phone
                    </label>
                    <input
                      type="tel"
                      value={formState.phone}
                      onChange={(e) =>
                        setFormState({ ...formState, phone: e.target.value })
                      }
                      placeholder="+919830000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formState.whatsapp}
                      onChange={(e) =>
                        setFormState({ ...formState, whatsapp: e.target.value })
                      }
                      placeholder="+919830000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formState.websiteUrl}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          websiteUrl: e.target.value,
                        })
                      }
                      placeholder="https://example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Booking / Ordering URL
                    </label>
                    <input
                      type="url"
                      value={formState.bookingUrl}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          bookingUrl: e.target.value,
                        })
                      }
                      placeholder="https://example.com/book"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingBusiness(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    {editingBusiness ? "Save Changes" : "Register Business"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VERIFICATION MODAL */}
      <AnimatePresence>
        {verifyingBusiness && (
          <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg font-orbitron">
                  <ShieldCheck size={22} className="text-blue-600" /> Verify
                  Claim via Conflux Verify
                </div>
                <button
                  onClick={() => setVerifyingBusiness(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs space-y-1">
                  <div className="font-bold text-blue-900">
                    Target Entity: {verifyingBusiness.name}
                  </div>
                  <div className="font-mono text-blue-700">
                    {verifyingBusiness.confluxBusinessId}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Verification Claim Statement *
                  </label>
                  <textarea
                    rows={4}
                    value={verifyClaimStatement}
                    onChange={(e) => setVerifyClaimStatement(e.target.value)}
                    placeholder="Specify the factual claim to corroborate against statutory registers..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Conflux Verify deterministically assesses this claim against
                  primary statutory repositories (MCA, GSTIN, FSSAI, Clinical
                  Establishments, IAF CertSearch) and generates an authoritative
                  confidence score.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyingBusiness(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteVerification}
                  disabled={isVerifying}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isVerifying
                    ? "Running Verify Engine..."
                    : "Corroborate & Ground"}{" "}
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
