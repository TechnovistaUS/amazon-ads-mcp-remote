#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

async function main() {
  const remoteUrl = "https://amazon-ads-mcp-production-765d.up.railway.app/mcp/sse";
  const remoteTransport = new SSEClientTransport(new URL(remoteUrl));
  const remoteClient = new Client({ name: "bridge", version: "1.0.0" }, {});

  const localServer = new Server(
    { name: "amazon-ads-mcp-bridge", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  try {
    await remoteClient.connect(remoteTransport);
    console.error("✅ Connected to remote server");
    
    const remoteTools = await remoteClient.listTools();
    console.error(`✅ Found ${remoteTools.tools.length} tools`);

    localServer.setRequestHandler(ListToolsRequestSchema, async () => remoteTools);

    localServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await remoteClient.callTool({ name: request.params.name, arguments: request.params.arguments });
    });

    const transport = new StdioServerTransport();
    await localServer.connect(transport);
    console.error("✅ MCP bridge ready on stdio");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
