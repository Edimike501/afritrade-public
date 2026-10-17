import { ZodError, KybDocumentType } from "@afritrade/shared";
import { registerUser, loginUser } from "./auth.api";
import { createOrder, cancelOrder } from "./orders.api";
import { initiatePayment } from "./payments.api";
import { createProduct, updateProduct } from "./catalog.api";
import {
  submitBusinessProfile,
  updateKybSubmission,
  updateBusinessDetails,
  uploadKybDocument,
} from "./kyb.api";
import { updateUserPreferences, updateUserProfile } from "./user.api";
import type { ApiClient } from "../client";

const mockClient: ApiClient = {
  getToken: () => null,
  setToken: () => {},
  refreshSession: async () => null,
  request: async () => ({ data: {} as any }),
  get: async () => ({ data: {} as any }),
  post: async () => ({ data: {} as any }),
  put: async () => ({ data: {} as any }),
  patch: async () => ({ data: {} as any }),
  delete: async () => ({ data: {} as any }),
};

describe("Client-side Mutating Payload Validation", () => {
  it("rejects invalid registration payload before network request", async () => {
    await expect(
      registerUser(
        {
          email: "invalid-email",
          password: "short",
          fullName: "",
          role: "BUYER" as any,
          countryCode: "NIGERIA", // Must be 2 chars
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid login payload before network request", async () => {
    await expect(
      loginUser(
        {
          email: "notanemail",
          password: "",
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid order creation payload before network request", async () => {
    await expect(
      createOrder(
        {
          items: [], // Must have at least 1 item
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid order cancellation payload before network request", async () => {
    await expect(
      cancelOrder(
        "123e4567-e89b-12d3-a456-426614174000",
        {
          reason: "no", // Must be at least 3 characters
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);

    await expect(
      cancelOrder(
        "123e4567-e89b-12d3-a456-426614174000",
        {
          reason: "   ", // Trimmed is empty
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid payment initiation payload before network request", async () => {
    await expect(
      initiatePayment(
        {
          orderId: "invalid-uuid",
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid product creation payload before network request", async () => {
    await expect(
      createProduct(
        {
          name: "",
          description: "",
          category: "",
          price: "not-a-number",
          currencyCode: "NG", // Must be 3 chars
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid product update payload before network request", async () => {
    await expect(
      updateProduct(
        "123e4567-e89b-12d3-a456-426614174000",
        {
          name: "A", // Min length 2
          price: "invalid-price",
          currencyCode: "NG", // Must be 3 chars
          imageUrl: "not-a-valid-url",
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid KYB submission and update payloads before network request", async () => {
    await expect(
      submitBusinessProfile(
        {
          businessName: "A", // Min length 2
          countryCode: "NG",
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);

    await expect(
      updateKybSubmission(
        {
          businessName: "A", // Min length 2
          countryCode: "INVALID",
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid operational business details payload before network request", async () => {
    await expect(
      updateBusinessDetails(
        {
          businessEmail: "not-an-email",
          website: "not-a-url",
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid KYB document upload payload before network request", async () => {
    await expect(
      uploadKybDocument(
        {
          documentType: KybDocumentType.CERTIFICATE_OF_INCORPORATION,
          fileName: "malware.exe",
          mimeType: "application/x-msdownload" as any,
          fileSizeBytes: 50 * 1024 * 1024, // Exceeds 10MB
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid user preferences payload before network request", async () => {
    await expect(
      updateUserPreferences(
        {
          preferredCurrency: "INVALID" as any,
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });

  it("rejects invalid user profile payload before network request", async () => {
    await expect(
      updateUserProfile(
        {
          fullName: "A", // Min length 2
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);

    await expect(
      updateUserProfile(
        {
          preferredCurrency: "INVALID" as any,
        },
        mockClient,
      ),
    ).rejects.toThrow(ZodError);
  });
});
