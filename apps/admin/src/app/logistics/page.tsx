"use client";

import React, { useState } from "react";
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Globe,
  Tag,
} from "lucide-react";
import {
  RequireAdmin,
  Card,
  Button,
  Badge,
  Input,
  Textarea,
  Modal,
  EmptyState,
} from "@afritrade/ui";
import {
  useLogisticsPartners,
  useCreateLogisticsPartner,
  useUpdateLogisticsPartner,
  type LogisticsPartnerDto,
} from "@afritrade/hooks";

export default function AdminLogisticsPage() {
  const { data: partners, isLoading, refetch } = useLogisticsPartners();
  const createMutation = useCreateLogisticsPartner();
  const updateMutation = useUpdateLogisticsPartner();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [coverage, setCoverage] = useState("NG, ZA, GH");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const partnerList: LogisticsPartnerDto[] = partners || [];

  const filtered = partnerList.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.countryCoverage.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleCreatePartner(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const countryCoverage = coverage
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    if (countryCoverage.length === 0) {
      setFormError("Please enter at least one ISO country code (e.g., NG, ZA, GH).");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        countryCoverage,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive: true,
      });

      setModalOpen(false);
      setName("");
      setCoverage("NG, ZA, GH");
      setContactEmail("");
      setContactPhone("");
      setNotes("");
      refetch();
    } catch (err: any) {
      setFormError(err?.message || "Failed to create logistics carrier.");
    }
  }

  async function handleToggleStatus(partner: LogisticsPartnerDto) {
    try {
      await updateMutation.mutateAsync({
        id: partner.id,
        input: { isActive: !partner.isActive },
      });
      refetch();
    } catch (err: any) {
      console.error(err);
    }
  }

  return (
    <RequireAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border text-xs font-semibold mb-2">
              <Truck size={14} className="text-primary" />
              <span>Operations Logistics · Regional Freight</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">
              Logistics Partners
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Admin-curated freight carriers and haulage providers covering regional African corridors.
            </p>
          </div>

          <Button onClick={() => setModalOpen(true)} className="gap-2 text-xs">
            <Plus size={16} />
            <span>Add Freight Partner</span>
          </Button>
        </div>

        {/* Directory Card */}
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="max-w-md">
            <Input
              id="logistics-search"
              placeholder="Search by carrier name or country corridor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No Logistics Partners"
              description="No freight carriers registered yet. Add vetted freight partners covering air, sea, and overland African corridors."
              action={
                <Button size="sm" onClick={() => setModalOpen(true)}>
                  Add First Carrier
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Carrier / Partner</th>
                    <th className="py-3 px-3">Corridor Coverage</th>
                    <th className="py-3 px-3">Contact Email</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((partner) => (
                    <tr key={partner.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-display font-bold text-sm text-foreground">
                          {partner.name}
                        </div>
                        {partner.notes && (
                          <div className="text-muted-foreground text-[11px] truncate max-w-xs">
                            {partner.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {partner.countryCoverage.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted border border-border"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {partner.contactEmail || "—"}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {partner.contactPhone || "—"}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={partner.isActive ? "success" : "outline"} className="text-[10px]">
                          {partner.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(partner)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          {partner.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal: Add Carrier */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add Logistics Partner"
          description="Register a vetted regional haulage or freight carrier."
        >
          <form onSubmit={handleCreatePartner} className="space-y-4 py-2">
            <Input
              id="partner-name"
              label="Carrier / Freight Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Accra-Lagos Express Haulage"
              required
            />

            <Input
              id="partner-coverage"
              label="Country Corridors (comma-separated ISO codes)"
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              placeholder="NG, ZA, GH"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="partner-email"
                label="Dispatch Email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="dispatch@carrier.com"
              />
              <Input
                id="partner-phone"
                label="Operations Phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+234 801 234 5678"
              />
            </div>

            <Textarea
              id="partner-notes"
              label="Carrier Fleet & Transit Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., 30-ton flatbed trailers covering Lagos-Tema corridor."
              rows={3}
            />

            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-xs">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={createMutation.isPending}
              >
                Save Partner
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RequireAdmin>
  );
}
