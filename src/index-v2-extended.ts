#!/usr/bin/env node

import express from "express";
import axios from "axios";
import { createServer as createHttpsServer } from "https";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string = process.env.AMAZON_REFRESH_TOKEN || "";
  private expiresAt: number = 0;
  private clientId = process.env.AMAZON_CLIENT_ID || "";
  private clientSecret = process.env.AMAZON_CLIENT_SECRET || "";

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt - 5 * 60 * 1000) {
      return this.accessToken;
    }
    return this.refreshAccessToken();
  }

  private async refreshAccessToken(): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", this.refreshToken);
      params.append("client_id", this.clientId);
      params.append("client_secret", this.clientSecret);

      const response = await axios.post<TokenData>(
        "https://api.amazon.com/auth/o2/token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.expiresAt = Date.now() + response.data.expires_in * 1000;
      process.env.AMAZON_REFRESH_TOKEN = response.data.refresh_token;

      return this.accessToken;
    } catch (error) {
      throw new Error("Token refresh failed");
    }
  }

  setToken(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = Date.now() + expiresIn * 1000;
    process.env.AMAZON_REFRESH_TOKEN = refreshToken;
  }

  getExpiresIn(): number {
    return Math.max(0, this.expiresAt - Date.now());
  }
}

async function main() {
  const app = express();
  const port = parseInt(process.env.MCP_SERVER_PORT || "3000", 10);
  const publicUrl = process.env.PUBLIC_URL || `https://localhost:${port}`;
  const tokenManager = new TokenManager();

  app.use(express.json());

  app.get("/auth", (_req, res) => {
    const clientId = process.env.AMAZON_CLIENT_ID || "";
    const redirectUri = publicUrl + "/callback";
    const scope = encodeURIComponent(
      "profile:contact advertising::campaign_management"
    );

    const authUrl =
      `https://www.amazon.com/ap/oa?` +
      `client_id=${clientId}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;

    console.log(`Redirecting to: ${authUrl}`);
    res.redirect(authUrl);
  });

  app.get("/callback", async (req, res) => {
    const { code } = req.query;

    console.log(`Received auth code: ${code}`);

    if (!code) {
      res.status(400).json({ error: "No auth code" });
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("grant_type", "authorization_code");
      params.append("code", code as string);
      params.append("client_id", process.env.AMAZON_CLIENT_ID || "");
      params.append("client_secret", process.env.AMAZON_CLIENT_SECRET || "");
      params.append("redirect_uri", publicUrl + "/callback");

      const response = await axios.post<TokenData>(
        "https://api.amazon.com/auth/o2/token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(`Token received successfully`);

      tokenManager.setToken(
        response.data.access_token,
        response.data.refresh_token,
        response.data.expires_in
      );

      res.json({ 
        success: true, 
        message: "✅ Token saved successfully!", 
        refreshToken: response.data.refresh_token 
      });
    } catch (error: any) {
      console.error(`Token exchange failed:`, error.response?.data || error.message);
      res.status(500).json({ 
        error: "Token exchange failed",
        details: error.response?.data?.error_description || error.message
      });
    }
  });

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      tokenExpiresIn: Math.round(tokenManager.getExpiresIn() / 1000),
    });
  });

  app.get("/token-status", (_req, res) => {
    const expiresIn = tokenManager.getExpiresIn();
    res.json({
      expiresIn: Math.round(expiresIn / 1000),
      status: expiresIn > 0 ? "valid" : "expired",
    });
  });

  app.get("/info", (_req, res) => {
    res.json({
      name: "Amazon Ads MCP Remote Server",
      version: "2.0.0",
      port,
      url: publicUrl,
    });
  });

  const cert = fs.readFileSync("localhost-cert.pem");
  const key = fs.readFileSync("localhost-key.pem");
  const server = createHttpsServer({ cert, key }, app);

  server.listen(port, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   ✅ Amazon Ads MCP v2.0 Running ✅       ║
║          (HTTPS - Claude Desktop Ready)    ║
╚════════════════════════════════════════════╝

🔗 URL: ${publicUrl}
🔑 Auth: ${publicUrl}/auth
💚 Health: ${publicUrl}/health

Visit ${publicUrl}/auth to authorize!
    `);
  });

  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    server.close(() => {
      console.log("✅ Stopped");
      process.exit(0);
    });
  });
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
