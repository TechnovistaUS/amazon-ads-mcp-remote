# 🎯 Amazon Ads MCP Remote Server - Complete Implementation Guide

## Overview

You now have a **production-ready Remote MCP Server** for Amazon Ads with:

✅ **OAuth 2.0 Authentication**  
✅ **Automatic Token Refresh** (every 55 minutes)  
✅ **HTTPS Remote Support**  
✅ **7 Complete Tools**  
✅ **Type-Safe TypeScript**  
✅ **Comprehensive Error Handling**  

---

## 📁 Project Structure

```
amazon-ads-mcp-remote/
├── src/
│   └── index.ts              # Main server with all logic
├── dist/                      # Compiled JavaScript (after npm run build)
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment variables template
├── README.md                 # Main documentation
├── DEPLOYMENT.md             # Deployment & HTTPS guide
├── quickstart.sh             # Quick setup script
└── .gitignore               # Git ignore patterns
```

---

## 🔑 Your Credentials

**IMPORTANT**: Keep these secure!

```
Client ID:     amzn1.application-oa2-client.eb73a2fb8db24cbda9568305c23fcd6e
Client Secret: amzn1.oa2-cs.v1.29b8a39598dd4621649841415efb061970bf21a77431855376a8e82e200d4cc3
API Scopes:    profile:contact, advertising::campaign_management, profile, profile:name, profile:mobile_number, advertising::test:create_account, appstore::apps:readwrite, adx_reporting::appstore:marketer
```

**These go in your `.env` file as:**
```env
AMAZON_CLIENT_ID=amzn1.application-oa2-client.eb73a2fb8db24cbda9568305c23fcd6e
AMAZON_CLIENT_SECRET=amzn1.oa2-cs.v1.29b8a39598dd4621649841415efb061970bf21a77431855376a8e82e200d4cc3
```

---

## 🚀 Getting Started (3 Steps)

### Step 1: Install Dependencies

```bash
cd amazon-ads-mcp-remote
npm install
```

### Step 2: Create & Configure `.env`

```bash
cp .env.example .env
```

Edit `.env` and add:
```env
AMAZON_CLIENT_ID=amzn1.application-oa2-client.eb73a2fb8db24cbda9568305c23fcd6e
AMAZON_CLIENT_SECRET=amzn1.oa2-cs.v1.29b8a39598dd4621649841415efb061970bf21a77431855376a8e82e200d4cc3
AMAZON_REFRESH_TOKEN=

PORT=3000
NODE_ENV=development
PUBLIC_URL=https://your-ngrok-url.ngrok.io
```

### Step 3: Build & Run

```bash
npm run build
npm run dev
```

---

## 🔐 HTTPS URLs Required

All connections to Claude must be **HTTPS** (encrypted).

### Quick Options for HTTPS:

**Option 1: ngrok (Easiest for Testing)**
```bash
# Install ngrok
brew install ngrok  # or download from ngrok.com

# Start tunnel
ngrok http 3000

# Copy the https://... URL
# Update PUBLIC_URL in .env
# Restart server
```

**Option 2: Production (Render, Railway, Replit)**
- All provide automatic HTTPS
- See DEPLOYMENT.md for detailed setup
- Takes 5-10 minutes

**Option 3: Your Own Domain**
- Use Let's Encrypt (free)
- Configure in .env with SSL certificates
- See DEPLOYMENT.md section "Manual HTTPS with Let's Encrypt"

---

## 🔄 Token Refresh - How It Works

The server **automatically handles all token management**:

### Timeline

1. **T=0 minutes**: Access token issued (valid for 1 hour)
2. **T=55 minutes**: Server checks token expiry
3. **T=55 minutes**: Token automatically refreshes
4. **T=60 minutes**: New access token obtained
5. **Repeat**: Process continues indefinitely

### How to Monitor

Check token status anytime:

```bash
curl https://your-server-url/token-status
```

Response:
```json
{
  "expiresIn": 3000,
  "expiresInMinutes": 50,
  "status": "valid",
  "message": "Token expires in 50 minutes"
}
```

### What If Token Expires?

✅ Don't worry - the server handles it automatically!

If you need to re-authorize:
```bash
# Visit in browser
https://your-server-url/auth

# Follow OAuth flow with your Amazon account
# Token is automatically saved
```

---

## 📊 Available Tools

| # | Tool Name | Purpose |
|---|-----------|---------|
| 1 | `amazon_ads_get_profiles` | Get all advertiser profiles |
| 2 | `amazon_ads_get_account_info` | Account details & settings |
| 3 | `amazon_ads_list_campaigns` | List campaigns (with filters) |
| 4 | `amazon_ads_get_campaign_metrics` | Performance metrics (ACoS, ROAS) |
| 5 | `amazon_ads_create_campaign` | Create new campaigns |
| 6 | `amazon_ads_update_campaign` | Modify existing campaigns |
| 7 | `amazon_ads_get_token_status` | Check OAuth token status |

---

## 🔗 Connecting to Claude

### Step 1: Start Your Server

```bash
npm run dev
```

Verify it's running:
```bash
curl https://your-server-url/health
```

### Step 2: Authorize with Amazon

Visit in your browser:
```
https://your-server-url/auth
```

1. Sign in to your Amazon Ads account
2. Grant permissions to Claude
3. You'll see: "Authorization successful"

### Step 3: Open Claude Settings

1. Go to https://claude.ai
2. Profile icon (top right) → Settings
3. Click "Connectors" in sidebar

### Step 4: Add Custom Connector

1. Click "Add custom connector"
2. Enter URL:
   ```
   https://your-server-url/mcp
   ```
3. Click "Add"
4. Complete OAuth when prompted

### Step 5: Test in Claude

Ask Claude:
```
What Amazon Ads tools do you have?
```

Claude should respond with the 7 tools listed above.

---

## 💡 Usage Examples

### Example 1: Get Your Profiles

**In Claude:**
```
Show me all my Amazon Ads profiles.
```

**Claude will:**
1. Call `amazon_ads_get_profiles`
2. Display all your advertiser profiles
3. Show profile IDs and names

---

### Example 2: Check Campaign Performance

**In Claude:**
```
What are the metrics for campaign ABC123 in profile XYZ?
```

**Claude will:**
1. Call `amazon_ads_get_campaign_metrics`
2. Retrieve spend, impressions, clicks, ACoS, ROAS
3. Display formatted results

---

### Example 3: List All Campaigns

**In Claude:**
```
List all my Sponsored Products campaigns that are currently enabled.
```

**Claude will:**
1. Call `amazon_ads_list_campaigns` with filters
2. Return only enabled Sponsored Products campaigns
3. Display campaign details

---

## 🔍 Testing Endpoints

Before connecting to Claude, test these endpoints:

### Health Check
```bash
curl https://your-server-url/health
```

Response:
```json
{
  "status": "ok",
  "service": "amazon-ads-mcp-remote",
  "tokenExpiresIn": 3600,
  "timestamp": "2026-04-25T03:30:00.000Z"
}
```

### Token Status
```bash
curl https://your-server-url/token-status
```

### Server Info
```bash
curl https://your-server-url/info
```

Response includes all available tools.

---

## 📈 Production Deployment

For 24/7 availability, deploy to a cloud platform.

### Recommended: Render (Easiest)

1. Push code to GitHub
2. Create Render project
3. Set environment variables
4. Deploy (automatic HTTPS)

**Total time: 10 minutes**

See DEPLOYMENT.md for complete instructions.

### Alternative Options

- **Railway**: Similar to Render, very easy
- **Replit**: Great for learning, free
- **AWS/Azure**: Enterprise-grade, more complex

---

## 🛡️ Security Checklist

- ✅ Client Secret is secure (in .env, never committed)
- ✅ Using HTTPS only (not HTTP)
- ✅ Token refresh happens automatically
- ✅ Tokens never exposed in logs
- ✅ Environment variables not hardcoded
- ✅ OAuth uses standard flows

---

## 🐛 Troubleshooting

### Problem: "Connection refused"
**Solution**: Check if server is running
```bash
npm run dev
```

### Problem: "Token expired"
**Solution**: Automatic refresh will handle it. If immediate retry needed:
```bash
# Visit in browser to re-authorize
https://your-server-url/auth
```

### Problem: "Claude can't find tools"
**Solution**: 
1. Check MCP URL ends with `/mcp`
2. Restart Claude
3. Remove and re-add connector

### Problem: ngrok URL changed
**Solution**:
1. Get new URL: `ngrok http 3000`
2. Update `PUBLIC_URL` in `.env`
3. Restart server
4. Re-add connector in Claude

### Problem: OAuth won't complete
**Solution**: Verify in `.env`:
- `AMAZON_CLIENT_ID` is correct
- `AMAZON_CLIENT_SECRET` is correct
- `PUBLIC_URL` matches your actual server URL

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Complete feature & tool documentation |
| **DEPLOYMENT.md** | Deployment options & HTTPS setup |
| **This file** | Implementation guide & quick reference |

---

## 🎯 Quick Command Reference

```bash
# Initial setup
npm install
npm run build

# Development
npm run dev

# Production
npm start

# Test locally (with MCP Inspector)
npm run inspect

# Check for errors
npx tsc --noEmit

# View environment
cat .env
```

---

## 🚨 Important Notes

### Token Management

The server **NEVER stops managing your tokens**. They refresh automatically:
- Every access token is valid for 60 minutes
- Server refreshes 5 minutes before expiry
- No action needed from you
- Works even while you're using Claude

### HTTPS is Required

Claude only connects via HTTPS (encrypted). Never use HTTP.

### Environment Variables

Keep your `.env` file safe:
- Never commit to Git
- Never share with others
- Contains your AWS credentials

### Monitoring

Monitor your server's health:
```bash
# Check every hour or so
curl https://your-server-url/token-status

# Or set up alerting if deployed to cloud platform
```

---

## ✅ Verification Checklist

Before connecting to Claude, verify:

- [ ] `npm install` completed without errors
- [ ] `npm run build` completed without errors  
- [ ] `.env` file exists with all required variables
- [ ] Server starts: `npm run dev` (no errors)
- [ ] Health endpoint works: `curl https://your-url/health`
- [ ] Token status shows "valid": `curl https://your-url/token-status`
- [ ] Server is publicly accessible via HTTPS
- [ ] OAuth flow completes when visiting `/auth`

---

## 🎉 Next Steps

1. **Complete setup** using quickstart.sh or manually
2. **Configure environment** with your credentials
3. **Start the server** with `npm run build && npm run dev`
4. **Authorize with Amazon** by visiting `/auth`
5. **Connect to Claude** via Settings > Connectors
6. **Start using tools** in Claude chat

---

## 📞 Support Resources

- **Amazon Ads API Docs**: https://advertising.amazon.com/API/docs/
- **MCP Protocol Docs**: https://modelcontextprotocol.io/
- **Claude Support**: https://support.anthropic.com/

---

## 🎓 Key Concepts

### MCP (Model Context Protocol)
A protocol that lets AI assistants interact with external tools and data sources. Your server implements MCP to expose Amazon Ads tools to Claude.

### OAuth 2.0
A secure authentication standard. Claude authenticates with your Amazon account to access your advertising data.

### Refresh Tokens
Long-lived tokens that allow obtaining new short-lived access tokens. Your server automatically uses refresh tokens to keep access alive.

### Streamable HTTP
An MCP transport mechanism that works over HTTP. Your remote server uses this to communicate with Claude.

---

## 🏁 Summary

You have a **production-ready Amazon Ads MCP Server** that:

1. ✅ Connects to Amazon Ads API securely
2. ✅ Handles OAuth 2.0 authentication
3. ✅ Automatically refreshes tokens
4. ✅ Exposes 7 powerful tools to Claude
5. ✅ Works over HTTPS from anywhere
6. ✅ Includes comprehensive error handling
7. ✅ Includes detailed logging

**Everything is ready to deploy and connect to Claude!**

---

## 🚀 Ready to Deploy?

Choose your deployment method:

1. **Quick Test** (5 min): Use ngrok
2. **Production** (10 min): Use Render or Railway
3. **Enterprise** (30+ min): Self-host with your domain

See DEPLOYMENT.md for detailed instructions for each option.

---

**Happy building! 🎉**
