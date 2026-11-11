const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const aisensy = require('../services/aisensy');
const googleChat = require('../services/googleChat');

/**
 * Submit Customer Eligibility Form
 */
router.post('/eligibility', async (req, res) => {
  try {
    const { name, phone, email, bhk, budget, preferredTime, location, notes } = req.body;

    if (!phone || !name) {
      return res.status(400).json({ success: false, error: 'Name and Phone Number are required.' });
    }

    const lead = storage.saveLead({
      name,
      phone,
      email: email || '',
      bhk: bhk || 'Not specified',
      budget: budget || 'Not specified',
      location: location || 'Bangalore',
      preferredTime: preferredTime || 'Anytime',
      notes: notes || '',
      action: 'ELIGIBILITY_FORM_SUBMITTED',
      source: 'Smart Stay Eligibility Form',
      status: 'QUALIFIED'
    });

    console.log('🎉 New Qualified Lead Received:', lead);

    // 1. Dispatch Google Chat rich notification to team space
    try {
      await googleChat.sendLeadAlert(lead);
    } catch (gcErr) {
      console.warn('Google Chat alert warning:', gcErr.message);
    }

    // 2. Notify sales team via WhatsApp
    await aisensy.notifyAdmin({
      leadName: name,
      phone: phone,
      action: 'New Eligibility Form Submission',
      details: `Email: ${email || 'N/A'} | Unit: ${bhk} | Budget: ${budget} | Loc: ${location || 'Bangalore'} | Preferred Time: ${preferredTime}`
    });

    // 3. Send WhatsApp confirmation message to customer
    try {
      await aisensy.sendTemplateMessage({
        destination: phone,
        userName: name,
        templateParams: [name, bhk],
        tags: ['SmartStayLead', 'EligibilitySubmitted']
      });
    } catch (err) {
      console.warn('Could not send automated WhatsApp to lead:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Eligibility details received! Our property specialist will connect with you shortly.',
      leadId: lead.id
    });
  } catch (error) {
    console.error('Error in eligibility submission:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * Trigger Smart Stay WhatsApp Template to a new lead (from Website or manual)
 */
router.post('/send-template', async (req, res) => {
  try {
    const { destination, userName, mediaUrl } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, error: 'destination phone number is required' });
    }

    const result = await aisensy.sendTemplateMessage({
      destination,
      userName: userName || 'Valued Client',
      media: mediaUrl ? { url: mediaUrl, filename: 'smart-stay.jpg' } : null
    });

    storage.saveLead({
      name: userName || 'Lead',
      phone: destination,
      action: 'OUTBOUND_TEMPLATE_SENT',
      details: `Dispatched template igrey_smart_stay_v1`
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get all captured leads
 */
router.get('/', (req, res) => {
  const leads = storage.getLeads();
  res.status(200).json({ success: true, count: leads.length, leads });
});

/**
 * Export leads to CSV
 */
router.get('/export-csv', (req, res) => {
  const leads = storage.getLeads();
  const headers = ['ID', 'Date', 'Name', 'Phone', 'Email', 'BHK Choice', 'Budget', 'Preferred Call Time', 'Action', 'Notes'];

  const rows = leads.map(l => [
    l.id || '',
    l.createdAt || '',
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.bhk || '').replace(/"/g, '""')}"`,
    `"${(l.budget || '').replace(/"/g, '""')}"`,
    `"${(l.preferredTime || '').replace(/"/g, '""')}"`,
    `"${(l.action || '').replace(/"/g, '""')}"`,
    `"${(l.details || l.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="igrey_leads_' + Date.now() + '.csv"');
  res.status(200).send(csvContent);
});

module.exports = router;

