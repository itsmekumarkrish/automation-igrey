const fs = require('fs');
const path = require('path');
const config = require('../config');

const dataDir = path.dirname(config.paths.leadsFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(config.paths.leadsFile)) {
  fs.writeFileSync(config.paths.leadsFile, JSON.stringify([], null, 2));
}

function getLeads() {
  try {
    const raw = fs.readFileSync(config.paths.leadsFile, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Error reading leads:', err.message);
    return [];
  }
}

function saveLead(leadData) {
  try {
    const leads = getLeads();
    const ts = Date.now().toString();
    const newEntry = {
      id: 'SS-BLR-' + ts.slice(-5),
      rawId: 'LEAD_' + ts,
      createdAt: new Date().toISOString(),
      status: 'NEW',
      ...leadData
    };
    leads.unshift(newEntry);
    fs.writeFileSync(config.paths.leadsFile, JSON.stringify(leads, null, 2));
    return newEntry;
  } catch (err) {
    console.error('Error saving lead:', err.message);
    throw err;
  }
}

module.exports = {
  getLeads,
  saveLead
};

