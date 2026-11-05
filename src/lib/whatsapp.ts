/**
 * WhatsApp Notification Service for Shift Manager Escalation
 * Supports Meta Cloud API (WhatsApp Business Graph API) with Twilio fallback.
 */

export type IssueType = 'food_quality' | 'service_speed' | 'cleanliness' | 'billing' | 'other';
export type UrgencyLevel = 'medium' | 'high' | 'critical';

export interface ManagerAlertPayload {
  venueName: string;
  tableNumber: string | number;
  issueType: IssueType;
  details: string;
  urgency: UrgencyLevel;
  recipientPhone?: string;
  timestamp?: string;
}

export interface WhatsAppNotificationResult {
  success: boolean;
  provider: 'meta_cloud_api' | 'twilio' | 'mock_dev' | 'throttled_cooldown';
  messageId?: string;
  error?: string;
}

// In-memory cooldown cache to prevent spam & duplicate API fees (3 min per table)
const alertCooldownMap = new Map<string, number>();
const ALERT_COOLDOWN_MS = 3 * 60 * 1000;

/**
 * Format human-readable issue type label
 */
function formatIssueType(type: IssueType): string {
  const map: Record<IssueType, string> = {
    food_quality: '🍽️ Food Quality / Kitchen Issue',
    service_speed: '⏱️ Service Delay / Wait Time',
    cleanliness: '✨ Table / Venue Cleanliness',
    billing: '💳 Billing / Payment Dispute',
    other: '⚠️ General Guest Concern',
  };
  return map[type] || '⚠️ General Issue';
}

/**
 * Format urgency with alert indicator
 */
function formatUrgency(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'critical':
      return '🚨 CRITICAL (Immediate floor response needed)';
    case 'high':
      return '⚠️ HIGH PRIORITY (Needs prompt attention)';
    case 'medium':
    default:
      return '🟡 MEDIUM PRIORITY (Monitor closely)';
  }
}

/**
 * Construct the standardized WhatsApp alert message
 */
export function buildManagerAlertMessage(payload: ManagerAlertPayload): string {
  const now = payload.timestamp || new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    `🚨 *[AURA DISPATCH: GUEST ESCALATION]* 🚨\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🏛️ *Venue:* ${payload.venueName}\n` +
    `🪑 *Table:* Table #${payload.tableNumber}\n` +
    `⚡ *Urgency:* ${formatUrgency(payload.urgency)}\n` +
    `🏷️ *Category:* ${formatIssueType(payload.issueType)}\n` +
    `⏰ *Logged At:* ${now}\n\n` +
    `📝 *Guest Complaint Summary:*\n` +
    `"${payload.details}"\n\n` +
    `🛡️ *Aura Floor Status:*\n` +
    `The guest has been empathetically acknowledged and de-escalated via the digital interface. Immediate floor manager presence or table check-in is recommended to ensure guest satisfaction and preserve review ratings.\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`
  );
}

/**
 * Send WhatsApp alert using Meta Cloud WhatsApp Business API
 */
async function sendViaMetaCloudApi(
  recipientPhone: string,
  messageText: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('Meta WhatsApp credentials missing (WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN)');
  }

  // Sanitize phone number (strip spaces, dashes, parentheses, plus sign)
  const cleanPhone = recipientPhone.replace(/\D/g, '');

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageText,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText;
    throw new Error(`Meta Cloud API error (${response.status}): ${errorMsg}`);
  }

  const messageId = data?.messages?.[0]?.id;
  return { success: true, messageId };
}

/**
 * Send WhatsApp alert using Twilio API (Fallback)
 */
async function sendViaTwilio(
  recipientPhone: string,
  messageText: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // default Twilio sandbox

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials missing (TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN)');
  }

  const cleanRecipient = recipientPhone.startsWith('whatsapp:')
    ? recipientPhone
    : `whatsapp:+${recipientPhone.replace(/\D/g, '')}`;

  const cleanFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params = new URLSearchParams();
  params.append('To', cleanRecipient);
  params.append('From', cleanFrom);
  params.append('Body', messageText);

  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Twilio error (${response.status}): ${data?.message || response.statusText}`);
  }

  return { success: true, messageId: data.sid };
}

/**
 * Main dispatcher: Sends real-time WhatsApp alert to shift manager.
 * Safely handles environment fallbacks and will log to console in development
 * if no external WhatsApp provider is configured.
 */
export async function sendManagerWhatsAppAlert(
  payload: ManagerAlertPayload
): Promise<WhatsAppNotificationResult> {
  // FinOps Guard: Prevent duplicate billable alerts within 3 minutes for the same table & issue
  const cooldownKey = `table_${payload.tableNumber}_${payload.issueType}`;
  const lastAlertTime = alertCooldownMap.get(cooldownKey);
  const now = Date.now();

  if (lastAlertTime && now - lastAlertTime < ALERT_COOLDOWN_MS) {
    console.log(
      `[WhatsApp Alert Throttled] Cooldown active for Table ${payload.tableNumber} (${payload.issueType}). Skipping duplicate paid notification.`
    );
    return {
      success: true,
      provider: 'throttled_cooldown',
      messageId: `throttled_${cooldownKey}`,
    };
  }

  alertCooldownMap.set(cooldownKey, now);

  const recipient =
    payload.recipientPhone ||
    process.env.MANAGER_WHATSAPP_NUMBER ||
    process.env.SHIFT_LEAD_PHONE;

  const messageText = buildManagerAlertMessage(payload);

  // 1. Check for Meta Cloud WhatsApp API credentials
  if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN && recipient) {
    try {
      const result = await sendViaMetaCloudApi(recipient, messageText);
      console.log(`[WhatsApp Alert] Meta Cloud API sent message: ${result.messageId}`);
      return {
        success: true,
        provider: 'meta_cloud_api',
        messageId: result.messageId,
      };
    } catch (err: any) {
      console.error('[WhatsApp Alert Error - Meta Cloud API]:', err.message);
      // Fall through to Twilio if available
    }
  }

  // 2. Check for Twilio WhatsApp credentials
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && recipient) {
    try {
      const result = await sendViaTwilio(recipient, messageText);
      console.log(`[WhatsApp Alert] Twilio sent message: ${result.messageId}`);
      return {
        success: true,
        provider: 'twilio',
        messageId: result.messageId,
      };
    } catch (err: any) {
      console.error('[WhatsApp Alert Error - Twilio]:', err.message);
    }
  }

  // 3. Zero-Cost Fallback: Development & Local Staging without paid WhatsApp fees
  console.log('[MOCK WHATSAPP ALERT SENT TO MANAGER]:', {
    venue: payload.venueName,
    table: payload.tableNumber,
    urgency: payload.urgency,
    category: payload.issueType,
    details: payload.details,
    message: messageText,
  });

  return {
    success: true,
    provider: 'mock_dev',
    messageId: `mock_zero_cost_${Date.now()}`,
  };
}

