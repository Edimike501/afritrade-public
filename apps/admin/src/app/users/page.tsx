"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Building2,
  FileText,
  RefreshCw,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import {
  KybStatus,
  Role,
  type AdminUserDto,
  type KybDocumentDto,
} from "@afritrade/shared";
import {
  useAdminUsers,
  useAdminKybDocumentSignedUrl,
  useReviewKybDecision,
} from "@afritrade/hooks";
import {
  RequireAdmin,
  Card,
  Badge,
  Button,
  Input,
  Textarea,
  Modal,
  KybBadge,
  CorridorBadge,
  EmptyState,
  BusinessProfileDrawer,
  type BusinessProfileDrawerData,
} from "@afritrade/ui";

export default function AdminUsersDirectoryPage() {
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { data: users = [], isLoading, refetch } = useAdminUsers({
    ...(roleFilter !== "ALL" ? { role: roleFilter as Role } : {}),
    ...(countryFilter !== "ALL" ? { countryCode: countryFilter } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  });

  const signedUrlMutation = useAdminKybDocumentSignedUrl();
  const reviewMutation = useReviewKybDecision();

  const [selectedDrawerProfile, setSelectedDrawerProfile] =
    useState<BusinessProfileDrawerData | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  // KYB Status Edit Modal State (works from table row or from inside drawer, even after verification)
  const [decisionModal, setDecisionModal] = useState<{
    profileId: string;
    businessName: string;
    currentStatus: KybStatus;
    action: "APPROVE" | "REJECT" | "PENDING";
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [decisionError, setDecisionError] = useState<string | null>(null);

  // Pagination calculations
  const totalUsers = users.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalUsers);
  const paginatedUsers = users.slice(startIndex, endIndex);

  function openBusinessDrawer(user: AdminUserDto) {
    if (!user.businessProfile) return;
    setSelectedDrawerProfile({
      ...user.businessProfile,
      ownerName: user.fullName,
      ownerEmail: user.email,
    });
  }

  function openEditKybModal(
    profileId: string,
    businessName: string,
    currentStatus: KybStatus,
    defaultAction?: "APPROVE" | "REJECT" | "PENDING",
  ) {
    const initialAction =
      defaultAction ??
      (currentStatus === KybStatus.APPROVED ? "PENDING" : "APPROVE");
    setDecisionError(null);
    setRejectReason("");
    setDecisionModal({
      profileId,
      businessName,
      currentStatus,
      action: initialAction,
    });
  }

  async function handleInspectDocument(doc: KybDocumentDto) {
    setPreviewLoadingId(doc.id);
    try {
      const res = await signedUrlMutation.mutateAsync(doc.id);
      if (typeof window !== "undefined" && res.signedUrl) {
        window.open(res.signedUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setPreviewLoadingId(null);
    }
  }

  async function handleConfirmDecision() {
    if (!decisionModal) return;
    setDecisionError(null);

    if (decisionModal.action === "REJECT" && rejectReason.trim().length < 3) {
      setDecisionError(
        "Please provide a rejection/revocation reason (at least 3 characters).",
      );
      return;
    }

    try {
      const updated = await reviewMutation.mutateAsync({
        id: decisionModal.profileId,
        input: {
          decision: decisionModal.action,
          reason:
            decisionModal.action === "REJECT" && rejectReason.trim()
              ? rejectReason.trim()
              : undefined,
        },
      });
      setDecisionModal(null);
      setRejectReason("");
      if (selectedDrawerProfile && selectedDrawerProfile.id === updated.id) {
        setSelectedDrawerProfile({
          ...selectedDrawerProfile,
          kybStatus: updated.kybStatus,
          kybRejectReason: updated.kybRejectReason,
        });
      }
      refetch();
    } catch (err: any) {
      setDecisionError(err?.message || "Failed to update KYB status.");
    }
  }

  return (
    <RequireAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border text-xs font-semibold mb-2">
              <Users size={14} className="text-primary" />
              <span>Platform Identity & Attached Business Oversight</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
              All Users & Attached Businesses
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Inspect all registered accounts across roles. For suppliers, view their attached Business Profile, edit KYB status at any time, and inspect private Cloudflare R2 documents.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-xs self-start md:self-auto"
          >
            <RefreshCw size={14} />
            <span>Refresh Directory</span>
          </Button>
        </div>

        {/* Filters & Table Card */}
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="w-full lg:max-w-md">
              <Input
                id="all-users-search"
                placeholder="Search by user name, email, or attached business name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search size={16} />}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Role Filter Pills */}
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                {["ALL", Role.SUPPLIER, Role.BUYER, Role.ADMIN].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRoleFilter(r);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      roleFilter === r
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r === "ALL" ? "All Roles" : r}
                  </button>
                ))}
              </div>

              {/* Corridor Filter Pills */}
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                {["ALL", "NG", "ZA", "GH"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCountryFilter(c);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      countryFilter === c
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c === "ALL" ? "All Corridors" : c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-6 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded-lg" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No Users Match Filter"
              description="Try clearing your search query or switching role and corridor filters."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3">User Account</th>
                      <th className="py-3 px-3">Role & Corridor</th>
                      <th className="py-3 px-3">Attached Business Profile (Suppliers)</th>
                      <th className="py-3 px-3">KYB & R2 Docs</th>
                      <th className="py-3 px-3">Activity</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedUsers.map((u) => {
                      const bp = u.businessProfile;
                      return (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="font-display font-bold text-sm text-foreground">
                              {u.fullName}
                            </div>
                            <div className="text-muted-foreground font-mono text-[11px]">
                              {u.email}
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant={
                                  u.role === Role.ADMIN
                                    ? "primary"
                                    : u.role === Role.SUPPLIER
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-[10px] uppercase font-bold"
                              >
                                {u.role}
                              </Badge>
                              <CorridorBadge country={u.countryCode || "NG"} />
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            {u.role === Role.SUPPLIER ? (
                              bp ? (
                                <div className="space-y-0.5">
                                  <div className="font-display font-bold text-xs text-foreground flex items-center gap-1.5">
                                    <Building2 size={13} className="text-primary shrink-0" />
                                    <span>{bp.businessName}</span>
                                  </div>
                                  <div className="text-[11px] text-muted-foreground font-mono">
                                    {bp.registrationNumberMasked || "Registry pending"} •{" "}
                                    {bp.primaryCategory || "General Wholesale"}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic text-[11px]">
                                  Business profile not yet submitted
                                </span>
                              )
                            ) : (
                              <span className="text-muted-foreground text-[11px]">
                                — (Personal / {u.role === Role.BUYER ? "Buyer" : "Admin"} Account)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            {bp ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <KybBadge status={bp.kybStatus} />
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                                  <FileText size={12} />
                                  {bp.documentsCount} doc{bp.documentsCount === 1 ? "" : "s"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 tabular-nums font-medium">
                            {u.role === Role.SUPPLIER ? (
                              <span>{bp?.activeListingsCount ?? 0} active listings</span>
                            ) : u.role === Role.BUYER ? (
                              <span>{u.ordersCount} orders placed</span>
                            ) : (
                              <span>Platform Ops</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            {bp ? (
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openBusinessDrawer(u)}
                                  className="text-xs gap-1.5"
                                >
                                  <Eye size={13} />
                                  <span>View Business</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    openEditKybModal(
                                      bp.id,
                                      bp.businessName,
                                      bp.kybStatus,
                                    )
                                  }
                                  className="text-xs gap-1 border border-border"
                                >
                                  <ShieldCheck size={13} />
                                  <span>Edit KYB</span>
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-mono">
                                Joined {new Date(u.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-3">
                  <span>
                    Showing{" "}
                    <strong className="text-foreground tabular-nums">
                      {startIndex + 1}–{endIndex}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-foreground tabular-nums">
                      {totalUsers}
                    </strong>{" "}
                    users
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Rows per page:</span>
                    <select
                      aria-label="Rows per page"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-8 px-2 rounded-md border border-border bg-card text-foreground text-xs font-semibold"
                    >
                      {[10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-2.5 text-xs gap-1"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-bold tabular-nums transition-colors ${
                            pageNum === safePage
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ),
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="h-8 px-2.5 text-xs gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Slide-Over Attached Business Profile Drawer */}
        <BusinessProfileDrawer
          isOpen={selectedDrawerProfile !== null}
          onClose={() => setSelectedDrawerProfile(null)}
          profile={selectedDrawerProfile}
          onPreviewDocument={handleInspectDocument}
          isPreviewLoadingId={previewLoadingId}
          onApproveKyb={(profileId) =>
            openEditKybModal(
              profileId,
              selectedDrawerProfile?.businessName ?? "Supplier",
              selectedDrawerProfile?.kybStatus ?? KybStatus.PENDING,
              "APPROVE",
            )
          }
          onSetPendingKyb={(profileId) =>
            openEditKybModal(
              profileId,
              selectedDrawerProfile?.businessName ?? "Supplier",
              selectedDrawerProfile?.kybStatus ?? KybStatus.APPROVED,
              "PENDING",
            )
          }
          onRejectKyb={(profileId) =>
            openEditKybModal(
              profileId,
              selectedDrawerProfile?.businessName ?? "Supplier",
              selectedDrawerProfile?.kybStatus ?? KybStatus.PENDING,
              "REJECT",
            )
          }
        />

        {/* KYB Status Edit Modal (Supports editing status even after APPROVED) */}
        <Modal
          isOpen={decisionModal !== null}
          onClose={() => {
            setDecisionModal(null);
            setDecisionError(null);
          }}
          title="Edit Business KYB Status"
          description={`Entity: ${decisionModal?.businessName ?? ""} • Current Status: ${decisionModal?.currentStatus ?? ""}`}
        >
          <div className="space-y-4 py-2">
            {/* Status Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground block">
                Select Target KYB Status
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    decisionModal &&
                    setDecisionModal({ ...decisionModal, action: "APPROVE" })
                  }
                  className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center gap-2 ${
                    decisionModal?.action === "APPROVE"
                      ? "border-primary bg-primary/10 text-foreground font-bold"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <div>
                    <div className="font-bold">APPROVED</div>
                    <div className="text-[10px] opacity-80">Verified & Locked</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    decisionModal &&
                    setDecisionModal({ ...decisionModal, action: "PENDING" })
                  }
                  className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center gap-2 ${
                    decisionModal?.action === "PENDING"
                      ? "border-amber-500 bg-amber-500/10 text-foreground font-bold"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <RotateCcw size={16} className="text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold">PENDING</div>
                    <div className="text-[10px] opacity-80">Re-open & Unlock Edits</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    decisionModal &&
                    setDecisionModal({ ...decisionModal, action: "REJECT" })
                  }
                  className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center gap-2 ${
                    decisionModal?.action === "REJECT"
                      ? "border-destructive bg-destructive/10 text-foreground font-bold"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <XCircle size={16} className="text-destructive shrink-0" />
                  <div>
                    <div className="font-bold">REJECTED</div>
                    <div className="text-[10px] opacity-80">Revoke / Reject</div>
                  </div>
                </button>
              </div>
            </div>

            {decisionModal?.action === "APPROVE" && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Setting status to <strong>APPROVED</strong> marks this supplier&apos;s attached business profile as verified, locks their statutory KYB credentials and uploaded documents, and enables public catalog publishing.
              </p>
            )}

            {decisionModal?.action === "PENDING" && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Setting status to <strong>PENDING</strong> re-opens compliance review and unlocks the supplier&apos;s statutory KYB fields and document uploads so they can update their filing.
              </p>
            )}

            {decisionModal?.action === "REJECT" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Provide an explicit reason for rejecting or revoking this KYB verification (visible to the supplier):
                </p>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Uploaded incorporation certificate expired or requires updated tax clearance..."
                  rows={4}
                  required
                />
              </div>
            )}

            {decisionError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-xs">
                {decisionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setDecisionModal(null)}>
                Cancel
              </Button>
              <Button
                variant={decisionModal?.action === "REJECT" ? "destructive" : "primary"}
                size="sm"
                onClick={handleConfirmDecision}
                isLoading={reviewMutation.isPending}
              >
                {decisionModal?.action === "APPROVE"
                  ? "Confirm Approval"
                  : decisionModal?.action === "PENDING"
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
