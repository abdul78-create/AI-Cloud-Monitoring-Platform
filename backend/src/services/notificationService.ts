import { FiredAlert } from "./alertEngineService";

/**
 * Notification Service
 * Mocks the delivery of alerts to external channels (Slack, Discord, PagerDuty, Webhooks).
 * In a real environment, this would use axios to hit external APIs.
 */

export async function deliverAlertNotification(alert: FiredAlert): Promise<void> {
  const promises = alert.channels.map(channel => deliverToChannel(channel, alert));
  await Promise.all(promises);
}

async function deliverToChannel(channel: string, alert: FiredAlert): Promise<void> {
  // Simulate network latency
  await new Promise(r => setTimeout(r, Math.random() * 500 + 200));

  const payload = formatPayload(channel, alert);
  
  // Mock delivery
  console.log(`[NOTIFICATION] Delivered to ${channel.toUpperCase()} - Alert: ${alert.ruleName} [${alert.severity.toUpperCase()}]`);
}

function formatPayload(channel: string, alert: FiredAlert): any {
  const title = `[${alert.severity.toUpperCase()}] ${alert.ruleName} on ${alert.affectedService}`;
  const text = alert.message;

  switch (channel) {
    case "slack":
      return {
        text: title,
        blocks: [
          { type: "header", text: { type: "plain_text", text: title } },
          { type: "section", text: { type: "mrkdwn", text: `*Service:* ${alert.affectedService}\n*Value:* ${alert.currentValue}\n*Threshold:* ${alert.threshold}` } },
          { type: "section", text: { type: "mrkdwn", text: text } }
        ]
      };
    case "discord":
      return {
        content: title,
        embeds: [{
          title: title,
          description: text,
          color: alert.severity === "critical" ? 15158332 : 16776960,
          fields: [
            { name: "Service", value: alert.affectedService, inline: true },
            { name: "Metric Value", value: alert.currentValue.toString(), inline: true }
          ]
        }]
      };
    case "pagerduty":
      return {
        routing_key: "MOCK_ROUTING_KEY",
        event_action: "trigger",
        payload: {
          summary: title,
          severity: alert.severity,
          source: alert.affectedService,
          custom_details: { message: text, value: alert.currentValue }
        }
      };
    case "webhook":
    default:
      return {
        event: "alert_fired",
        timestamp: new Date().toISOString(),
        alert
      };
  }
}
