"use client";

import React, { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Building2,
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Check,
  Lock,
  User,
} from "lucide-react";
import {
  Role,
  KybStatus,
  KybDocumentType,
  SubmitKybSchema,
  UpdateBusinessDetailsSchema,
  UploadKybDocumentSchema,
  PRODUCT_CATEGORIES,
  type SubmitKybInput,
  type UpdateBusinessDetailsInput,
  type UploadKybDocumentInput,
} from "@afritrade/shared";
import {
  useMyBusinessProfile,
  useSubmitBusinessProfile,
  useUpdateKybSubmission,
  useUpdateBusinessDetails,
  useUploadKybDocument,
  useDeleteKybDocument,
  useSupplierKybDocumentSignedUrl,
  ApiError,
} from "@afritrade/hooks";
import {
  RequireRole,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  VerificationWarningBanner,
  useAuth,
} from "@afritrade/ui";

const JURISDICTION_OPTIONS = [
  { code: "NG", name: "Nigeria (Corporate Affairs Commission - CAC)", registry: "CAC" },
  { code: "ZA", name: "South Africa (Companies and Intellectual Property Commission - CIPC)", registry: "CIPC" },
  { code: "GH", name: "Ghana (Registrar General's Department - RGD)", registry: "RGD" },
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: KybDocumentType.CERTIFICATE_OF_INCORPORATION, label: "Certificate of Incorporation (CAC / CIPC / RGD)" },
  { value: KybDocumentType.TAX_CLEARANCE_CERTIFICATE, label: "Tax Clearance / TIN Certificate" },
  { value: KybDocumentType.DIRECTOR_ID, label: "Director / Representative Government ID (KYC/KYB)" },
  { value: KybDocumentType.PROOF_OF_ADDRESS, label: "Corporate Utility Bill / Proof of Address" },
  { value: KybDocumentType.OTHER, label: "Other Supporting Statutory Document" },
];

export default function SupplierKybPage() {
  const { user } = useAuth();
  const { data: profile, isLoading, error, refetch } = useMyBusinessProfile();
  const submitKybMutation = useSubmitBusinessProfile();
  const updateKybMutation = useUpdateKybSubmission();
  const updateDetailsMutation = useUpdateBusinessDetails();
  const uploadDocMutation = useUploadKybDocument();
  const deleteDocMutation = useDeleteKybDocument();
  const signedUrlMutation = useSupplierKybDocumentSignedUrl();

  // Statutory KYB Form State (editable when NOT_SUBMITTED, PENDING, or REJECTED)
  const [businessName, setBusinessName] = useState("");
  const [countryCode, setCountryCode] = useState("NG");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [kybValidationErrors, setKybValidationErrors] = useState<Record<string, string>>({});
  const [kybSubmitError, setKybSubmitError] = useState<string | null>(null);
  const [kybSuccessMessage, setKybSuccessMessage] = useState<string | null>(null);

  // Operational Business Details Form State (Always editable)
  const [contactPhone, setContactPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState<string>(PRODUCT_CATEGORIES[0] ?? "Agriculture");
  const [description, setDescription] = useState("");
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSuccess, setDetailsSuccess] = useState(false);

  // Cloudflare R2 Document Upload State
  const [selectedDocType, setSelectedDocType] = useState<KybDocumentType>(
    KybDocumentType.CERTIFICATE_OF_INCORPORATION,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [docSuccess, setDocSuccess] = useState<string | null>(null);
  const [previewingDocId, setPreviewingDocId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName || "");
      setCountryCode(profile.countryCode || user?.countryCode || "NG");
      setContactPhone(profile.contactPhone || "");
      setBusinessEmail(profile.businessEmail || "");
      setBusinessAddress(profile.businessAddress || "");
      setWebsite(profile.website || "");
      setPrimaryCategory(profile.primaryCategory || PRODUCT_CATEGORIES[0] || "Agriculture");
      setDescription(profile.description || "");
    } else if (user?.countryCode) {
      setCountryCode(user.countryCode);
    }
  }, [profile, user]);

  const status = profile?.kybStatus ?? KybStatus.NOT_SUBMITTED;
  const isApproved = status === KybStatus.APPROVED;
  const hasExistingProfile = Boolean(profile?.id);

  // Handler 1: Submit or Update Statutory KYB Credentials (only when not APPROVED)
  async function handleKybSubmit(e: FormEvent) {
    e.preventDefault();
    setKybValidationErrors({});
    setKybSubmitError(null);
    setKybSuccessMessage(null);

    const payload: SubmitKybInput = {
      businessName: businessName.trim(),
      countryCode: countryCode.toUpperCase(),
      ...(contactPhone.trim() ? { contactPhone: contactPhone.trim() } : {}),
      ...(registrationNumber.trim() ? { registrationNumber: registrationNumber.trim() } : {}),
      ...(taxId.trim() ? { taxId: taxId.trim() } : {}),
      ...(businessAddress.trim() ? { businessAddress: businessAddress.trim() } : {}),
      ...(primaryCategory.trim() ? { primaryCategory: primaryCategory.trim() } : {}),
    };

    const parseResult = SubmitKybSchema.safeParse(payload);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const fieldName = issue.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setKybValidationErrors(fieldErrors);
      return;
    }

    try {
      if (hasExistingProfile) {
        await updateKybMutation.mutateAsync(parseResult.data);
        setKybSuccessMessage(
          "KYB registration details updated. Your review timestamp has been refreshed in the compliance queue.",
        );
      } else {
        await submitKybMutation.mutateAsync(parseResult.data);
        setKybSuccessMessage("Business KYB profile submitted for compliance verification.");
      }
      setRegistrationNumber("");
      setTaxId("");
      refetch();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setKybSubmitError(err.message);
      } else if (err instanceof Error) {
        setKybSubmitError(err.message);
      } else {
        setKybSubmitError("Failed to save KYB registration details.");
      }
    }
  }

  // Handler 2: Update Operational Business Profile Details (Always allowed once profile exists)
  async function handleOperationalDetailsSubmit(e: FormEvent) {
    e.preventDefault();
    setDetailsError(null);
    setDetailsSuccess(false);

    const payload: UpdateBusinessDetailsInput = {
      contactPhone: contactPhone.trim(),
      businessEmail: businessEmail.trim(),
      businessAddress: businessAddress.trim(),
      website: website.trim(),
      primaryCategory: primaryCategory.trim(),
      description: description.trim(),
    };

    const parseResult = UpdateBusinessDetailsSchema.safeParse(payload);
    if (!parseResult.success) {
      setDetailsError(parseResult.error.issues[0]?.message || "Invalid business profile details.");
      return;
    }

    try {
      await updateDetailsMutation.mutateAsync(parseResult.data);
      setDetailsSuccess(true);
      refetch();
      setTimeout(() => setDetailsSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setDetailsError(err.message);
      } else if (err instanceof Error) {
        setDetailsError(err.message);
      } else {
        setDetailsError("Failed to update business profile details.");
      }
    }
  }

  // Handler 3: Upload KYB Document to Cloudflare R2
  async function handleUploadDocument(e: FormEvent) {
    e.preventDefault();
    setDocError(null);
    setDocSuccess(null);

    if (!selectedFile) {
      setDocError("Please select a PDF, JPEG, PNG, or WEBP document to upload.");
      return;
    }

    try {
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(selectedFile);
      });

      const payload: UploadKybDocumentInput = {
        documentType: selectedDocType,
        fileName: selectedFile.name,
        mimeType: selectedFile.type as any,
        fileSizeBytes: selectedFile.size,
        fileBase64,
      };

      const parsed = UploadKybDocumentSchema.safeParse(payload);
      if (!parsed.success) {
        setDocError(parsed.error.issues[0]?.message || "Invalid document file.");
        return;
      }

      await uploadDocMutation.mutateAsync(parsed.data);
      setSelectedFile(null);
      setDocSuccess(
        "Document uploaded to private Cloudflare R2 vault. Your compliance review queue timestamp has been refreshed.",
      );
      refetch();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setDocError(err.message);
      } else if (err instanceof Error) {
        setDocError(err.message);
      } else {
        setDocError("Failed to upload KYB document.");
      }
    }
  }

  async function handlePreviewDocument(docId: string) {
    setPreviewingDocId(docId);
    try {
      const res = await signedUrlMutation.mutateAsync(docId);
      if (typeof window !== "undefined" && res.signedUrl) {
        window.open(res.signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err: unknown) {
      setDocError(err instanceof Error ? err.message : "Could not generate signed document URL.");
    } finally {
      setPreviewingDocId(null);
    }
  }

  async function handleDeleteDocument(docId: string) {
    setDocError(null);
    try {
      await deleteDocMutation.mutateAsync(docId);
      refetch();
    } catch (err: unknown) {
      setDocError(err instanceof Error ? err.message : "Failed to delete document.");
    }
  }

  const isKybMutating = submitKybMutation.isPending || updateKybMutation.isPending;
  const documents = profile?.documents ?? [];

  return (
    <RequireRole roles={[Role.SUPPLIER]}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border text-xs font-semibold mb-2">
              <Building2 size={14} className="text-primary" />
              <span>Corporate Entity & Statutory KYB Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              Business Profile & KYB Verification
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your corporate operating profile, statutory registration details, and private Cloudflare R2 compliance documents.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 self-start sm:self-center"
          >
            <RefreshCw size={16} />
            <span>Refresh Profile</span>
          </Button>
        </div>

        {/* Architectural Distinction Callout: User Account vs Business Profile */}
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <User size={16} />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Account Holder Identity vs. Attached Business Profile
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Signed in as <strong>{user?.fullName}</strong> ({user?.email}). Personal account settings are managed in the sidebar Profile modal; your commercial exporter entity and KYB filings are managed below.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 self-start sm:self-center font-mono">
              KYB: {status}
            </Badge>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm mt-3">Loading business profile & verification dossier…</p>
          </div>
        )}

        {error && !hasExistingProfile && status !== "NOT_SUBMITTED" && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm">
              Notice: {error instanceof Error ? error.message : "Submit your business profile below to begin."}
            </p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Status Banners */}
            {isApproved && (
              <Card className="border-emerald-500/30 bg-emerald-500/10">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <ShieldCheck size={30} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground">
                          KYB Status: Verified Exporter
                        </h2>
                        <Badge variant="success">APPROVED</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your statutory KYB credentials and documents are verified and locked. You can still update your operational business contact details at any time below.
                      </p>
                    </div>
                  </div>

                  <Button asChild size="sm" className="shrink-0 gap-1.5">
                    <Link href="/products/new">
                      <span>Create Product Listing</span>
                      <ArrowRight size={14} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {status === KybStatus.PENDING && (
              <Card className="border-amber-500/40 bg-amber-500/10">
                <CardContent className="p-5 flex items-start gap-3.5">
                  <ShieldAlert size={30} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-foreground">
                        KYB Status: Pending Compliance Review
                      </h2>
                      <Badge variant="warning">PENDING</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your business profile and uploaded KYB documents are in the Admin review queue. You may still edit your KYB details or upload additional documents below while unverified.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {status === KybStatus.REJECTED && (
              <Card className="border-destructive/40 bg-destructive/10">
                <CardContent className="p-5 space-y-2.5">
                  <div className="flex items-start gap-3.5">
                    <XCircle size={30} className="text-destructive shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground">
                          KYB Status: Action Required (Rejected)
                        </h2>
                        <Badge variant="destructive">REJECTED</Badge>
                      </div>
                      {profile?.kybRejectReason && (
                        <p className="text-xs font-medium text-destructive mt-1.5 p-2 rounded bg-destructive/10 border border-destructive/20">
                          Reviewer Feedback: {profile.kybRejectReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pl-11">
                    Update your KYB registration details or upload corrected compliance documents below to re-enter the verification queue.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Feature 1: Operational Business Profile Section (Editable Anytime) */}
            {hasExistingProfile && (
              <Card className="border border-border shadow-xs">
                <CardHeader className="pb-4 border-b border-border/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Building2 size={18} className="text-primary" />
                        <span>1. Operational Business Profile Details</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Commercial contact details, operating address, and company overview shown to trade operations. Editable at any time without affecting your KYB verification status.
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[11px] self-start sm:self-center">
                      Always Editable
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  {detailsError && (
                    <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{detailsError}</span>
                    </div>
                  )}
                  {detailsSuccess && (
                    <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <Check size={16} className="shrink-0" />
                      <span>Operational business details saved successfully.</span>
                    </div>
                  )}

                  <form onSubmit={handleOperationalDetailsSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="ops-phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Corporate Contact Phone
                        </label>
                        <input
                          id="ops-phone"
                          type="tel"
                          placeholder="e.g. +234 1 800 4000"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="ops-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Trade / Export Desk Email
                        </label>
                        <input
                          id="ops-email"
                          type="email"
                          placeholder="e.g. export@yourcompany.africa"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="ops-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Primary Export Sector
                        </label>
                        <select
                          id="ops-category"
                          value={primaryCategory}
                          onChange={(e) => setPrimaryCategory(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="ops-website" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Corporate Website
                        </label>
                        <input
                          id="ops-website"
                          type="url"
                          placeholder="https://www.yourcompany.africa"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="ops-address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Warehouse / Corporate Operating Address
                        </label>
                        <input
                          id="ops-address"
                          type="text"
                          placeholder="e.g. Plot 14 Tin Can Island Industrial Estate, Apapa, Lagos"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="ops-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Enterprise Capabilities & Export Overview
                        </label>
                        <textarea
                          id="ops-desc"
                          rows={3}
                          placeholder="Describe your production capacity, export corridors, and quality certifications..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updateDetailsMutation.isPending}
                        className="gap-2"
                      >
                        {updateDetailsMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                        <span>Save Operational Business Details</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Feature 4: Statutory KYB Registration Details (Editable until APPROVED, with Extended Duration Warning) */}
            <Card className="border border-border shadow-xs">
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ShieldCheck size={18} className="text-primary" />
                      <span>2. Statutory KYB Registration Credentials</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Legal incorporation name, jurisdiction, and statutory registry numbers verified by Admin operations.
                    </p>
                  </div>
                  {isApproved ? (
                    <Badge variant="success" className="gap-1 text-[11px] self-start sm:self-center">
                      <Lock size={12} />
                      <span>Verified & Locked</span>
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[11px] self-start sm:self-center">
                      Editable Until Approved
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-5">
                {/* Feature 4 Catch: Info warning that editing KYB details while unverified can extend verification duration */}
                {!isApproved && (
                  <VerificationWarningBanner submittedAt={profile?.kybSubmittedAt} />
                )}

                {kybSubmitError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-destructive text-xs flex items-start gap-2.5">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{kybSubmitError}</span>
                  </div>
                )}

                {kybSuccessMessage && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
                    <Check size={16} className="shrink-0 mt-0.5" />
                    <span>{kybSuccessMessage}</span>
                  </div>
                )}

                {isApproved ? (
                  /* Read-only Statutory Credentials when APPROVED */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs p-4 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <span className="text-muted-foreground block">Legal Entity Name</span>
                      <strong className="text-foreground font-semibold text-sm mt-0.5 block">
                        {profile?.businessName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Jurisdiction</span>
                      <strong className="text-foreground font-semibold text-sm mt-0.5 block">
                        {profile?.countryCode ?? "NG"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Registration Number</span>
                      <strong className="text-foreground font-mono font-semibold text-sm mt-0.5 block">
                        {profile?.registrationNumberMasked || "Verified on file"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Tax Reference</span>
                      <strong className="text-foreground font-mono font-semibold text-sm mt-0.5 block">
                        {profile?.taxIdMasked || "Verified on file"}
                      </strong>
                    </div>
                  </div>
                ) : (
                  /* Editable KYB Form when NOT_SUBMITTED, PENDING, or REJECTED */
                  <form onSubmit={handleKybSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="businessName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Corporate Legal Name *
                        </label>
                        <input
                          id="businessName"
                          type="text"
                          required
                          placeholder="e.g. Olam Agribusiness Nigeria Ltd."
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          disabled={isKybMutating}
                        />
                        {kybValidationErrors.businessName && (
                          <p className="text-xs text-destructive">{kybValidationErrors.businessName}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="countryCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Registry Jurisdiction *
                        </label>
                        <select
                          id="countryCode"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          disabled={isKybMutating}
                        >
                          {JURISDICTION_OPTIONS.map((opt) => (
                            <option key={opt.code} value={opt.code}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="registrationNumber" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Company Registration Number (CAC / CIPC / RGD)
                        </label>
                        <input
                          id="registrationNumber"
                          type="text"
                          placeholder={
                            profile?.registrationNumberMasked
                              ? `Current: ${profile.registrationNumberMasked} (enter to replace)`
                              : "e.g. RC-1029381"
                          }
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          disabled={isKybMutating}
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Stored as a cryptographic hash and masked reference per privacy rules (RULES §3).
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="taxId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Tax Identification Number (TIN / VAT)
                        </label>
                        <input
                          id="taxId"
                          type="text"
                          placeholder={
                            profile?.taxIdMasked
                              ? `Current: ${profile.taxIdMasked} (enter to replace)`
                              : "e.g. TIN-94820192"
                          }
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          disabled={isKybMutating}
                        />
                      </div>

                      {!hasExistingProfile && (
                        <>
                          <div className="space-y-1.5">
                            <label htmlFor="contactPhone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Corporate Contact Phone
                            </label>
                            <input
                              id="contactPhone"
                              type="tel"
                              placeholder="e.g. +234 1 234 5678"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              disabled={isKybMutating}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label htmlFor="initialAddress" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Operating Address
                            </label>
                            <input
                              id="initialAddress"
                              type="text"
                              placeholder="e.g. 14 Wharf Road, Apapa, Lagos"
                              value={businessAddress}
                              onChange={(e) => setBusinessAddress(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              disabled={isKybMutating}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isKybMutating}
                        className="gap-2"
                      >
                        {isKybMutating ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Saving KYB Filing…</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={15} />
                            <span>
                              {hasExistingProfile
                                ? "Update KYB Details (Resets Review Timer)"
                                : "Submit for KYB Review"}
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Feature 3 & 4: Cloudflare R2 KYB Document Uploads & Vault */}
            <Card className="border border-border shadow-xs">
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <FileText size={18} className="text-primary" />
                      <span>3. KYB Verification Documents (Cloudflare R2 Vault)</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload incorporation certificates, tax clearance, and representative ID documents. Stored as private S3 objects in Cloudflare R2 and served only via short-lived signed URLs.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[11px] self-start sm:self-center">
                    {documents.length} Document{documents.length === 1 ? "" : "s"} Attached
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-5">
                {docError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{docError}</span>
                  </div>
                )}

                {docSuccess && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <Check size={16} className="shrink-0" />
                    <span>{docSuccess}</span>
                  </div>
                )}

                {/* Upload Form (Only available when profile exists and is NOT APPROVED) */}
                {!hasExistingProfile ? (
                  <div className="p-4 rounded-lg bg-muted/40 border border-dashed border-border text-xs text-muted-foreground text-center">
                    Save your initial KYB registration details in Section 2 above to unlock private Cloudflare R2 document uploads.
                  </div>
                ) : !isApproved ? (
                  <form
                    onSubmit={handleUploadDocument}
                    className="p-4 rounded-xl bg-muted/30 border border-border space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="docType" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Document Classification
                        </label>
                        <select
                          id="docType"
                          value={selectedDocType}
                          onChange={(e) => setSelectedDocType(e.target.value as KybDocumentType)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          disabled={uploadDocMutation.isPending}
                        >
                          {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="docFile" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Select Document File (PDF, JPG, PNG, WEBP • Max 10 MB)
                        </label>
                        <input
                          id="docFile"
                          type="file"
                          accept=".pdf,image/jpeg,image/png,image/webp"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-primary"
                          disabled={uploadDocMutation.isPending}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        Uploading or deleting a document refreshes your KYB submission timestamp and may extend verification duration.
                      </span>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!selectedFile || uploadDocMutation.isPending}
                        className="gap-1.5 shrink-0"
                      >
                        {uploadDocMutation.isPending ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Uploading to R2…</span>
                          </>
                        ) : (
                          <>
                            <Upload size={15} />
                            <span>Upload to Private R2 Bucket</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : null}

                {/* Attached Documents List */}
                {documents.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                    No compliance documents uploaded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-foreground truncate">
                              {DOCUMENT_TYPE_OPTIONS.find((d) => d.value === doc.documentType)?.label ??
                                doc.documentType}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              {doc.fileName} • {(doc.fileSizeBytes / 1024).toFixed(1)} KB • Uploaded{" "}
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewDocument(doc.id)}
                            isLoading={previewingDocId === doc.id}
                            className="text-xs gap-1.5"
                          >
                            <ExternalLink size={13} />
                            <span>View Signed URL</span>
                          </Button>

                          {!isApproved && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                              disabled={deleteDocMutation.isPending}
                              className="text-xs text-destructive hover:bg-destructive/10"
                              aria-label={`Remove ${doc.fileName}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </RequireRole>
  );
}
