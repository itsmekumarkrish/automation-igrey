const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const aisensy = require('../services/aisensy');
const config = require('../config');

/**
 * Verification endpoint (Meta/AiSensy webhook challenge handshake)
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (challenge) {
    console.log('✅ Webhook handshake verified with challenge:', challenge);
    return res.status(200).send(challenge);
  }

  res.status(200).json({ status: 'ok', message: 'AiSensy Webhook endpoint is live!' });
});

/**
 * Handle incoming webhooks from AiSensy
 */
router.post('/', async (req, res) => {
  // Always return 200 OK immediately so WhatsApp/AiSensy doesn't retry/timeout
  res.status(200).json({ received: true });

  try {
    const payload = req.body;
    console.log('\n📥 Incoming Webhook payload:', JSON.stringify(payload, null, 2));

    // Parse sender and message content across different formats (Meta standard & AiSensy custom)
    let senderPhone = null;
    let senderName = 'WhatsApp Lead';
    let messageText = '';
    let messageType = 'text';

    // Format 1: Meta Cloud API style (entry[0].changes[0].value)
    if (payload.entry && payload.entry[0]?.changes && payload.entry[0].changes[0]?.value) {
      const val = payload.entry[0].changes[0].value;
      const contact = val.contacts && val.contacts[0];
      const message = val.messages && val.messages[0];

      if (contact) {
        senderPhone = contact.wa_id;
        senderName = contact.profile?.name || senderName;
      }

      if (message) {
        senderPhone = senderPhone || message.from;
        messageType = message.type || 'text';

        if (message.type === 'text') {
          messageText = message.text?.body || '';
        } else if (message.type === 'button') {
          messageText = message.button?.text || message.button?.payload || '';
        } else if (message.type === 'interactive') {
          messageText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
        }
      }
    } 
    // Format 2: AiSensy standard event format
    else if (payload.data || payload.sender || payload.message) {
      const sender = payload.sender || payload.data?.sender || {};
      const msg = payload.message || payload.data?.message || {};

      senderPhone = sender.phone || sender.wa_id || payload.phone || payload.destination;
      senderName = sender.name || payload.userName || senderName;

      messageText = msg.text || msg.body || msg.buttonText || payload.text || '';
      messageType = msg.type || 'text';
    }

    if (!senderPhone && !messageText) {
      console.log('ℹ️ Webhook received without message/sender details (possibly a status update).');
      return;
    }

    console.log(`📱 Processed message from ${senderName} (${senderPhone}): "${messageText}" [type: ${messageType}]`);

    const lower = messageText.trim().toLowerCase();

    // 1. SCHEDULE A CALL
    if (lower.includes('schedule a call') || lower.includes('schedule') || lower.includes('call')) {
      const lead = storage.saveLead({
        name: senderName,
        phone: senderPhone,
        action: 'SCHEDULE_A_CALL',
        details: 'Clicked "Schedule a Call" button',
        notes: `Customer requested a call via WhatsApp`
      });

      console.log('📞 Lead action: SCHEDULE_A_CALL saved:', lead.id);

      await aisensy.notifyAdmin({
        leadName: senderName,
        phone: senderPhone,
        action: 'Schedule a Call Request',
        details: `Customer clicked "Schedule a Call" for Smart Stay`
      });
    }

    // 2. CHECK ELIGIBILITY / CUSTOMER FORM
    else if (lower.includes('check eligibility') || lower.includes('eligibility') || lower.includes('eligible')) {
      const formUrl = `${config.urls.baseUrl}/eligibility.html?phone=${encodeURIComponent(senderPhone)}&name=${encodeURIComponent(senderName)}`;

      const lead = storage.saveLead({
        name: senderName,
        phone: senderPhone,
        action: 'CHECK_ELIGIBILITY',
        details: 'Clicked "Check Eligibility" button',
        formUrl: formUrl
      });

      console.log('📋 Lead action: CHECK_ELIGIBILITY saved:', lead.id);

      await aisensy.notifyAdmin({
        leadName: senderName,
        phone: senderPhone,
        action: 'Eligibility Check Started',
        details: `Customer opened Eligibility Form`
      });
    }

    // 3. KNOW MORE / BROCHURE
    else if (lower.includes('know more') || lower.includes('more info') || lower.includes('brochure')) {
      const lead = storage.saveLead({
        name: senderName,
        phone: senderPhone,
        action: 'KNOW_MORE',
        details: 'Clicked "Know More" button'
      });

      console.log('📖 Lead action: KNOW_MORE saved:', lead.id);

      await aisensy.notifyAdmin({
        leadName: senderName,
        phone: senderPhone,
        action: 'Know More Brochure Request',
        details: `Customer requested brochure / more info`
      });
    }

    // 4. GENERAL INQUIRY / OTHER TEXT
    else if (messageText) {
      storage.saveLead({
        name: senderName,
        phone: senderPhone,
        action: 'INBOUND_MESSAGE',
        details: messageText
      });
    }

  } catch (error) {
    console.error('❌ Error handling webhook:', error);
  }
});

module.exports = router;

