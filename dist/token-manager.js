import axios from "axios";
let tokenData = null;
const REFRESH_BUFFER_MS = 5 * 60 * 1000;
export async function getAccessToken() {
    const now = Date.now();
    if (tokenData && tokenData.expiresAt - now > REFRESH_BUFFER_MS) {
        return tokenData.accessToken;
    }
    const clientId = process.env.AMAZON_ADS_CLIENT_ID;
    const clientSecret = process.env.AMAZON_ADS_CLIENT_SECRET;
    const refreshToken = process.env.AMAZON_ADS_REFRESH_TOKEN;
    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Missing required env vars: AMAZON_ADS_CLIENT_ID, AMAZON_ADS_CLIENT_SECRET, AMAZON_ADS_REFRESH_TOKEN");
    }
    const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
    });
    const response = await axios.post("https://api.amazon.com/auth/o2/token", params.toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    const { access_token, expires_in } = response.data;
    tokenData = {
        accessToken: access_token,
        expiresAt: now + expires_in * 1000,
    };
    console.error(`[TokenManager] Token refreshed. Expires in ${expires_in}s`);
    return tokenData.accessToken;
}
export function getTokenStatus() {
    if (!tokenData) {
        return { valid: false, expiresAt: null, expiresInSeconds: null, status: "no_token" };
    }
    const now = Date.now();
    const expiresInSeconds = Math.floor((tokenData.expiresAt - now) / 1000);
    const valid = expiresInSeconds > 0;
    return {
        valid,
        expiresAt: tokenData.expiresAt,
        expiresInSeconds,
        status: valid ? (expiresInSeconds < 300 ? "expiring_soon" : "valid") : "expired",
    };
}
export function startAutoRefresh() {
    setInterval(async () => {
        try {
            await getAccessToken();
        }
        catch (err) {
            console.error("[TokenManager] Auto-refresh failed:", err);
        }
    }, 60 * 1000);
}
//# sourceMappingURL=token-manager.js.map