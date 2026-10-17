"use client";

import React from "react";
import {
  Building2,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Package,
  Clock,
  RotateCcw,
} from "lucide-react";
import { KybStatus, type KybDocumentDto } from "@afritrade/shared";
import { Sheet } from "./Sheet";
import { Badge, CorridorBadge, KybBadge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";

export interface BusinessProfileDrawerData {
  id: string;
  businessName: string;
  countryCode: string;
  contactPhone: string | null;
  businessEmail?: string | null;
  businessAddress?: string | null;
  website?: string | null;
  description?: string | null;
  primaryCategory?: string | null;
  registrationNumberMasked?: string | null;
  taxIdMasked?: string | null;
  kybStatus: KybStatus;
  kybSubmittedAt?: string | null;
  kybReviewedAt?: string | null;
  kybRejectReason?: string | null;
  activeListingsCount?: number;
  documents?: KybDocumentDto[];
  ownerName?: string;
  ownerEmail?: string;
}

export interface BusinessProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfileDrawerData | null;
  onPreviewDocument?: (doc: KybDocumentDto) => void;
  isPreviewLoadingId?: string | null;
  onApproveKyb?: (profileId: string) => void;
  onRejectKyb?: (profileId: string) => void;
  onSetPendingKyb?: (profileId: string) => void;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CERTIFICATE_OF_INCORPORATION: "Certificate of Incorporation",
  TAX_CLEARANCE_CERTIFICATE: "Tax Clearance Certificate",
  DIRECTOR_ID: "Director / Representative ID",
  PROOF_OF_ADDRESS: "Corporate Proof of Address",
  OTHER: "Supporting Compliance Document",
};

export function BusinessProfileDrawer({
  isOpen,
  onClose,
  profile,
  onPreviewDocument,
  isPreviewLoadingId,
  onApproveKyb,
  onRejectKyb,
  onSetPendingKyb,
}: BusinessProfileDrawerProps) {
  if (!profile) return null;

  const docs = profile.documents ?? [];

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      title={profile.businessName}
      description={`Attached Corporate Dossier • ID: ${profile.id.slice(0, 12)}`}
      className="w-full sm:max-w-xl overflow-y-auto"
    >
      <div className="space-y-6 py-2">
        {/* Status & Corridor Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-2.5">
            <Building2 size={20} className="text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-foreground">
                  {profile.businessName}
                </span>
                <CorridorBadge country={profile.countryCode || "NG"} />
              </div>
              {profile.ownerEmail && (
                <p className="text-[11px] text-muted-foreground">
                  Account Holder: {profile.ownerName || "Supplier"} ({profile.ownerEmail})
                </p>
              )}
            </div>
          </div>
          <KybBadge status={profile.kybStatus} />
        </div>

        {/* Statutory KYB Credentials */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-primary" />
            <span>Statutory KYB Credentials</span>
          </h4>
          <Card className="p-4 bg-card border-border grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block">Incorporation Jurisdiction</span>
              <span className="font-semibold text-foreground mt-0.5 block">
                {profile.countryCode === "NG"
                  ? "Nigeria (CAC)"
                  : profile.countryCode === "ZA"
                    ? "South Africa (CIPC)"
                    : profile.countryCode === "GH"
                      ? "Ghana (RGD)"
                      : profile.countryCode}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Registration Number</span>
              <span className="font-mono font-semibold text-foreground mt-0.5 block">
                {profile.registrationNumberMasked || "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Tax Reference (TIN/VAT)</span>
              <span className="font-mono font-semibold text-foreground mt-0.5 block">
                {profile.taxIdMasked || "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Active Catalog Listings</span>
              <span className="font-semibold text-foreground mt-0.5 inline-flex items-center gap-1 tabular-nums">
                <Package size={13} className="text-primary" />
                {profile.activeListingsCount ?? 0} active lots
              </span>
            </div>
            {profile.kybSubmittedAt && (
              <div className="sm:col-span-2 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>Last KYB Update:</span>
                </span>
                <span className="font-mono">
                  {new Date(profile.kybSubmittedAt).toLocaleString()}
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Operational Business Details */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Operational Business Profile
          </h4>
          <Card className="p-4 bg-card border-border space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Phone size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block">Corporate Phone</span>
                  <span className="font-medium text-foreground">
                    {profile.contactPhone || "Not specified"}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block">Business Email</span>
                  <span className="font-medium text-foreground">
                    {profile.businessEmail || profile.ownerEmail || "Not specified"}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground block">Operating Address</span>
                  <span className="font-medium text-foreground">
                    {profile.businessAddress || "Not specified"}
                  </span>
                </div>
              </div>
              {profile.website && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <Globe size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block">Corporate Website</span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>{profile.website}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {profile.primaryCategory && (
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-muted-foreground">Primary Export Sector</span>
                <Badge variant="secondary" className="text-[11px]">
                  {profile.primaryCategory}
                </Badge>
              </div>
            )}

            {profile.description && (
              <div className="pt-2 border-t border-border/60">
                <span className="text-muted-foreground block mb-1">Enterprise Overview</span>
                <p className="text-foreground leading-relaxed">{profile.description}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Uploaded KYB Documents (Cloudflare R2 Private Vault) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText size={14} className="text-primary" />
              <span>Uploaded KYB Documents ({docs.length})</span>
            </h4>
            <Badge variant="outline" className="text-[10px]">
              Cloudflare R2 Private Signed URLs
            </Badge>
          </div>

          {docs.length === 0 ? (
            <Card className="p-5 bg-muted/20 border-dashed text-center text-xs text-muted-foreground">
              No KYB supporting documents uploaded yet.
            </Card>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => (
                <Card
                  key={doc.id}
                  className="p-3 bg-card border-border flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex items-start gap-2.5">
                    <FileText size={18} className="text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-foreground truncate">
                        {DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate font-mono">
                        {doc.fileName} • {(doc.fileSizeBytes / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {onPreviewDocument && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPreviewDocument(doc)}
                      isLoading={isPreviewLoadingId === doc.id}
                      className="text-xs shrink-0 gap-1.5"
                    >
                      <ExternalLink size={13} />
                      <span>Inspect</span>
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {profile.kybRejectReason && (
          <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
            <span className="font-bold block">Previous Compliance Rejection Reason:</span>
            <p>{profile.kybRejectReason}</p>
          </div>
        )}

        {/* KYB Status Management (Always editable by Admin, even after verification) */}
        {(onApproveKyb || onRejectKyb || onSetPendingKyb) && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Edit KYB Verification Status
              </span>
              <span className="text-[11px] text-muted-foreground">
                Current: <strong className="text-foreground">{profile.kybStatus}</strong>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {onSetPendingKyb && profile.kybStatus !== KybStatus.PENDING && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetPendingKyb(profile.id)}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw size={14} />
                  <span>Set Pending (Unlock Edits)</span>
                </Button>
              )}
              {onRejectKyb && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRejectKyb(profile.id)}
                  className="gap-1.5 text-xs"
                >
                  <XCircle size={14} />
                  <span>
                    {profile.kybStatus === KybStatus.APPROVED
                      ? "Revoke / Reject KYB"
                      : "Reject KYB"}
                  </span>
                </Button>
              )}
              {onApproveKyb && profile.kybStatus !== KybStatus.APPROVED && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onApproveKyb(profile.id)}
                  className="gap-1.5 text-xs"
                >
                  <CheckCircle2 size={14} />
                  <span>Approve Business</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
