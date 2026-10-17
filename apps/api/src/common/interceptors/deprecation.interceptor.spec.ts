import { ExecutionContext, CallHandler } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { of } from "rxjs";
import { DeprecationInterceptor } from "./deprecation.interceptor";
import { DEPRECATED_ENDPOINT_KEY } from "../decorators/deprecated-endpoint.decorator";

describe("DeprecationInterceptor", () => {
  let interceptor: DeprecationInterceptor;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new DeprecationInterceptor(reflector);
  });

  function createMockContext(resMock: any) {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(resMock),
        getRequest: jest.fn().mockReturnValue({ method: "GET", url: "/api/v1/orders" }),
      }),
    } as unknown as ExecutionContext;
  }

  it("sets IETF deprecation headers when endpoint is deprecated", (done) => {
    const headers: Record<string, string> = {};
    const resMock = {
      setHeader: jest.fn((key: string, value: string) => {
        headers[key] = value;
      }),
    };

    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue({
      sunsetDate: "Wed, 31 Mar 2027 23:59:59 GMT",
      successorPath: "/api/v2/orders",
    });

    const context = createMockContext(resMock);
    const next: CallHandler = { handle: () => of({ ok: true }) };

    interceptor.intercept(context, next).subscribe({
      next: (val) => {
        expect(val).toEqual({ ok: true });
        expect(headers["Deprecation"]).toBe("true");
        expect(headers["Sunset"]).toBe("Wed, 31 Mar 2027 23:59:59 GMT");
        expect(headers["Link"]).toBe('</api/v2/orders>; rel="successor-version"');
        done();
      },
      error: done.fail,
    });
  });

  it("does not set deprecation headers when endpoint is not deprecated", (done) => {
    const resMock = {
      setHeader: jest.fn(),
    };

    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);

    const context = createMockContext(resMock);
    const next: CallHandler = { handle: () => of({ ok: true }) };

    interceptor.intercept(context, next).subscribe({
      next: (val) => {
        expect(val).toEqual({ ok: true });
        expect(resMock.setHeader).not.toHaveBeenCalled();
        done();
      },
      error: done.fail,
    });
  });
});
