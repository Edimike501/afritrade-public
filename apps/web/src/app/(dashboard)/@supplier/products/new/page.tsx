"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  ShieldAlert,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Role,
  CreateProductSchema,
  PRODUCT_CATEGORIES,
  type CreateProductInput,
} from "@afritrade/shared";
import { useCreateProduct, useMyBusinessProfile, ApiError } from "@afritrade/hooks";
import {
  RequireRole,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@afritrade/ui";

const CURRENCY_OPTIONS = [
  { code: "NGN", name: "Nigerian Naira (₦)" },
  { code: "ZAR", name: "South African Rand (R)" },
  { code: "GHS", name: "Ghanaian Cedi (GH₵)" },
  { code: "USD", name: "US Dollar ($)" },
];

export default function NewProductPage() {
  const router = useRouter();
  const createProductMutation = useCreateProduct();
  const { data: profile, isLoading: isProfileLoading } = useMyBusinessProfile();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [currencyCode, setCurrencyCode] = useState("NGN");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isKybApproved = profile?.kybStatus === "APPROVED";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationErrors({});
    setGeneralError(null);

    const payload: CreateProductInput = {
      name: name.trim(),
      category: category.trim(),
      price: price.trim(),
      currencyCode: currencyCode.toUpperCase(),
      description: description.trim(),
      ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
    };

    // Strict client-side validation per Rules §10b / §20
    const parseResult = CreateProductSchema.safeParse(payload);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const fieldName = issue.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setValidationErrors(fieldErrors);
      return;
    }

    try {
      await createProductMutation.mutateAsync(parseResult.data);
      router.push("/products");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
      } else if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An error occurred while publishing the listing.");
      }
    }
  }

  return (
    <RequireRole roles={[Role.SUPPLIER]}>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Products</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Create Product Listing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish a verified commodity or manufactured wholesale product to the AfCFTA marketplace.
          </p>
        </div>

        {/* KYB Gating Screen */}
        {!isProfileLoading && !isKybApproved && (
          <Card className="border-amber-500/40 bg-amber-500/10">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert size={28} className="shrink-0 text-amber-600 dark:text-amber-400 mt-1" />
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-amber-950 dark:text-amber-100">
                    Supplier KYB Verification Required
                  </h2>
                  <p className="text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                    Under AfriTrade Connect trade policies, only businesses with an <strong>APPROVED</strong> corporate registry status can publish listings. Your current status is: <strong>{profile?.kybStatus ?? "NOT_SUBMITTED"}</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button asChild size="sm">
                  <Link href="/kyb">Go to KYB Verification Submission →</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Creation Form */}
        {(isKybApproved || isProfileLoading) && (
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Listing Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              {generalError && (
                <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-3.5 text-destructive text-sm flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Product Title *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="e.g. Raw Sesame Seeds (Grade A - 50kg Bags)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    disabled={createProductMutation.isPending}
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-destructive">{validationErrors.name}</p>
                  )}
                </div>

                {/* Category & Settlement Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Commodity Category *
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={createProductMutation.isPending}
                    >
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {validationErrors.category && (
                      <p className="text-xs text-destructive">{validationErrors.category}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="currencyCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Settlement Currency *
                    </label>
                    <select
                      id="currencyCode"
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={createProductMutation.isPending}
                    >
                      {CURRENCY_OPTIONS.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.currencyCode && (
                      <p className="text-xs text-destructive">{validationErrors.currencyCode}</p>
                    )}
                  </div>
                </div>

                {/* Unit Price */}
                <div className="space-y-1.5">
                  <label htmlFor="price" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Unit Price ({currencyCode}) *
                  </label>
                  <div className="relative">
                    <input
                      id="price"
                      type="text"
                      required
                      placeholder="e.g. 45000.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={createProductMutation.isPending}
                    />
                  </div>
                  {validationErrors.price ? (
                    <p className="text-xs text-destructive">{validationErrors.price}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Numeric decimal format. Minor units are derived automatically.
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Detailed Specifications & Packaging *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    placeholder="Provide detailed description of crop purity, moisture level, batch packaging, and FOB/CIF origin logistics details…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    disabled={createProductMutation.isPending}
                  />
                  {validationErrors.description && (
                    <p className="text-xs text-destructive">{validationErrors.description}</p>
                  )}
                </div>

                {/* Image URL */}
                <div className="space-y-1.5">
                  <label htmlFor="imageUrl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Product Image URL (Optional)
                  </label>
                  <input
                    id="imageUrl"
                    type="url"
                    placeholder="https://images.unsplash.com/…"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    disabled={createProductMutation.isPending}
                  />
                  {validationErrors.imageUrl && (
                    <p className="text-xs text-destructive">{validationErrors.imageUrl}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/products">Cancel</Link>
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={createProductMutation.isPending}
                    className="gap-2 min-w-[140px]"
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Publishing…</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Publish Listing</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </RequireRole>
  );
}
