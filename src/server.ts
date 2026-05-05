const express = require('express');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

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
  console.log('Health: http://localhost:' + PORT + '/health');
});
