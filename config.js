const path = require('path');
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  aisensy: {
    apiKey: process.env.AISENSY_API_KEY || '',
    campaignName: process.env.AISENSY_CAMPAIGN_NAME || 'igrey_smart_stay_campaign',
    templateName: process.env.AISENSY_TEMPLATE_NAME || 'igrey_smart_stay_v1',
    apiUrl: 'https://backend.aisensy.com/campaign/t1/api/v2'
  },
  admin: {
    phone: process.env.ADMIN_WHATSAPP_NUMBER || ''
  },
  googleChat: {
    webhookUrl: process.env.GOOGLE_CHAT_WEBHOOK_URL || ''
  },
  urls: {
    baseUrl: process.env.SERVER_BASE_URL || 'http://localhost:3000',
    scheduleCall: process.env.SCHEDULE_CALL_URL || '/schedule.html',
    brochure: process.env.BROCHURE_URL || '/assets/smart-stay-brochure.pdf',
    eligibilityForm: process.env.ELIGIBILITY_FORM_URL || '/app.html'
  },
  paths: {
    leadsFile: path.join(__dirname, 'data', 'leads.json')
  }
};

