import { SetMetadata } from "@nestjs/common";

export const DEPRECATED_ENDPOINT_KEY = "deprecated_endpoint";

export interface DeprecatedEndpointOptions {
  /**
   * RFC 1123 or ISO date string indicating when the endpoint will be decommissioned.
   * Example: "Wed, 31 Mar 2027 23:59:59 GMT"
   */
  sunsetDate?: string;
  /**
   * Relative or absolute path to the successor endpoint.
   * Example: "/api/v2/orders"
   */
  successorPath?: string;
}

/**
 * Marks a controller or route handler as deprecated according to IETF standards.
 * The DeprecationInterceptor reads this metadata and attaches standard headers:
 * - Deprecation: true
 * - Sunset: <sunsetDate> (if provided)
 * - Link: <{successorPath}>; rel="successor-version" (if provided)
 */
export const DeprecatedEndpoint = (options: DeprecatedEndpointOptions = {}) =>
  SetMetadata(DEPRECATED_ENDPOINT_KEY, options);
