import { getS3CommonJson } from "utils/aws-s3";
import { serverConfig } from "config";

const IP_WHITELIST_S3_KEY = "ip-white-list.json";
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface IpWhitelist {
  countries: string[];
  ips: string[];
}

const ALLOW_ALL: IpWhitelist = { countries: [], ips: [] };

let cache: { data: IpWhitelist; expiresAt: number } | null = null;

export async function getIpWhitelist(): Promise<IpWhitelist> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data;
  }
  try {
    const data = await getS3CommonJson<IpWhitelist>(`${serverConfig.env}/${IP_WHITELIST_S3_KEY}`);
    cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  } catch (err) {
    console.error("[ipWhitelist] Failed to read from S3, failing open:", err);
    // Return stale cache if available, otherwise allow all
    return cache?.data ?? ALLOW_ALL;
  }
}
