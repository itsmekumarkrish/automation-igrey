const axios = require('axios');
const config = require('../config');

/**
 * Send rich lead alert card to Google Chat space via Incoming Webhook
 */
async function sendLeadAlert(lead) {
  const webhookUrl = config.googleChat && config.googleChat.webhookUrl;

  if (!webhookUrl) {
    console.log('ℹ️ GOOGLE_CHAT_WEBHOOK_URL is not configured in .env. Skipping Google Chat notification.');
    return { success: false, reason: 'NO_WEBHOOK_URL' };
  }

  const cleanPhone = String(lead.phone || '').replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hi ${lead.name || 'there'}, thank you for submitting your Smart Stay reservation for ${lead.bhk} (${lead.budget}). Reference ID: ${lead.id}.`)}`;

  const cardPayload = {
    cardsV2: [
      {
        cardId: `lead_${lead.id || Date.now()}`,
        card: {
          header: {
            title: `🎉 New Smart Stay Lead Confirmed!`,
            subtitle: `Voucher Pass ID: ${lead.id || 'NEW'}`,
            imageUrl: 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/real_estate_agent/default/24px.svg',
            imageType: 'CIRCLE'
          },
          sections: [
            {
              header: 'Applicant Details',
              widgets: [
                {
                  decoratedText: {
                    topLabel: 'Client Name',
                    text: `<b>${lead.name || 'Not provided'}</b>`,
                    startIcon: { knownIcon: 'PERSON' }
                  }
                },
                {
                  decoratedText: {
                    topLabel: 'WhatsApp Number',
                    text: `<b>+${waPhone}</b>`,
                    startIcon: { knownIcon: 'PHONE' }
                  }
                },
                {
                  decoratedText: {
                    topLabel: 'Unit Preference',
                    text: lead.bhk || 'Not specified',
                    startIcon: { knownIcon: 'DESCRIPTION' }
                  }
                },
                {
                  decoratedText: {
                    topLabel: 'Initial Investment Budget',
                    text: lead.budget || 'Not specified',
                    startIcon: { knownIcon: 'DOLLAR' }
                  }
                },
                {
                  decoratedText: {
                    topLabel: 'Preferred Location',
                    text: lead.location || 'Bangalore',
                    startIcon: { knownIcon: 'MAP_PIN' }
                  }
                },
                {
                  decoratedText: {
                    topLabel: 'Requested Consultation Slot',
                    text: lead.preferredTime || 'Anytime',
                    startIcon: { knownIcon: 'CLOCK' }
                  }
                }
              ]
            },
            {
              widgets: [
                {
                  buttonList: {
                    buttons: [
                      {
                        text: '💬 Chat with Lead on WhatsApp',
                        onClick: {
                          openLink: {
                            url: waLink
                          }
                        }
                      },
                      {
                        text: '📞 Call Lead',
                        onClick: {
                          openLink: {
                            url: `tel:+${waPhone}`
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      }
    ]
  };

  try {
    const response = await axios.post(webhookUrl, cardPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    console.log(`✅ Google Chat lead alert sent successfully for ${lead.name} (${lead.id})`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Failed to post Google Chat lead alert:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

module.exports = {
  sendLeadAlert
};

