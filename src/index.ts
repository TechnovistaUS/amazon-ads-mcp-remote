import express from "express";

const app = express();
app.use(express.json());

const tools = [
  { name: "amazon_ads_get_profiles", description: "Retrieve advertiser profiles", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_list_campaigns", description: "List all campaigns", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_get_campaign_metrics", description: "Get metrics", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_create_campaign", description: "Create campaign", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_update_campaign", description: "Update campaign", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_get_account_info", description: "Get account info", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_get_token_status", description: "Check token", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_set_bidding_strategy", description: "Set bidding", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_apply_bid_multiplier", description: "Apply multiplier", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_create_bid_rule", description: "Create rule", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_get_bid_rules", description: "Get rules", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_adjust_bid", description: "Adjust bid", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_set_target_acos", description: "Set ACoS", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_create_bid_automation", description: "Create automation", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_update_bid_rule", description: "Update rule", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_get_adjustment_history", description: "Get history", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_get_bid_automation", description: "Get automation", inputSchema: { type: "object", properties: {} } },
  { name: "amazon_ads_delete_bid_rule", description: "Delete rule", inputSchema: { type: "object", properties: {} } },
];

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Amazon Ads MCP v2.0", tools: 18 });
});

app.post("/mcp/tools/list", (req, res) => {
  res.json({ tools });
});

app.post("/mcp/tools/call", (req, res) => {
  const { name, arguments: args } = req.body;
  const tool = tools.find((t: any) => t.name === name);
  if (!tool) {
    return res.status(404).json({ error: `Tool ${name} not found` });
  }
  return res.json({ content: [{ type: "text", text: `${name} executed: ${JSON.stringify(args)}` }] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.error(`✅ Amazon Ads MCP Server running on port ${PORT}`);
});
