import { canTransition, ORDER_STATUS_TRANSITIONS, OrderStatus } from "./enums";
import { calculateIndicativeEquivalent, formatMoney, multiplyMoney } from "./money";

describe("order lifecycle", () => {
  it("allows the happy path in order", () => {
    expect(canTransition(OrderStatus.PAYMENT_CONFIRMED, OrderStatus.LOGISTICS_ASSIGNED)).toBe(true);
    expect(canTransition(OrderStatus.LOGISTICS_ASSIGNED, OrderStatus.PICKED_UP)).toBe(true);
    expect(canTransition(OrderStatus.CUSTOMS, OrderStatus.DELIVERED)).toBe(true);
  });
  it("blocks skipping steps and leaving terminal states", () => {
    expect(canTransition(OrderStatus.PAYMENT_CONFIRMED, OrderStatus.DELIVERED)).toBe(false);
    expect(ORDER_STATUS_TRANSITIONS[OrderStatus.DELIVERED]).toHaveLength(0);
    expect(ORDER_STATUS_TRANSITIONS[OrderStatus.CANCELLED]).toHaveLength(0);
  });
});

describe("money", () => {
  it("multiplies without float drift", () => {
    expect(multiplyMoney("19.99", 3)).toBe("59.97");
  });
  it("formats with the given currency", () => {
    expect(formatMoney("1500", "NGN")).toContain("1,500.00");
  });
  it("calculates indicative equivalent across currencies correctly", () => {
    const rates = { NGN: 1500, ZAR: 18, GHS: 15, USD: 1 };
    // 15 GHS (1500 minor) to USD (1 USD = 100 minor)
    const toUsd = calculateIndicativeEquivalent(1500, "GHS", "USD", rates);
    expect(toUsd).not.toBeNull();
    expect(toUsd?.amountMinor).toBe(100);

    // 15 GHS (1500 minor) to NGN (1500 NGN = 150000 minor)
    const toNgn = calculateIndicativeEquivalent(1500, "GHS", "NGN", rates);
    expect(toNgn).not.toBeNull();
    expect(toNgn?.amountMinor).toBe(150000);

    // Same currency returns null (no duplicate display)
    const same = calculateIndicativeEquivalent(1500, "GHS", "GHS", rates);
    expect(same).toBeNull();
  });
});
