import { PaymentProviderType, PaymentStatus } from "@afritrade/shared";
import { MockPaymentProvider } from "./mock.provider";

describe("MockPaymentProvider", () => {
  const provider = new MockPaymentProvider();
  const supportedCurrencies = ["NGN", "ZAR", "GHS", "USD"];

  it.each(supportedCurrencies)(
    "succeeds instantly for supported currency: %s",
    async (currencyCode) => {
      const reference = `MOCK-test-${currencyCode}-${Date.now()}`;
      const result = await provider.initiate({
        reference,
        amount: "5000.00",
        currencyCode,
        buyerEmail: "buyer@test.dev",
        orderId: "123e4567-e89b-12d3-a456-426614174000",
      });

      expect(result).toMatchObject({
        provider: PaymentProviderType.MOCK,
        reference,
        status: PaymentStatus.SUCCESS,
      });
      expect(result.authorizationUrl).toBeNull();

      const verified = await provider.verify({ reference });
      expect(verified).toEqual({
        reference,
        status: PaymentStatus.SUCCESS,
      });
    }
  );
});
