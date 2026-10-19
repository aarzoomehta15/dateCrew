/**
 * Email Adapter — Mock email service for MVP
 * 
 * Simulates sending match introduction emails.
 * Designed to be replaced with a real provider (SendGrid, SES, etc.) later.
 */

/**
 * Send a mock match introduction email
 * Returns a mock result without actually sending
 */
export async function sendMatchIntroduction({ customer, candidate, introductionMessage, matchmaker }) {
  const recipient = customer.email || `${customer.firstName.toLowerCase()}@example.com`;
  const subject = `A potential match from The Date Crew — ${candidate.firstName}`;

  const emailBody = `Dear ${customer.firstName},

${introductionMessage}

---
This introduction was curated by your personal matchmaker, ${matchmaker.name}.
The Date Crew | Professional Matchmaking Services

Note: This is a mock email preview. No actual email was sent.`;

  // Simulate email sending (in production, replace with actual provider)
  const result = {
    success: true,
    mock: true,
    preview: {
      to: recipient,
      subject,
      body: emailBody,
      from: 'matchmaker@thedatecrew.com',
    },
    sentAt: new Date().toISOString(),
    message: 'Mock email generated successfully. No real email was delivered.',
  };

  console.log(`[Mock Email] To: ${recipient} | Subject: ${subject}`);
  return result;
}
