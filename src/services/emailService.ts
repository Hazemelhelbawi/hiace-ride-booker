// Email service stub for Strapi migration
// In a production environment, you would implement email sending through:
// 1. Strapi email plugin (strapi-plugin-email)
// 2. External service like SendGrid, Mailgun, etc.
// 3. Custom Strapi webhook

export const sendBookingEmail = async (bookingId: string | number): Promise<boolean> => {
  try {
    console.log(`Email service: Would send email for booking ${bookingId}`);
    // TODO: Implement actual email sending via Strapi or external service
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
