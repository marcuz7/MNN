import { URL } from "url";
import dns from "dns";
import util from "util";

const lookupAsync = util.promisify(dns.lookup);

/**
 * Checks if an IP address falls into private, loopback, link-local, or cloud metadata ranges.
 */
export function isPrivateIp(ip: string): boolean {
  // IPv4 Loopback
  if (/^127\./.test(ip)) return true;
  // IPv4 Private Class A
  if (/^10\./.test(ip)) return true;
  // IPv4 Private Class B
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  // IPv4 Private Class C
  if (/^192\.168\./.test(ip)) return true;
  // IPv4 Link-local & Cloud Metadata (169.254.169.254)
  if (/^169\.254\./.test(ip)) return true;
  // IPv4 Current network / broadcast
  if (/^0\./.test(ip) || ip === "255.255.255.255") return true;

  // IPv6 Loopback & unspecified
  if (ip === "::1" || ip === "::") return true;
  // IPv6 Unique Local Address (fc00::/7)
  if (/^f[cd][0-9a-f]{2}:/i.test(ip)) return true;
  // IPv6 Link-Local Unicast (fe80::/10)
  if (/^fe80:/i.test(ip)) return true;

  return false;
}

/**
 * Validates a target URL against SSRF attacks.
 * Throws an Error if the URL is prohibited.
 */
export async function validateSafeUrl(targetUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    throw new Error("Invalid URL format");
  }

  // Only permit HTTP and HTTPS
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Forbidden protocol: ${parsed.protocol}. Only http and https are allowed.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and internal names
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "metadata.google.internal" ||
    hostname === "metadata"
  ) {
    throw new Error(`Forbidden host: ${hostname} is an internal or reserved domain.`);
  }

  // If host is an IP directly
  if (isPrivateIp(hostname)) {
    throw new Error(`Forbidden IP: ${hostname} is in a private/restricted address range.`);
  }

  // Resolve DNS to verify actual destination IP
  try {
    const { address } = await lookupAsync(hostname);
    if (isPrivateIp(address)) {
      throw new Error(`Forbidden destination: ${hostname} resolved to restricted IP ${address}.`);
    }
  } catch (err: any) {
    if (err.message && err.message.includes("Forbidden")) {
      throw err;
    }
    // If DNS resolution fails, reject to fail-closed
    throw new Error(`DNS resolution failed for host ${hostname}: ${err.message}`);
  }

  return parsed;
}
