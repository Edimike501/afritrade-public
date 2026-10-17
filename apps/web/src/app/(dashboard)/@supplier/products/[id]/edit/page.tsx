"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  Role,
  UpdateProductSchema,
  PRODUCT_CATEGORIES,
  type UpdateProductInput,
} from "@afritrade/shared";
import {
  useProduct,
  useUpdateProduct,
  useMyBusinessProfile,
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
} from "@afritrade/ui";
import { ProductImage } from "@/components/ProductImage";

const CURRENCY_OPTIONS = [
  { code: "NGN", name: "Nigerian Naira (₦)" },
  { code: "ZAR", name: "South African Rand (R)" },
  { code: "GHS", name: "Ghanaian Cedi (GH₵)" },
  { code: "USD", name: "US Dollar ($)" },
];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: product, isLoading, error } = useProduct(id);
  const { data: profile } = useMyBusinessProfile();
  const updateProductMutation = useUpdateProduct();

  const [initializedId, setInitializedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [currencyCode, setCurrencyCode] = useState("NGN");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (product && initializedId !== product.id) {
      setName(product.name);
      setCategory(product.category || PRODUCT_CATEGORIES[0]);
      setPrice(String(product.price));
      setCurrencyCode(
        (product.currencyCode || product.currency?.code || "NGN").toUpperCase(),
      );
      setDescription(product.description);
      setImageUrl(product.imageUrl ?? "");
      setIsActive(product.isActive);
      setInitializedId(product.id);
    }
  }, [product, initializedId]);

  const categoryOptions = useMemo(() => {
    if (category && !PRODUCT_CATEGORIES.includes(category as any)) {
      return [category, ...PRODUCT_CATEGORIES];
    }
    return [...PRODUCT_CATEGORIES];
  }, [category]);

  const isUnauthorizedOwner = Boolean(
    profile &&
      product?.businessProfile?.id &&
      product.businessProfile.id !== profile.id,
  );

  function clearFieldError(field: string) {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validateFieldOnBlur(field: keyof UpdateProductInput, value: unknown) {
    const partialPayload: Record<string, unknown> = { [field]: value };
    const result = UpdateProductSchema.safeParse(partialPayload);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      if (issue) {
        setValidationErrors((prev) => ({ ...prev, [field]: issue.message }));
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!product) return;

    setValidationErrors({});
    setGeneralError(null);

    const trimmedImageUrl = imageUrl.trim();
    const payload: UpdateProductInput = {
      name: name.trim(),
      category: category.trim(),
      price: price.trim(),
      currencyCode: currencyCode.toUpperCase(),
      description: description.trim(),
      imageUrl: trimmedImageUrl ? trimmedImageUrl : null,
      isActive,
    };

    // Strict client-side validation per Rules §10b / §20
    const parseResult = UpdateProductSchema.safeParse(payload);
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
      await updateProductMutation.mutateAsync({
        id: product.id,
        input: parseResult.data,
      });
      router.push(`/products/${product.id}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
      } else if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An error occurred while saving your product changes.");
      }
    }
  }

  return (
    <RequireRole roles={[Role.SUPPLIER]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 font-medium hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>My Products</span>
          </Link>
          {product && (
            <>
              <span>/</span>
              <Link
                href={`/products/${product.id}`}
                className="hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {product.name}
              </Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Edit</span>
            </>
          )}
        </nav>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[360px] gap-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm">Loading product details for editing…</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!isLoading && (error || !product) && (
          <Card className="p-8 border border-destructive/30 bg-destructive/10 text-destructive text-center">
            <AlertCircle size={36} className="mx-auto mb-3" />
            <h2 className="text-lg font-bold">Product Listing Not Found</h2>
            <p className="text-xs mt-1 mb-5">
              {error instanceof Error
                ? error.message
                : "The requested product listing could not be loaded."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/products">Back to My Products</Link>
            </Button>
          </Card>
        )}

        {/* Unauthorized Owner Guard */}
        {!isLoading && product && isUnauthorizedOwner && (
          <Card className="p-8 border border-destructive/30 bg-destructive/10 text-destructive text-center">
            <AlertCircle size={36} className="mx-auto mb-3" />
            <h2 className="text-lg font-bold">Unauthorized Access</h2>
            <p className="text-xs mt-1 mb-5">
              You can only edit product listings owned by your supplier business profile.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/products">Back to My Products</Link>
            </Button>
          </Card>
        )}

        {/* Edit Product Form */}
        {!isLoading && product && !isUnauthorizedOwner && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Edit Product Listing
                  </h1>
                  <span className="font-mono text-xs text-muted-foreground">
                    #{product.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Update commodity specifications, wholesale pricing, or marketplace visibility.
                </p>
              </div>

              {/* Quick Status Pill */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                {isActive ? (
                  <Badge variant="success" className="text-xs flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Active on Marketplace</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <XCircle size={13} />
                    <span>Inactive (Hidden)</span>
                  </Badge>
                )}
              </div>
            </div>

            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-4 border-b border-border/60">
                <CardTitle className="text-lg font-bold">
                  Listing Specifications
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                {generalError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-3.5 text-destructive text-sm flex items-start gap-2.5"
                  >
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{generalError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="edit-product-name"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
                    >
                      Product Title *
                    </label>
                    <input
                      id="edit-product-name"
                      name="name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={160}
                      placeholder="e.g. Raw Sesame Seeds (Grade A - 50kg Bags)"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearFieldError("name");
                      }}
                      onBlur={(e) => validateFieldOnBlur("name", e.target.value.trim())}
                      aria-describedby={
                        validationErrors.name ? "edit-product-name-error" : undefined
                      }
                      aria-invalid={Boolean(validationErrors.name)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={updateProductMutation.isPending}
                    />
                    {validationErrors.name && (
                      <p
                        id="edit-product-name-error"
                        role="alert"
                        className="text-xs text-destructive"
                      >
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Category & Settlement Currency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="edit-product-category"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
                      >
                        Commodity Category *
                      </label>
                      <select
                        id="edit-product-category"
                        name="category"
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          clearFieldError("category");
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        disabled={updateProductMutation.isPending}
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {validationErrors.category && (
                        <p role="alert" className="text-xs text-destructive">
                          {validationErrors.category}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="edit-product-currency"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
                      >
                        Settlement Currency *
                      </label>
                      <select
                        id="edit-product-currency"
                        name="currencyCode"
                        value={currencyCode}
                        onChange={(e) => {
                          setCurrencyCode(e.target.value);
                          clearFieldError("currencyCode");
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        disabled={updateProductMutation.isPending}
                      >
                        {CURRENCY_OPTIONS.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.currencyCode && (
                        <p role="alert" className="text-xs text-destructive">
                          {validationErrors.currencyCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="edit-product-price"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
                    >
                      Unit Price ({currencyCode}) *
                    </label>
                    <input
                      id="edit-product-price"
                      name="price"
                      type="text"
                      inputMode="decimal"
                      required
                      placeholder="e.g. 45000.00"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        clearFieldError("price");
                      }}
                      onBlur={(e) => validateFieldOnBlur("price", e.target.value.trim())}
                      aria-describedby={
                        validationErrors.price
                          ? "edit-product-price-error"
                          : "edit-product-price-hint"
                      }
                      aria-invalid={Boolean(validationErrors.price)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={updateProductMutation.isPending}
                    />
                    {validationErrors.price ? (
                      <p
                        id="edit-product-price-error"
                        role="alert"
                        className="text-xs text-destructive"
                      >
                        {validationErrors.price}
                      </p>
                    ) : (
                      <p id="edit-product-price-hint" className="text-xs text-muted-foreground">
                        Numeric decimal format (up to 2 decimal places).
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="edit-product-description"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
                    >
                      Detailed Specifications &amp; Packaging *
                    </label>
                    <textarea
                      id="edit-product-description"
                      name="description"
                      required
                      rows={5}
                      minLength={2}
                      maxLength={2000}
                      placeholder="Provide detailed description of crop purity, moisture level, batch packaging, and FOB/CIF origin logistics details…"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        clearFieldError("description");
                      }}
                      onBlur={(e) =>
                        validateFieldOnBlur("description", e.target.value.trim())
                      }
                      aria-describedby={
                        validationErrors.description
                          ? "edit-product-description-error"
                          : undefined
                      }
                      aria-invalid={Boolean(validationErrors.description)}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      disabled={updateProductMutation.isPending}
                    />
                    {validationErrors.description && (
                      <p
                        id="edit-product-description-error"
                        role="alert"
                        className="text-xs text-destructive"
                      >
                        {validationErrors.description}
                      </p>
                    )}
                  </div>

                  {/* Image URL & Preview */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="edit-product-image-url"
                          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
                        >
                          Product Image URL (Optional)
                        </label>
                        {imageUrl.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl("");
                              clearFieldError("imageUrl");
                            }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                          >
                            <Trash2 size={12} />
                            <span>Remove Image</span>
                          </button>
                        )}
                      </div>
                      <input
                        id="edit-product-image-url"
                        name="imageUrl"
                        type="url"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        placeholder="https://images.unsplash.com/…"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          clearFieldError("imageUrl");
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.trim();
                          validateFieldOnBlur("imageUrl", val ? val : null);
                        }}
                        aria-describedby={
                          validationErrors.imageUrl
                            ? "edit-product-image-error"
                            : undefined
                        }
                        aria-invalid={Boolean(validationErrors.imageUrl)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        disabled={updateProductMutation.isPending}
                      />
                      {validationErrors.imageUrl && (
                        <p
                          id="edit-product-image-error"
                          role="alert"
                          className="text-xs text-destructive"
                        >
                          {validationErrors.imageUrl}
                        </p>
                      )}
                    </div>

                    {/* Live Thumbnail Preview */}
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/20">
                      <div className="w-20 h-20 rounded-md overflow-hidden border border-border bg-muted shrink-0 relative">
                        <ProductImage
                          key={imageUrl.trim() || "placeholder"}
                          src={imageUrl.trim() || null}
                          alt={name || "Product preview"}
                          size="sm"
                          className="!mb-0 !h-full !w-full !rounded-none"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p className="font-semibold text-foreground">
                          Catalog Image Preview
                        </p>
                        <p>
                          {imageUrl.trim()
                            ? "Custom image URL configured. Falls back to placeholder if unreachable."
                            : "No custom image URL provided. Standard commodity placeholder will be shown."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Marketplace Visibility Toggle */}
                  <div className="p-4 rounded-lg border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <label
                        htmlFor="edit-product-active"
                        className="text-sm font-bold text-foreground block cursor-pointer"
                      >
                        Marketplace Visibility
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {isActive
                          ? "This product is visible on the public marketplace and available for buyer orders."
                          : "This product is hidden from the public marketplace and cannot be ordered."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        id="edit-product-active"
                        name="isActive"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        disabled={updateProductMutation.isPending}
                        className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                      />
                      <label
                        htmlFor="edit-product-active"
                        className="text-xs font-semibold text-foreground cursor-pointer select-none"
                      >
                        {isActive ? "Active" : "Inactive"}
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/products/${product.id}`}>Cancel</Link>
                    </Button>

                    <div className="flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsActive((prev) => !prev)}
                        disabled={updateProductMutation.isPending}
                      >
                        {isActive ? "Mark as Inactive" : "Mark as Active"}
                      </Button>

                      <Button
                        type="submit"
                        size="sm"
                        disabled={updateProductMutation.isPending}
                        className="gap-2 min-w-[140px]"
                      >
                        {updateProductMutation.isPending ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Saving…</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </RequireRole>
  );
}
