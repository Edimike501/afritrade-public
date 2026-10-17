"use client";

import React from "react";
import {
  IdCard,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { RequireAdmin, Card, Badge, Button } from "@afritrade/ui";

export default function AdminKycPage() {
  return (
    <RequireAdmin>
      <div className="space-y-6">
        {/* Compliance Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border text-xs font-semibold mb-2">
              <IdCard size={14} className="text-primary" />
              <span>Identity Verification · Rule 23 Scope Protected</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
              KYC Individual Identity Verification
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Individual officer and ultimate beneficial owner (UBO) identity verification.
            </p>
          </div>
          <Badge variant="outline" className="text-xs self-start md:self-auto">
            Design-Only Shell
          </Badge>
        </div>

        {/* Prominent Coming Soon Banner per RULES §23 & DESIGN.md §8.6 */}
        <Card className="p-8 sm:p-12 bg-card border-border text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto border border-border">
            <Clock size={36} className="text-primary" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-xs font-bold uppercase tracking-wider">
              <span>Coming Soon in Phase 2</span>
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-foreground">
              Non-Functional Placeholder Module
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Per <strong>RULES Section 23</strong>, individual KYC verification (ID document uploads, biometric matching, and UBO checks) is strictly design-only until `SCOPE.md` is updated. Zero KYC logic, uploads, or endpoints exist in this build.
            </p>
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-xs text-muted-foreground">
              Current Active Verification:
            </span>
            <a href="/users/kyb" className="text-xs font-bold text-primary hover:underline">
              Go to KYB Business Review Queue →
            </a>
          </div>
        </Card>
      </div>
    </RequireAdmin>
  );
}
