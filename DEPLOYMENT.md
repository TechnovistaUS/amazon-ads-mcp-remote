# 🚀 Amazon Ads MCP Server - Deployment & HTTPS Guide

This guide walks through deploying your MCP server with proper HTTPS configuration and connecting it to Claude.

---

## 📋 Table of Contents

1. [Quick Start (ngrok)](#quick-start-ngrok)
2. [Production Deployment](#production-deployment)
3. [HTTPS Configuration](#https-configuration)
4. [Claude Integration](#claude-integration)
5. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start (ngrok)

### Best for: Testing, Development, Quick Setup

#### Step 1: Install ngrok

```bash
# macOS (with Homebrew)
brew install ngrok

# Or download from: https://ngrok.com/download
```

#### Step 2: Create ngrok Account (Optional but Recommended)

1. Go to https://ngrok.com
2. Sign up for free account
3. Get your Auth Token from dashboard
4. Login locally: `ngrok config add-authtoken YOUR_TOKEN`

#### Step 3: Start ngrok Tunnel

Open a new terminal and run:

```bash
ngrok http 3000
```

This will display:
```
Forwarding     https://abc123def456.ngrok.io -> http://localhost:3000
```

**Copy that HTTPS URL** - you'll need it next.

#### Step 4: Configure Environment

Create `.env` file:

```env
AMAZON_CLIENT_ID=amzn1.application-oa2-client.eb73a2fb8db24cbda9568305c23fcd6e
AMAZON_CLIENT_SECRET=amzn1.oa2-cs.v1.29b8a39598dd4621649841415efb061970bf21a77431855376a8e82e200d4cc3
AMAZON_REFRESH_TOKEN=

PORT=3000
NODE_ENV=development
PUBLIC_URL=https://abc123def456.ngrok.io
```

#### Step 5: Build and Start

```bash
npm install
npm run build
npm run dev
```

You should see:
```
✅ Server is Running ✅

🔗 Available at: https://abc123def456.ngrok.io
📋 MCP Endpoint: https://abc123def456.ngrok.io/mcp
🔑 Auth Flow: https://abc123def456.ngrok.io/auth
```

#### Step 6: Authorize (One-Time)

Visit in your browser:
```
https://abc123def456.ngrok.io/auth
```

1. Sign in to your Amazon Ads account
2. Grant permissions
3. You'll be redirected with "Authorization successful"

#### Step 7: Verify Token

```bash
curl https://abc123def456.ngrok.io/token-status
```

Should return:
```json
{
  "status": "valid",
  "expiresInMinutes": 59,
  "message": "Token expires in 59 minutes"
}
```

#### Step 8: Add to Claude

1. Go to https://claude.ai
2. Settings > Connectors
3. "Add custom connector"
4. URL: `https://abc123def456.ngrok.io/mcp`
5. Complete OAuth when prompted
6. Done! ✅

---

## 🏢 Production Deployment

### Best for: 24/7 Availability, Reliability

Choose one of the platforms below:

### Option A: Render (Easiest)

#### Prerequisites
- GitHub account
- GitHub repository with your code

#### Setup Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/amazon-ads-mcp-remote.git
   git push -u origin main
   ```

2. **Create Render Project**:
   - Go to https://render.com
   - Click "New +" > "Web Service"
   - Connect your GitHub repo
   - Select your repository

3. **Configure Build Settings**:
   - **Name**: amazon-ads-mcp-remote
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free tier works (or pay for better)

4. **Add Environment Variables**:
   - Click "Environment"
   - Add these variables:
     ```
     AMAZON_CLIENT_ID=amzn1.application-oa2-client.eb73a2fb8db24cbda9568305c23fcd6e
     AMAZON_CLIENT_SECRET=amzn1.oa2-cs.v1.29b8a39598dd4621649841415efb061970bf21a77431855376a8e82e200d4cc3
     NODE_ENV=production
     PORT=443
     PUBLIC_URL=https://amazon-ads-mcp-remote.onrender.com
     ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your URL: `https://amazon-ads-mcp-remote.onrender.com`

6. **Authorize**:
   - Visit: `https://amazon-ads-mcp-remote.onrender.com/auth`
   - Complete OAuth flow

#### Render Advantages
✅ Free HTTPS certificate  
✅ Auto-deploys on git push  
✅ Automatic restarts  
✅ Easy environment variables  

---

### Option B: Railway (Very Easy)

#### Setup Steps

1. **Connect GitHub**:
   - Go to https://railway.app
   - Click "New Project"
   - "Deploy from GitHub"
   - Select your repository

2. **Add Environment Variables**:
   - Railway > Variables
   - Add the same 5 variables as above
   - `PUBLIC_URL=https://your-railway-url.up.railway.app`

3. **Deploy**:
   - Railway auto-deploys
   - View logs in dashboard
   - Your HTTPS URL is auto-generated

#### Railway Advantages
✅ Simplest setup  
✅ Free HTTPS  
✅ Great for beginners  
✅ $5 free credit per month  

---

### Option C: Replit (Good for Learning)

#### Setup Steps

1. **Create Replit Project**:
   - Go to https://replit.com
   - Click "Create Replit"
   - Choose "Node.js"

2. **Upload Files**:
   - Upload all your project files
   - Copy contents to files

3. **Add .env**:
   - Create `.env` file in Replit
   - Add your credentials

4. **Install & Build**:
   - Click "Run"
   - Terminal: `npm install && npm run build && npm start`

5. **Get HTTPS URL**:
   - Your Replit URL is in the browser preview
   - It's already HTTPS!

#### Replit Advantages
✅ No credit card needed  
✅ Built-in IDE  
✅ Easy file management  
⚠️ May sleep if inactive  

---

### Option D: AWS/Azure/Google Cloud (Advanced)

For enterprise deployments with custom domains:

1. Deploy Node.js app to your cloud provider
2. Use your own domain
3. Configure HTTPS certificates (Let's Encrypt or AWS Certificate Manager)
4. Update `PUBLIC_URL` to your domain

---

## 🔒 HTTPS Configuration

### Automatic HTTPS (Recommended)

All platforms above provide automatic HTTPS. No manual configuration needed.

### Manual HTTPS with Let's Encrypt

For self-hosted servers:

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate for your domain
sudo certbot certonly --standalone -d your-domain.com

# Update .env
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
NODE_ENV=production
PUBLIC_URL=https://your-domain.com
```

---

## 🔗 Claude Integration

### Step 1: Test Your Server

Before connecting to Claude, verify everything works:

```bash
# Health check
curl https://your-server-url/health

# Token status
curl https://your-server-url/token-status

# Server info
curl https://your-server-url/info
```

All should return JSON responses.

### Step 2: Open Claude Settings

1. Go to https://claude.ai
2. Click your profile (top right)
3. Select "Settings"

### Step 3: Add Connector

1. Click "Connectors" in sidebar
2. Scroll to bottom
3. Click "Add custom connector"
4. Paste your URL:
   ```
   https://your-server-url/mcp
   ```
5. Click "Add"

### Step 4: Complete OAuth

1. Claude will open authorization window
2. Sign in to Amazon Ads account
3. Grant permissions to Claude
4. You'll be returned to Claude

### Step 5: Verify Connection

In Claude chat, ask:

```
What Amazon Ads tools do you have available?
```

Claude should list the 7 available tools.

### Step 6: Use Tools

Try a simple command:

```
Show me my Amazon Ads profiles.
```

Claude will call the tool and display results.

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Server is running and accessible via HTTPS
- [ ] `/health` endpoint returns OK
- [ ] `/token-status` shows valid token
- [ ] OAuth flow completes (visit `/auth`)
- [ ] Claude can connect to MCP endpoint
- [ ] Claude lists all 7 tools
- [ ] At least one tool call succeeds

---

## 🔄 Token Refresh Status

The server automatically refreshes tokens. To monitor:

```bash
# Check current status
curl https://your-server-url/token-status

# Sample response:
{
  "expiresIn": 3599,
  "expiresInMinutes": 59,
  "status": "valid",
  "message": "Token expires in 59 minutes"
}
```

**The token will automatically refresh when:**
- Less than 5 minutes remain
- Checked every 60 seconds
- Seamlessly, without disruption

---

## 🆘 Troubleshooting

### Issue: "Connection Refused"

```
curl: (7) Failed to connect to your-server-url
```

**Solutions:**
1. Verify server is running: `npm start`
2. Check correct PORT in .env
3. Wait 30 seconds for Render/Railway to fully deploy
4. Verify firewall allows HTTPS (port 443)

### Issue: "Authorization Failed"

```
Error: Token exchange failed
```

**Solutions:**
1. Verify `AMAZON_CLIENT_ID` and `AMAZON_CLIENT_SECRET` are correct
2. Verify `PUBLIC_URL` is correct (matches deployment URL)
3. Clear browser cookies and try again
4. Check Amazon Developer Console for allowed origins

### Issue: Claude Can't Connect

"The MCP connector returned an error"

**Solutions:**
1. Verify MCP URL is exactly correct (ends with `/mcp`)
2. Test URL manually: `curl https://your-url/mcp`
3. Restart Claude
4. Remove and re-add connector
5. Check server logs for errors

### Issue: Token Expired

```
"expiresIn": -1000
```

**Solutions:**
1. Server will automatically refresh - wait 5 minutes
2. Or manually restart server and visit `/auth` again
3. Check server is actually running

### Issue: ngrok URL Changed

ngrok URLs expire after 2 hours on free tier.

**Solutions:**
1. Run ngrok again: `ngrok http 3000`
2. Get new URL from terminal
3. Update `.env` with new `PUBLIC_URL`
4. Restart server: `npm run dev`
5. Remove and re-add connector in Claude

---

## 📊 Monitoring

### Check Server Status

```bash
# Server health
curl -s https://your-server-url/health | jq

# Token status
curl -s https://your-server-url/token-status | jq

# Server info
curl -s https://your-server-url/info | jq
```

### View Live Logs

**Render**:
- Dashboard > Logs (live streaming)

**Railway**:
- Dashboard > Logs (live streaming)

**Replit**:
- Console tab

**Local**:
- Terminal where `npm run dev` is running

---

## 🎯 Common Commands

```bash
# Build the server
npm run build

# Start for development
npm run dev

# Start for production
npm start

# Test with inspector
npm run inspector

# Check TypeScript errors
npx tsc --noEmit
```

---

## ✨ Success!

Once everything is set up:

1. ✅ Your MCP server is running on HTTPS
2. ✅ Tokens are automatically refreshed
3. ✅ Claude can access all your Amazon Ads data
4. ✅ Tools are ready to use

Enjoy integrated Amazon Ads management in Claude! 🎉

---

## 📞 Support

If you encounter issues:

1. Check logs for error messages
2. Verify all environment variables are set
3. Test endpoints with curl
4. Review the main README.md
5. Check Amazon Ads API documentation

Happy deploying! 🚀
