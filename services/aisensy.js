const axios = require('axios');
const config = require('../config');

/**
 * Send an approved WhatsApp template via AiSensy API
 */
async function sendTemplateMessage({ destination, userName = 'Valued Client', templateParams = [], media = null, tags = ['SmartStayLead'] }) {
  if (!config.aisensy.apiKey) {
    console.warn('⚠️ AISENSY_API_KEY is not set in .env. Skipping API call.');
    return { success: false, reason: 'NO_API_KEY' };
  }

  // Format destination (ensure 10-12 digits without symbols)
  let cleanNumber = String(destination).replace(/[^0-9]/g, '');
  if (cleanNumber.length === 10) {
    cleanNumber = '91' + cleanNumber; // default to India code if 10 digits
  }
  if (!cleanNumber.startsWith('+')) {
    cleanNumber = '+' + cleanNumber;
  }

  const payload = {
    apiKey: config.aisensy.apiKey,
    campaignName: config.aisensy.campaignName,
    destination: cleanNumber,
    userName: userName || 'Customer',
    source: 'iGrey Smart Stay Automation',
    templateParams: templateParams,
    tags: tags
  };

  if (media && media.url) {
    payload.media = {
      url: media.url,
      filename: media.filename || 'banner.jpg'
    };
  }

  try {
    const response = await axios.post(config.aisensy.apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ AiSensy Template sent to ${cleanNumber}:`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ Failed to send AiSensy template to ${cleanNumber}:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Notify the sales/admin team on WhatsApp about a new lead or action
 */
async function notifyAdmin({ leadName, phone, action, details = '' }) {
  if (!config.admin.phone) {
    console.log(`ℹ️ [Internal Lead Alert]: ${action} from ${leadName} (${phone}) - ${details}`);
    return;
  }

  console.log(`🔔 Sending alert to Admin (${config.admin.phone}): ${action} from ${leadName} (${phone})`);

  // Optionally trigger an admin template if configured, or log
  try {
    await sendTemplateMessage({
      destination: config.admin.phone,
      userName: 'iGrey Admin',
      templateParams: [leadName, phone, action, details],
      tags: ['AdminAlert']
    });
  } catch (err) {
    console.error('Error notifying admin:', err.message);
  }
}

module.exports = {
  sendTemplateMessage,
  notifyAdmin
};

