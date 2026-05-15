import axios, { type AxiosRequestConfig } from "axios";
import { getAccessToken } from "./token-manager.js";

const API_BASE = "https://advertising-api.amazon.com";

export async function adsRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  profileId: string,
  data?: unknown,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const accessToken = await getAccessToken();

  const config: AxiosRequestConfig = {
    method,
    url: `${API_BASE}${path}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Amazon-Advertising-API-ClientId": process.env.AMAZON_ADS_CLIENT_ID ?? "",
      "Amazon-Advertising-API-Scope": profileId,
      "Content-Type": "application/json",
    },
    params,
    data,
  };

  try {
    const response = await axios(config);
    return response.data as T;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? "unknown";
      const body = JSON.stringify(err.response?.data ?? {});
      throw new Error(`Amazon Ads API error ${status}: ${body}`);
    }
    throw err;
  }
}

export function okText(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
