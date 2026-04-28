# Amazon Ads MCP Remote Server

A production-ready **Remote MCP (Model Context Protocol) Server** that connects Amazon Ads API directly with Claude using **OAuth 2.0 authentication** and **automatic token refresh**.

## 🎯 Features

✅ **OAuth 2.0 Authentication** - Secure authorization flow  
✅ **Automatic Token Refresh** - Tokens refresh 5 minutes before expiry  
✅ **Remote HTTPS Support** - Connect from anywhere via HTTPS URL  
✅ **Complete Campaign Management** - Full Amazon Ads API integration  
✅ **Error Handling** - Comprehensive error messages and logging  
✅ **Production Ready** - Type-safe TypeScript, proper error handling  

## 📋 Tools Available

| Tool | Description |
|------|-------------|
| `amazon_ads_get_profiles` | Retrieve all advertiser profiles |
| `amazon_ads_get_account_info` | Get detailed account information |
| `amazon_ads_list_campaigns` | List campaigns with optional filtering |
| `amazon_ads_get_campaign_metrics` | Get campaign performance metrics (ACoS, ROAS, etc.) |
| `amazon_ads_create_campaign` | Create new advertising campaigns |
| `amazon_ads_update_campaign` | Update existing campaigns |
| `amazon_ads_get_token_status` | Monitor OAuth token expiration |

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ installed
- **Amazon Ads account** with API access
- **Amazon OAuth credentials** (Client ID & Secret)
- **Public HTTPS URL** (for remote access)

### Step 1: Clone or Download

```bash
cd amazon-ads-mcp-remote
npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Your Amazon OAuth Credentials (from your Amazon Developer Account)
AMAZON_CLIENT_ID=amzn1.application-oa2-client.eb73a2fb8db24cbda9568305c23fcd6e
AMAZON_CLIENT_SECRET=amzn1.oa2-cs.v1.29b8a39598dd4621649841415efb061970bf21a77431855376a8e82e200d4cc3

# Leave blank initially - will be populated after first OAuth flow
AMAZON_REFRESH_TOKEN=

# Server Configuration
PORT=443
NODE_ENV=production
PUBLIC_URL=https://your-domain.com

# Optional: For ngrok tunneling
NGROK_AUTHTOKEN=your_ngrok_token
```

### Step 3: Build the Server

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Step 4: Deploy to HTTPS

#### Option A: Using ngrok (Development/Testing)

1. **Install ngrok** (if not installed):
   ```bash
   brew install ngrok  # macOS
   # or download from https://ngrok.com/download
   ```

2. **Start ngrok tunnel**:
   ```bash
   ngrok http 3000
   ```

3. **Update `.env`**:
   ```env
   PUBLIC_URL=https://your-ngrok-id.ngrok.io
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

#### Option B: Production Deployment (Recommended)

##### Deploy to Replit

1. Create account at https://replit.com
2. Create new Node.js project
3. Upload all files
4. Create `.env` file with your credentials
5. Run: `npm install && npm run build && npm start`
6. Enable "Always On" for 24/7 uptime
7. Your Replit URL becomes your `PUBLIC_URL`

##### Deploy to Render

1. Create account at https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set Build command: `npm install && npm run build`
5. Set Start command: `npm start`
6. Add Environment Variables in Dashboard
7. Deploy

##### Deploy to Railway

1. Create account at https://railway.app
2. Create new project
3. Deploy from GitHub
4. Set environment variables
5. Railway automatically provides HTTPS URL

##### Deploy with Your Own Server (with HTTPS)

For self-hosted servers, you need HTTPS certificates:

```bash
# Using Let's Encrypt (free)
sudo apt-get install certbot

# Generate certificates for your domain
sudo certbot certonly --standalone -d your-domain.com

# Update .env:
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
NODE_ENV=production
PUBLIC_URL=https://your-domain.com
```

---

## 🔐 OAuth Flow Setup

### Step 1: Authorize the Server

When you first start the server, visit:

```
https://your-domain.com/auth
```

This will:
1. Redirect you to Amazon's authorization page
2. Ask you to sign in to your Amazon Ads account
3. Request permission to access your advertising account
4. Return you to the callback URL with an authorization code

### Step 2: Exchange Code for Tokens

The server automatically exchanges the authorization code for access and refresh tokens.

The **refresh token** is automatically saved and used to refresh expired access tokens.

### Step 3: Verify Token Status

Check token status:

```bash
curl https://your-domain.com/token-status
```

Response:
```json
{
  "expiresIn": 3599,
  "expiresInMinutes": 59,
  "status": "valid",
  "message": "Token expires in 59 minutes"
}
```

---

## 🔗 Connect to Claude

### Step 1: Go to Claude Settings

1. Open Claude at https://claude.ai
2. Click your profile icon (top right)
3. Select "Settings"
4. Click "Connectors" in the sidebar

### Step 2: Add Custom Connector

1. Click "Add custom connector" button
2. Enter your MCP server URL:
   ```
   https://your-domain.com/mcp
   ```
3. Click "Add"

### Step 3: Complete Authentication

1. Claude will open an authentication window
2. Follow the Amazon Ads OAuth flow
3. Grant permissions when prompted
4. Return to Claude

### Step 4: Use Tools

In Claude, you can now use Amazon Ads tools:

```
Show me all my campaigns with their performance metrics.
```

Claude will use the tools to retrieve and display your campaign data.

---

## 🔄 Token Refresh Mechanism

The server automatically manages token lifecycle:

### How It Works

1. **Initial Access Token**: Valid for 1 hour
2. **Auto-Refresh**: Refreshes 5 minutes before expiry
3. **Background Check**: Every 60 seconds
4. **Concurrent Request Safety**: Prevents multiple simultaneous refreshes
5. **Persistent Storage**: Refresh token saved in environment

### Token Status

Monitor token status:

```bash
# Check token expiration
curl https://your-domain.com/token-status

# Server health status
curl https://your-domain.com/health
```

### Manual Token Refresh

Tokens refresh automatically. No manual action needed.

---

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth` | GET | Start OAuth authorization |
| `/callback` | GET | OAuth callback handler |
| `/mcp` | POST | MCP protocol handler |
| `/health` | GET | Server health status |
| `/token-status` | GET | Token expiration status |
| `/info` | GET | Server information |

---

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Watch TypeScript compilation
npm run watch

# In another terminal, start the server
npm run dev
```

### With MCP Inspector

Test tools locally:

```bash
npm run inspector
```

This opens the MCP Inspector on `http://localhost:5000`.

---

## 🔧 Troubleshooting

### Token Not Refreshing

**Problem**: Token expires but doesn't refresh
**Solution**:
```bash
# Check token status
curl https://your-domain.com/token-status

# If expired, manually restart server and go through OAuth again
# Or manually visit: https://your-domain.com/auth
```

### Connection Refused

**Problem**: Can't connect to server
**Solution**:
1. Verify `PUBLIC_URL` is correct in `.env`
2. Check firewall allows port 443 (HTTPS)
3. Verify HTTPS certificate is valid (if using custom domain)
4. Check server is running: `curl https://your-domain.com/health`

### Claude Can't Find Tools

**Problem**: Tools aren't appearing in Claude
**Solution**:
1. Disconnect the connector (Settings > Connectors)
2. Remove and re-add with correct MCP URL
3. Verify OAuth completed successfully
4. Check server logs for errors

### Ngrok URL Changed

**Problem**: Ngrok tunnel URL expires
**Solution**:
1. Restart ngrok
2. Update `PUBLIC_URL` in `.env`
3. Restart server
4. Remove and re-add connector in Claude with new URL

---

## 📝 Logs and Monitoring

### View Server Logs

```bash
# If running with npm
npm run dev

# If running as background process
tail -f server.log
```

### Log Entries

- `✅ Token refreshed successfully` - Token refresh succeeded
- `❌ Token refresh failed` - Authentication issue
- `Auto-refresh failed` - Network error
- `✅ Server is Running` - Server started

---

## 🔒 Security Best Practices

1. **Never share your `AMAZON_CLIENT_SECRET`** - Keep it secret!
2. **Use HTTPS only** - Never expose this over HTTP
3. **Restrict access** - Use firewall rules to limit who can call your server
4. **Rotate tokens regularly** - Re-authorize periodically
5. **Monitor token status** - Check expiration regularly
6. **Use environment variables** - Never hardcode credentials

---

## 📦 Environment Variables Reference

```env
# OAuth Credentials (REQUIRED)
AMAZON_CLIENT_ID=your_client_id
AMAZON_CLIENT_SECRET=your_client_secret

# OAuth Token (AUTO-MANAGED)
AMAZON_REFRESH_TOKEN=auto_saved_after_oauth

# Server Configuration
PORT=443                                    # HTTPS port
NODE_ENV=production                        # production or development
PUBLIC_URL=https://your-domain.com         # Public-facing URL
LOG_LEVEL=info                             # debug, info, warn, error

# Token Refresh Configuration
TOKEN_REFRESH_INTERVAL=55                  # Minutes before refresh

# HTTPS Certificates (Production)
SSL_CERT_PATH=/path/to/cert.pem           # Full chain certificate
SSL_KEY_PATH=/path/to/key.pem             # Private key

# Optional: Amazon Ads Configuration
AMAZON_API_REGION=NA                       # North America, EU, FE

# Optional: Tunneling (ngrok)
NGROK_AUTHTOKEN=your_ngrok_token
```

---

## 📚 Amazon Ads API Documentation

For more details about the Amazon Ads API:
- https://advertising.amazon.com/API/docs/en-us/
- https://advertising.amazon.com/API/docs/en-us/guides/get-started/create-authorization-grant

---

## ✅ Testing Checklist

- [ ] Server builds without errors: `npm run build`
- [ ] Environment variables set correctly in `.env`
- [ ] OAuth flow completes successfully
- [ ] Token status shows "valid" and has time remaining
- [ ] Can connect to Claude with MCP URL
- [ ] Claude tools appear in interface
- [ ] Can successfully call `amazon_ads_get_profiles`
- [ ] Token auto-refreshes (check logs after 55 minutes)

---

## 🆘 Getting Help

1. **Check logs**: Look for error messages
2. **Verify credentials**: Ensure Client ID/Secret are correct
3. **Test endpoints**: Use curl to test `/health` and `/token-status`
4. **Check firewall**: Ensure HTTPS port 443 is open
5. **Review documentation**: See Amazon Ads API docs

---

## 📄 License

MIT

---

## 🎉 You're All Set!

Your Amazon Ads MCP Remote Server is now ready to connect with Claude. Enjoy integrated campaign management from your AI assistant!
