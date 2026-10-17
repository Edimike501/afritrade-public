"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  ExternalLink,
  Clock,
  MapPin,
  Mail,
  RotateCcw,
} from "lucide-react";
import { KybStatus } from "@afritrade/shared";
import {
  RequireAdmin,
  Card,
  Button,
  Input,
  Textarea,
  Modal,
  Badge,
  KybBadge,
  CorridorBadge,
  EmptyState,
} from "@afritrade/ui";
import {
  useAdminKybQueue,
  useReviewKybDecision,
  useAdminKybDocumentSignedUrl,
  type BusinessProfileDto,
} from "@afritrade/hooks";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CERTIFICATE_OF_INCORPORATION: "Certificate of Incorporation",
  TAX_CLEARANCE_CERTIFICATE: "Tax Clearance Certificate",
  DIRECTOR_ID: "Director / Representative ID",
  PROOF_OF_ADDRESS: "Corporate Proof of Address",
  OTHER: "Supporting Compliance Document",
};

export default function AdminKybPage() {
  const [statusFilter, setStatusFilter] = useState<KybStatus>(KybStatus.PENDING);
  const { data: queue, isLoading, refetch } = useAdminKybQueue(statusFilter);
  const reviewMutation = useReviewKybDecision();
  const signedUrlMutation = useAdminKybDocumentSignedUrl();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [previewingDocId, setPreviewingDocId] = useState<string | null>(null);

  // Decision Modal State (Supports APPROVE, REJECT, and PENDING even after verification)
  const [modalAction, setModalAction] = useState<"APPROVE" | "REJECT" | "PENDING" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const profiles: BusinessProfileDto[] = queue || [];

  const filteredProfiles = profiles.filter((p) => {
    const matchesCountry =
      filterCountry === "ALL" || p.countryCode === filterCountry;
    const matchesSearch =
      !search.trim() ||
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const selectedProfile =
    profiles.find((p) => p.id === selectedProfileId) || filteredProfiles[0] || null;

  async function handleInspectDocument(docId: string) {
    setPreviewingDocId(docId);
    try {
      const res = await signedUrlMutation.mutateAsync(docId);
      if (typeof window !== "undefined" && res.signedUrl) {
        window.open(res.signedUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setPreviewingDocId(null);
    }
  }

  async function handleConfirmDecision() {
    if (!selectedProfile || !modalAction) return;
    setActionError(null);

    if (modalAction === "REJECT" && rejectReason.trim().length < 3) {
      setActionError("Please provide an explicit rejection reason (at least 3 characters) for the supplier.");
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        id: selectedProfile.id,
        input: {
          decision: modalAction,
          reason: modalAction === "REJECT" ? rejectReason.trim() : undefined,
        },
      });

      setModalAction(null);
      setRejectReason("");
      refetch();
    } catch (err: any) {
      setActionError(err?.message || "Failed to submit compliance decision.");
    }
  }

  const docs = selectedProfile?.documents ?? [];

  return (
    <RequireAdmin>
      <div className="space-y-6">
        {/* Compliance Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border text-xs font-semibold mb-2">
              <ShieldCheck size={14} className="text-primary" />
              <span>Statutory Compliance Queue & Cloudflare R2 Document Inspection</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
              KYB Verification Review
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manual admin inspection of commercial business filings and private R2 compliance documents before catalog publishing privileges are granted.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
              {[KybStatus.PENDING, KybStatus.APPROVED, KybStatus.REJECTED].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setSelectedProfileId(null);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
            >
              Refresh Queue
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-5 h-96 bg-muted rounded-xl"></div>
            <div className="lg:col-span-7 h-96 bg-muted rounded-xl"></div>
          </div>
        ) : profiles.length === 0 ? (
          <EmptyState
            title={`No ${statusFilter} KYB Submissions`}
            description="There are currently no business profiles in this verification state."
          />
        ) : (
          /* Split Workspace Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Submissions Queue Table (~40%) */}
            <Card className="lg:col-span-5 p-0 bg-card border-border overflow-hidden">
              <div className="p-4 border-b border-border space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-foreground">
                    Submissions ({filteredProfiles.length})
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    SLA: &lt; 24h
                  </span>
                </div>

                <Input
                  id="kyb-search"
                  placeholder="Search by company name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search size={16} />}
                />

                <div className="flex items-center gap-1.5 text-xs">
                  {["ALL", "NG", "ZA", "GH"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilterCountry(c)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                        filterCountry === c
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c === "ALL" ? "All Corridors" : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Items */}
              <div className="divide-y divide-border max-h-[540px] overflow-y-auto">
                {filteredProfiles.map((p) => {
                  const isSelected = selectedProfile?.id === p.id;
                  const docCount = p.documents?.length ?? 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProfileId(p.id)}
                      className={`p-4 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-primary/10 border-l-4 border-primary"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-sm text-foreground truncate">
                            {p.businessName}
                          </span>
                          <CorridorBadge country={p.countryCode || "NG"} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.registrationNumberMasked || `ID: ${p.id.slice(0, 8)}`} •{" "}
                          {docCount} doc{docCount === 1 ? "" : "s"} attached
                        </p>
                      </div>
                      <KybBadge status={p.kybStatus} />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Right Column: Detailed Verification Dossier (~60%) */}
            <div className="lg:col-span-7">
              {selectedProfile ? (
                <Card className="p-6 bg-card border-border space-y-6">
                  {/* Dossier Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-display font-bold text-xl text-foreground">
                          {selectedProfile.businessName}
                        </h2>
                        <CorridorBadge country={selectedProfile.countryCode || "NG"} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Profile ID: {selectedProfile.id}
                      </p>
                    </div>
                    <KybBadge status={selectedProfile.kybStatus} />
                  </div>

                  {/* Registered Credentials Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
                      <span className="text-muted-foreground font-semibold block">
                        Jurisdiction & Registry
                      </span>
                      <span className="font-display font-bold text-foreground text-sm block">
                        {selectedProfile.countryCode === "NG"
                          ? "Corporate Affairs Commission (CAC)"
                          : selectedProfile.countryCode === "ZA"
                            ? "Companies and Intellectual Property Commission (CIPC)"
                            : "Registrar-General's Department (RGD)"}
                      </span>
                      <span className="font-mono text-muted-foreground block">
                        Reg No: {selectedProfile.registrationNumberMasked || "Not provided"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
                      <span className="text-muted-foreground font-semibold block">
                        Contact & Sector
                      </span>
                      <span className="font-display font-bold text-foreground text-sm block">
                        {selectedProfile.contactPhone || "None provided"}
                      </span>
                      <span className="text-muted-foreground block">
                        {selectedProfile.primaryCategory || "General Export"}
                      </span>
                    </div>

                    {(selectedProfile.businessAddress || selectedProfile.businessEmail) && (
                      <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1 sm:col-span-2">
                        <span className="text-muted-foreground font-semibold block">
                          Operational Address & Trade Email
                        </span>
                        <div className="flex flex-wrap items-center gap-4 text-foreground mt-1">
                          {selectedProfile.businessAddress && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={13} className="text-primary" />
                              {selectedProfile.businessAddress}
                            </span>
                          )}
                          {selectedProfile.businessEmail && (
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Mail size={13} className="text-primary" />
                              {selectedProfile.businessEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedProfile.kybSubmittedAt && (
                      <div className="sm:col-span-2 flex items-center justify-between text-[11px] text-muted-foreground px-1">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          <span>Last Submission / Queue Timestamp:</span>
                        </span>
                        <span className="font-mono">
                          {new Date(selectedProfile.kybSubmittedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Uploaded KYB Documents Section (Cloudflare R2 Signed URLs) */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText size={14} className="text-primary" />
                        <span>Uploaded KYB Documents ({docs.length})</span>
                      </h3>
                      <Badge variant="outline" className="text-[10px]">
                        Cloudflare R2 Private Vault • Audited Access
                      </Badge>
                    </div>

                    {docs.length === 0 ? (
                      <div className="p-4 rounded-lg bg-muted/20 border border-dashed border-border text-xs text-muted-foreground text-center">
                        No KYB supporting documents uploaded for this business profile.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-lg bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <FileText size={17} className="text-primary shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">
                                  {DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType}
                                </p>
                                <p className="text-[11px] text-muted-foreground font-mono truncate">
                                  {doc.fileName} • {(doc.fileSizeBytes / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInspectDocument(doc.id)}
                              isLoading={previewingDocId === doc.id}
                              className="text-xs gap-1.5 shrink-0"
                            >
                              <ExternalLink size={13} />
                              <span>Inspect Document (Signed URL)</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Verification Status Context */}
                  {selectedProfile.kybRejectReason && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
                      <span className="font-bold block">Previous Rejection Reason:</span>
                      <p>{selectedProfile.kybRejectReason}</p>
                    </div>
                  )}

                  {/* KYB Status Actions (Available at all times, even after verification) */}
                  <div className="pt-6 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Edit KYB Verification Status
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Current Status:{" "}
                        <strong className="text-foreground">
                          {selectedProfile.kybStatus}
                        </strong>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      {selectedProfile.kybStatus !== KybStatus.PENDING && (
                        <Button
                          variant="outline"
                          onClick={() => setModalAction("PENDING")}
                          className="w-full sm:w-auto gap-2"
                        >
                          <RotateCcw size={16} />
                          <span>Set to Pending (Unlock Edits)</span>
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => setModalAction("REJECT")}
                        className="w-full sm:w-auto gap-2"
                      >
                        <XCircle size={18} />
                        <span>
                          {selectedProfile.kybStatus === KybStatus.APPROVED
                            ? "Revoke / Reject Filing"
                            : "Reject Filing"}
                        </span>
                      </Button>
                      {selectedProfile.kybStatus !== KybStatus.APPROVED && (
                        <Button
                          onClick={() => setModalAction("APPROVE")}
                          className="w-full sm:w-auto gap-2"
                        >
                          <CheckCircle2 size={18} />
                          <span>Approve Business</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <EmptyState
                  title="No Profile Selected"
                  description="Select a business verification filing from the left queue to inspect details."
                />
              )}
            </div>
          </div>
        )}

        {/* Decision Modal */}
        <Modal
          isOpen={modalAction !== null}
          onClose={() => {
            setModalAction(null);
            setActionError(null);
          }}
          title={
            modalAction === "APPROVE"
              ? "Approve Business Verification"
              : modalAction === "PENDING"
                ? "Set Business KYB to Pending"
                : "Reject / Revoke Business Verification"
          }
          description={`Corporate Entity: ${selectedProfile?.businessName}`}
        >
          <div className="space-y-4 py-2">
            {modalAction === "APPROVE" ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to approve this supplier? Approving will lock their KYB credentials and uploaded documents and activate product publishing privileges across the marketplace.
              </p>
            ) : modalAction === "PENDING" ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Setting this business back to <strong>PENDING</strong> re-opens compliance review and unlocks the supplier&apos;s statutory KYB details and document uploads so they can update their filing.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Provide an explicit justification for rejecting or revoking this filing. This message will be displayed to the supplier:
                </p>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., CAC registration certificate mismatch, unverified tax ID number..."
                  rows={4}
                  required
                />
              </div>
            )}

            {actionError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-xs">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalAction(null)}
              >
                Cancel
              </Button>
              <Button
                variant={modalAction === "REJECT" ? "destructive" : "primary"}
                size="sm"
                onClick={handleConfirmDecision}
                isLoading={reviewMutation.isPending}
              >
                {modalAction === "APPROVE"
                  ? "Confirm Approval"
                  : modalAction === "PENDING"
                    ? "Set to Pending"
                    : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RequireAdmin>
  );
}
