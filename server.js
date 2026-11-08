const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const webhookRoutes = require('./routes/webhook');
const leadsRoutes = require('./routes/leads');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/leads', leadsRoutes);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start Server
app.listen(config.port, () => {
  console.log('\n======================================================');
  console.log('🚀 iGrey WhatsApp Automation & Leads Hub is LIVE!');
  console.log('======================================================');
  console.log(`📊 Admin Leads Dashboard : http://localhost:${config.port}/admin.html`);
  console.log(`📋 Eligibility Form       : http://localhost:${config.port}/eligibility.html`);
  console.log(`📅 Call Scheduling Page   : http://localhost:${config.port}/schedule.html`);
  console.log(`🔗 Webhook Endpoint       : http://localhost:${config.port}/api/webhook`);
  console.log('======================================================\n');
});

