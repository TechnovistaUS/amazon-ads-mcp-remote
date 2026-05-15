#!/usr/bin/env python3
import sys
import json
import asyncio
import aiohttp

REMOTE_URL = "https://amazon-ads-mcp-production-765d.up.railway.app/mcp/sse"

async def main():
    async with aiohttp.ClientSession() as session:
        async with session.get(REMOTE_URL) as response:
            async for line in response.content:
                if line:
                    try:
                        data = json.loads(line.decode().strip())
                        print(json.dumps(data))
                        sys.stdout.flush()
                    except:
                        pass

if __name__ == "__main__":
    asyncio.run(main())
