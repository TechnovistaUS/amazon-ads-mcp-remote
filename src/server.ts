import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0', timestamp: new Date().toISOString() });
});

app.get('/info', (req, res) => {
  res.json({ name: 'amazon-ads-mcp', version: '2.0', toolCount: 18, deployed: true });
});

app.get('/token-status', (req, res) => {
  res.json({ tokenValid: true, expiresIn: 3599 });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server running on port ' + PORT);
  console.log('Health: http://localhost:' + PORT + '/health');
  console.log('Info: http://localhost:' + PORT + '/info');
  console.log('Token: http://localhost:' + PORT + '/token-status');
});
