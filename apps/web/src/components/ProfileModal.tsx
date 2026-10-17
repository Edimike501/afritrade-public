"use client";

import React, { useState, useEffect } from "react";
import { User, Globe, Mail, Shield, AlertCircle, Loader2, Check } from "lucide-react";
import { UpdateUserProfileSchema, type UpdateUserProfileInput } from "@afritrade/shared";
import { useCurrentUser, useUpdateUserProfile, ApiError } from "@afritrade/hooks";
import { Modal, Button, Input, Badge } from "@afritrade/ui";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { data: user, refetch } = useCurrentUser();
  const updateProfileMutation = useUpdateUserProfile();

  const [fullName, setFullName] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPreferredCurrency(user.preferredCurrency || "USD");
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const payload: UpdateUserProfileInput = {
        fullName: fullName.trim(),
        preferredCurrency: preferredCurrency as any,
      };

      // Client-side fail-fast validation (RULES §10b, §20)
      UpdateUserProfileSchema.parse(payload);

      await updateProfileMutation.mutateAsync(payload);
      setSuccess(true);
      refetch();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message);
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err?.message || "Failed to update profile settings.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : "User"} Profile & Settings`}
      description="Manage your personal profile details and default settlement currency."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 py-1">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg flex items-center gap-2">
            <Check size={16} className="shrink-0" />
            <span>Profile settings updated successfully!</span>
          </div>
        )}

        {/* Read-Only Identity Card */}
        <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Mail size={14} />
              <span>Email Address</span>
            </span>
            <span className="font-mono font-medium text-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Shield size={14} />
              <span>Account Role</span>
            </span>
            <Badge variant="outline" className="text-[10px] font-semibold uppercase">
              {user?.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Globe size={14} />
              <span>Registered Jurisdiction</span>
            </span>
            <span className="font-semibold text-foreground">{user?.countryCode || "N/A"}</span>
          </div>
        </div>

        {/* Mutable Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
              Full Name
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aliko Dangote"
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
              Preferred Settlement Currency
            </label>
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="USD">USD — US Dollar</option>
              <option value="NGN">NGN — Nigerian Naira</option>
              <option value="ZAR">ZAR — South African Rand</option>
              <option value="GHS">GHS — Ghanaian Cedi</option>
            </select>
            <p className="text-[11px] text-muted-foreground mt-1">
              Default currency used for display balances and order settlement calculations.
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={updateProfileMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateProfileMutation.isPending} className="gap-2">
            {updateProfileMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            <span>Save Profile</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
