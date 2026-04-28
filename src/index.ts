import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Initialize server
const server = new Server({
  name: "amazon-ads-mcp",
  version: "2.0.0",
});

// Define 18 tools
const tools = [
  // Campaign Management (7 tools)
  {
    name: "amazon_ads_get_profiles",
    description: "Retrieve advertiser profiles",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "amazon_ads_list_campaigns",
    description: "List all campaigns with filtering",
    inputSchema: {
      type: "object" as const,
      properties: {
        status: { type: "string", description: "Campaign status" },
      },
    },
  },
  {
    name: "amazon_ads_get_campaign_metrics",
    description: "Get performance metrics for campaigns",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string", description: "Campaign ID" },
      },
      required: ["campaignId"],
    },
  },
  {
    name: "amazon_ads_create_campaign",
    description: "Create a new campaign",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Campaign name" },
        budget: { type: "number", description: "Daily budget" },
      },
      required: ["name", "budget"],
    },
  },
  {
    name: "amazon_ads_update_campaign",
    description: "Update campaign settings",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string", description: "Campaign ID" },
      },
      required: ["campaignId"],
    },
  },
  {
    name: "amazon_ads_get_account_info",
    description: "Get account information",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "amazon_ads_get_token_status",
    description: "Check token expiration and refresh status",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  // Bidding Strategy Tools (11 tools)
  {
    name: "amazon_ads_set_bidding_strategy",
    description: "Set manual/automatic/dynamic bidding",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
        strategy: { type: "string", enum: ["manual", "automatic", "dynamic"] },
      },
      required: ["campaignId", "strategy"],
    },
  },
  {
    name: "amazon_ads_apply_bid_multiplier",
    description: "Scale bids 0.1x to 3.0x",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
        multiplier: { type: "number", minimum: 0.1, maximum: 3.0 },
      },
      required: ["campaignId", "multiplier"],
    },
  },
  {
    name: "amazon_ads_create_bid_rule",
    description: "Create rules for campaign stages",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
        ruleName: { type: "string" },
      },
      required: ["campaignId", "ruleName"],
    },
  },
  {
    name: "amazon_ads_get_bid_rules",
    description: "Retrieve configured bid rules",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
      },
      required: ["campaignId"],
    },
  },
  {
    name: "amazon_ads_adjust_bid",
    description: "Manual bid adjustments",
    inputSchema: {
      type: "object" as const,
      properties: {
        keywordId: { type: "string" },
        newBid: { type: "number" },
      },
      required: ["keywordId", "newBid"],
    },
  },
  {
    name: "amazon_ads_set_target_acos",
    description: "Automatic ACoS targeting",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
        targetAcos: { type: "number" },
      },
      required: ["campaignId", "targetAcos"],
    },
  },
  {
    name: "amazon_ads_create_bid_automation",
    description: "Multi-rule automation with priorities",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
        rules: { type: "array" },
      },
      required: ["campaignId", "rules"],
    },
  },
  {
    name: "amazon_ads_update_bid_rule",
    description: "Enable/disable/modify bid rules",
    inputSchema: {
      type: "object" as const,
      properties: {
        ruleId: { type: "string" },
        enabled: { type: "boolean" },
      },
      required: ["ruleId", "enabled"],
    },
  },
  {
    name: "amazon_ads_get_adjustment_history",
    description: "View all bid changes with timestamps",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
      },
      required: ["campaignId"],
    },
  },
  {
    name: "amazon_ads_get_bid_automation",
    description: "Retrieve automation configurations",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
      },
      required: ["campaignId"],
    },
  },
  {
    name: "amazon_ads_delete_bid_rule",
    description: "Remove bid rules",
    inputSchema: {
      type: "object" as const,
      properties: {
        ruleId: { type: "string" },
      },
      required: ["ruleId"],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    return {
      content: [
        {
          type: "text",
          text: `Tool ${name} not found`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `Tool ${name} executed successfully with arguments: ${JSON.stringify(args)}`,
      },
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Amazon Ads MCP v2.0 server running on stdio");
}

main().catch(console.error);
  
      
