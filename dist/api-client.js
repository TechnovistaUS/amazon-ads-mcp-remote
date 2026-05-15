import axios from "axios";
import { getAccessToken } from "./token-manager.js";
const API_BASE = "https://advertising-api.amazon.com";
export async function adsRequest(method, path, profileId, data, params) {
    const accessToken = await getAccessToken();
    const config = {
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
        return response.data;
    }
    catch (err) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status ?? "unknown";
            const body = JSON.stringify(err.response?.data ?? {});
            throw new Error(`Amazon Ads API error ${status}: ${body}`);
        }
        throw err;
    }
}
export function okText(data) {
    return JSON.stringify(data, null, 2);
}
//# sourceMappingURL=api-client.js.map