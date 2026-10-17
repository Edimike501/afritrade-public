import {
  BuyerDashboardDtoSchema,
  SupplierDashboardDtoSchema,
  AdminDashboardDtoSchema,
  DashboardSummaryDtoSchema,
  UpdateUserProfileSchema,
  KybStatus,
} from "../index";

describe("Dashboard & User Profile Schemas", () => {
  describe("BuyerDashboardDtoSchema", () => {
    it("validates a compliant buyer dashboard summary", () => {
      const valid = {
        role: "BUYER",
        totalOrders: 12,
        activeOrders: 3,
        deliveredOrders: 9,
        spendByCurrency: [
          { currency: "NGN", total: "150000.00" },
          { currency: "USD", total: "450.00" },
        ],
      };

      const result = BuyerDashboardDtoSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalOrders).toBe(12);
        expect(result.data.spendByCurrency).toHaveLength(2);
      }
    });

    it("rejects negative order counts", () => {
      const invalid = {
        role: "BUYER",
        totalOrders: -1,
        activeOrders: 0,
        deliveredOrders: 0,
        spendByCurrency: [],
      };

      const result = BuyerDashboardDtoSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid currency codes", () => {
      const invalid = {
        role: "BUYER",
        totalOrders: 1,
        activeOrders: 1,
        deliveredOrders: 0,
        spendByCurrency: [{ currency: "NIGERIAN_NAIRA", total: "100" }],
      };

      const result = BuyerDashboardDtoSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("SupplierDashboardDtoSchema", () => {
    it("validates a compliant supplier dashboard summary", () => {
      const valid = {
        role: "SUPPLIER",
        kybStatus: KybStatus.APPROVED,
        activeProducts: 15,
        incomingOrders: 8,
        revenueByCurrency: [{ currency: "ZAR", total: "25000.00" }],
      };

      const result = SupplierDashboardDtoSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.kybStatus).toBe(KybStatus.APPROVED);
        expect(result.data.revenueByCurrency[0].currency).toBe("ZAR");
      }
    });

    it("rejects unknown kybStatus", () => {
      const invalid = {
        role: "SUPPLIER",
        kybStatus: "VERIFIED_GOLD",
        activeProducts: 5,
        incomingOrders: 2,
        revenueByCurrency: [],
      };

      const result = SupplierDashboardDtoSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("AdminDashboardDtoSchema", () => {
    it("validates a compliant admin platform summary", () => {
      const valid = {
        role: "ADMIN",
        usersByRole: { BUYER: 45, SUPPLIER: 18 },
        pendingKyb: 4,
        activeProducts: 120,
        totalOrders: 65,
        ordersByStatus: {
          ORDER_PLACED: 5,
          PAYMENT_CONFIRMED: 10,
          DELIVERED: 50,
        },
        tradeVolumeByCurrency: [
          { currency: "NGN", total: "5200000.00" },
          { currency: "GHS", total: "85000.00" },
        ],
      };

      const result = AdminDashboardDtoSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pendingKyb).toBe(4);
        expect(result.data.tradeVolumeByCurrency).toHaveLength(2);
      }
    });
  });

  describe("DashboardSummaryDtoSchema (Discriminated Union)", () => {
    it("discriminates union correctly based on role", () => {
      const buyerData = {
        role: "BUYER",
        totalOrders: 2,
        activeOrders: 1,
        deliveredOrders: 1,
        spendByCurrency: [],
      };
      const parsed = DashboardSummaryDtoSchema.safeParse(buyerData);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.role).toBe("BUYER");
      }
    });
  });

  describe("UpdateUserProfileSchema", () => {
    it("accepts valid profile update inputs", () => {
      const valid = {
        fullName: "Amara Diallo",
        preferredCurrency: "GHS",
      };
      const result = UpdateUserProfileSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects too short fullName", () => {
      const invalid = {
        fullName: "A",
      };
      const result = UpdateUserProfileSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects unsupported currency", () => {
      const invalid = {
        preferredCurrency: "EUR",
      };
      const result = UpdateUserProfileSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
