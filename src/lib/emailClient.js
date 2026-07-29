import emailjs from '@emailjs/browser';

/**
 * Sends an automated email using EmailJS.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} toName - The recipient's name.
 * @param {string} subject - The subject of the email.
 * @param {string} message - The main content of the email.
 */
export async function sendEmail(toEmail, toName, subject, message) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS is not configured. Missing environment variables.');
    console.log(`[EMAIL MOCK] To: ${toEmail} | Subject: ${subject} | Message: ${message}`);
    return;
  }

  try {
    const templateParams = {
      to_email: toEmail,
      to_name: toName || 'Student',
      subject: subject,
      message: message,
    };

    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log('Email sent successfully:', response.status, response.text);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
