const express = require('express');

const PORT = parseInt(process.env.MCP_SERVER_PORT || '3000', 10);
console.log('DEBUG: PORT:', PORT);

const app = express();

app.get('/health', (req: any, res: any) => {
  res.json({ status: 'ok', version: '2.0' });
});

app.get('/info', (req: any, res: any) => {
  res.json({ name: 'amazon-ads-mcp', version: '2.0', toolCount: 18 });
});

app.get('/token-status', (req: any, res: any) => {
  res.json({ tokenValid: true, expiresIn: 3599 });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server running on port ' + PORT);
});
