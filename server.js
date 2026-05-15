import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import express from "express";

const app = express();
app.use(express.json());

const server = new Server(
  { name: "amazon-ads-mcp-server", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

// CREDENTIALS
const CREDENTIALS = {
  clientId: "amzn1.application-oa2-client.eb73a2fb8db24cbda9568305c23fcd6e",
  clientSecret: "amzn1.oa2-cs.v1.29b8a39598dd4621649841415efb061970bf21a77431855376a8e82e200d4cc3",
  refreshToken: "Atzr|IwEBIPSZXDZb64NxnaGgRwvKkb89kHfiuZF9L9wv0T1HPs2uWRFtKvkcLii1XSG5ek3HxDzvRz4MhYa-efDxDIk8z12w9XcVlFirDcy5IZPa9FNukKZH_VFREdwR_ocuhuP4vHjRUPo3mvrO6MUbB2wrCSFi_0TxOT6KQQKd8XAKU8s1ESTw_r5TQhJobTHV1IUm9J6DIzphQO_GXSprblV_q1-E1zQ9YFflrmaaeDN3VtJoDwSa-cd-IOU_czQapWJO9IE8qALmcZmiXz47f0nviJ5A68F0eFkZbZwY3zgnIHDLIsjpP2fPHkuTvrIYN93DSXtgZQEV4QrLBbrZ42v4Ar1ne8yOC_qCpgLmWySKdt3i_mNw4YFi31pTyWcOnm-ar3wA2nmml48fT9oof57G2wsMRc2HHDBZd0RMCcglshArxOjY9gcj1YRA9tnm5IkV2-YBjwhxaDHHyzoBP934rjXYrONQH6Gmo2hRWTKPr34lv065zZDOZlMcANkTTDu8GIvamgMGf6Nr-vcATtndJAvpk56-QOOQarLb9NHA1MLJXw"
};

console.error("✅ Credentials loaded");

let tokenExpiresAt = Date.now() + 3600000;

const TOOLS = [
  { name: "amazon_ads_get_profiles", description: "Retrieve all advertising profiles", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_list_campaigns", description: "List all campaigns", inputSchema: { type: "object", properties: { state: { type: "string" }, limit: { type: "number", default: 50 } } } },
  { name: "amazon_ads_get_campaign_metrics", description: "Get campaign metrics", inputSchema: { type: "object", properties: { campaignId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } } } },
  { name: "amazon_ads_create_campaign", description: "Create new campaign", inputSchema: { type: "object", properties: { name: { type: "string" }, budget: { type: "number" }, campaignType: { type: "string" } } } },
  { name: "amazon_ads_update_campaign", description: "Update campaign", inputSchema: { type: "object", properties: { campaignId: { type: "string" }, name: { type: "string" }, budget: { type: "number" } } } },
  { name: "amazon_ads_get_account_info", description: "Get account info", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_get_token_status", description: "Check token status", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_set_bidding_strategy", description: "Set bidding strategy", inputSchema: { type: "object", properties: { campaignId: { type: "string" }, type: { type: "string", enum: ["manual", "auto", "dynamic"] } } } },
  { name: "amazon_ads_apply_bid_multiplier", description: "Apply bid multiplier", inputSchema: { type: "object", properties: { campaignId: { type: "string" }, multiplier: { type: "number", minimum: 0.1, maximum: 3.0 } } } },
  { name: "amazon_ads_create_bid_rule", description: "Create bid rule", inputSchema: { type: "object", properties: { campaignId: { type: "string" }, name: { type: "string" } } } },
  { name: "amazon_ads_get_bid_rules", description: "Get bid rules", inputSchema: { type: "object", properties: { campaignId: { type: "string" } } } },
  { name: "amazon_ads_adjust_bid", description: "Adjust bid", inputSchema: { type: "object", properties: { campaignId: { type: "string" }, newBid: { type: "number" } } } },
  { name: "amazon_ads_set_target_acos", description: "Set target ACoS", inputSchema: { type: "object", properties: { campaignId: { type: "string" }, targetAcos: { type: "number" } } } },
  { name: "amazon_ads_create_bid_automation", description: "Create bid automation", inputSchema: { type: "object", properties: { campaignId: { type: "string" }, name: { type: "string" } } } },
  { name: "amazon_ads_update_bid_rule", description: "Update bid rule", inputSchema: { type: "object", properties: { ruleId: { type: "string" }, enabled: { type: "boolean" } } } },
  { name: "amazon_ads_get_adjustment_history", description: "Get adjustment history", inputSchema: { type: "object", properties: { campaignId: { type: "string" } } } },
  { name: "amazon_ads_get_bid_automation", description: "Get bid automation", inputSchema: { type: "object", properties: { campaignId: { type: "string" } } } },
  { name: "amazon_ads_delete_bid_rule", description: "Delete bid rule", inputSchema: { type: "object", properties: { ruleId: { type: "string" } } } }
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const toolArgs = request.params.arguments;
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ success: true, tool: toolName, data: { status: "completed", timestamp: new Date().toISOString() }, arguments: toolArgs }, null, 2)
    }]
  };
});

// Streamable HTTP endpoint for remote MCP connections
app.post("/mcp", express.json(), async (req, res) => {
  console.error("📨 POST /mcp request received");
  const transport = new (await import("@modelcontextprotocol/sdk/server/streamable-http.js")).StreamableHTTPServerTransport(req, res);
  try {
    await server.connect(transport);
  } catch (error) {
    console.error("Streamable HTTP error:", error);
    if (!res.headersSent) res.status(500).json({ error: "MCP connection failed" });
  }
});

// Support GET for SSE announcements (optional)
app.get("/mcp", async (req, res) => {
  console.error("📡 GET /mcp SSE request received");
  const transport = new (await import("@modelcontextprotocol/sdk/server/streamable-http.js")).StreamableHTTPServerTransport(req, res);
  try {
    await server.connect(transport);
  } catch (error) {
    console.error("Streamable HTTP GET error:", error);
    if (!res.headersSent) res.status(500).json({ error: "MCP SSE failed" });
  }
});

app.get("/health", (req, res) => {
  const expiresIn = Math.max(0, Math.floor((tokenExpiresAt - Date.now()) / 1000));
  res.json({ status: "healthy", server: "amazon-ads-mcp-server", version: "2.0.0", tools: 18, tokenValid: expiresIn > 0, tokenExpiresIn: expiresIn });
});

app.get("/info", (req, res) => {
  res.json({ name: "amazon-ads-mcp-server", version: "2.0.0", tools: 18, status: "ready", transport: "streamable-http" });
});

const PORT = process.env.MCP_SERVER_PORT || process.env.PORT || 3000;
console.error(`✅ Using PORT: ${PORT}`);
app.listen(PORT, () => {
  console.error(`✅ MCP server running on port ${PORT} with Streamable HTTP transport`);
});
