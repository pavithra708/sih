// app/utils/hashUtils.ts
import SHA256 from "crypto-js/sha256";

/**
 * Frontend-safe SHA256 hashing
 * @param data - any JS object
 * @returns SHA256 hash string
 */
export function hashDataSHA256(data: any): string {
  return SHA256(JSON.stringify(data)).toString();
}
