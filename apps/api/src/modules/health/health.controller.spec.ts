import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("returns ok with a commit fallback", () => {
    const controller = new HealthController({ get: () => undefined } as any);
    expect(controller.check()).toEqual({ status: "ok", commit: "unknown" });
  });
});
