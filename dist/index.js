import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAllTools } from "./tools.js";
import { getTokenStatus, startAutoRefresh, getAccessToken } from "./token-manager.js";
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
function createMcpServer() {
    const server = new McpServer({
        name: "amazon-ads-mcp-server",
        version: "2.0.0",
    });
    registerAllTools(server);
    return server;
}
app.get("/health", (_req, res) => {
    const token = getTokenStatus();
    res.json({
        status: "ok",
        version: "2.0.0",
        tools: 18,
        tokenStatus: token.status,
        tokenExpiresAt: token.expiresAt,
        tokenExpiresInSeconds: token.expiresInSeconds,
        timestamp: new Date().toISOString(),
    });
});
app.get("/token-status", (_req, res) => {
    const token = getTokenStatus();
    res.json(token);
});
app.get("/info", (_req, res) => {
    res.json({
        name: "Amazon Ads MCP Server",
        version: "2.0.0",
        tools: 18,
        endpoints: ["/health", "/token-status", "/info", "/mcp"],
    });
});
app.get("/", (_req, res) => {
    res.json({ message: "Amazon Ads MCP Server v2.0 — POST /mcp for MCP protocol" });
});
app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });
    res.on("close", () => {
        transport.close().catch(() => { });
    });
    try {
        const server = createMcpServer();
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    }
    catch (err) {
        console.error("[MCP] Request error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
const PORT = parseInt(process.env.PORT ?? "3000", 10);
app.listen(PORT, async () => {
    console.error(`[Server] Amazon Ads MCP v2.0 running on port ${PORT}`);
    console.error(`[Server] Health: http://localhost:${PORT}/health`);
    console.error(`[Server] MCP:    http://localhost:${PORT}/mcp`);
    try {
        await getAccessToken();
        console.error("[Server] OAuth token obtained successfully");
    }
    catch (err) {
        console.error("[Server] Warning — could not obtain token on startup:", err);
    }
    startAutoRefresh();
    console.error("[Server] Token auto-refresh started (every 60s)");
});
//# sourceMappingURL=index.js.map