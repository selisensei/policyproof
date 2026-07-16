import http from "node:http";
import https from "node:https";

export type NetworkGuardResult<T> = { value: T; attempts: number };

export async function withNetworkBlocked<T>(work: () => Promise<T>): Promise<NetworkGuardResult<T>> {
  let attempts = 0;
  const originalFetch = globalThis.fetch;
  const originalHttpRequest = http.request;
  const originalHttpGet = http.get;
  const originalHttpsRequest = https.request;
  const originalHttpsGet = https.get;
  const blocked = () => {
    attempts += 1;
    throw new Error("Network access is forbidden during PolicyProof competition evaluation.");
  };

  globalThis.fetch = blocked as typeof fetch;
  http.request = blocked as typeof http.request;
  http.get = blocked as typeof http.get;
  https.request = blocked as typeof https.request;
  https.get = blocked as typeof https.get;

  try {
    return { value: await work(), attempts };
  } finally {
    globalThis.fetch = originalFetch;
    http.request = originalHttpRequest;
    http.get = originalHttpGet;
    https.request = originalHttpsRequest;
    https.get = originalHttpsGet;
  }
}
