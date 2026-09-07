import nodemailer from 'nodemailer';

/**
 * Sends welcome email to newly created user with their generated credentials.
 * If SMTP environment variables are set, sends real email via Nodemailer.
 * Otherwise logs full email details to console for demonstration/development.
 */
export const sendWelcomeEmail = async ({ name, username, email, password, role }) => {
  const mailSubject = 'Welcome to SIIIMS - Your Account Credentials';
  const mailBodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1e3a8a;">Welcome to OSTA - SIIIMS Platform</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>An official user account has been created for you on the <strong>State Integrated Information & Infrastructure Management System (SIIIMS)</strong>.</p>

      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Username:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 1.1em;">${username}</code></p>
        <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 1.1em;">${password}</code></p>
        <p style="margin: 5px 0;"><strong>Assigned Role:</strong> ${role}</p>
      </div>

      <p style="color: #d97706; font-size: 0.9em;">⚠️ Please log in to the portal and change your password upon your first access.</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 0.8em; text-align: center;">Oromia Science & Technology Authority (OSTA) - ICT Operations & Infrastructure Directorate</p>
    </div>
  `;

  // Check if SMTP configuration exists in environment
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"SIIIMS Security System" <${process.env.SMTP_FROM || smtpUser}>`,
        to: email,
        subject: mailSubject,
        html: mailBodyHtml,
      });

      console.log(`[EmailService] Welcome email sent successfully to ${email}`);
      return { success: true, method: 'smtp' };
    } catch (err) {
      console.error(`[EmailService] Failed to send email via SMTP:`, err.message);
    }
  }

  // Fallback log to console if no SMTP configured
  console.log('\n=================== [EMAIL DISPATCH LOG] ===================');
  console.log(`TO: ${email}`);
  console.log(`SUBJECT: ${mailSubject}`);
  console.log(`USERNAME: ${username}`);
  console.log(`PASSWORD: ${password}`);
  console.log('============================================================\n');

  return { success: true, method: 'console_fallback' };
};

export const sendTicketReminderEmail = async ({ name, email, ticketNo, title, status, message }) => {
  const subject = `SIIIMS ticket reminder: ${ticketNo}`;
  const body = `Hello ${name},\n\nTicket ${ticketNo} (${title}) is currently ${status}.\n\n${message}\n\nPlease sign in to SIIIMS and update the ticket.`;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465,
        auth: { user: smtpUser, pass: smtpPass }
      });
      await transporter.sendMail({
        from: `"SIIIMS Helpdesk" <${process.env.SMTP_FROM || smtpUser}>`,
        to: email,
        subject,
        text: body
      });
      return { success: true, method: 'smtp' };
    } catch (error) {
      console.error('[EmailService] Failed to send ticket reminder:', error.message);
    }
  }

  console.log(`\n[HELPDESK REMINDER] TO: ${email}\nSUBJECT: ${subject}\n${body}\n`);
  return { success: true, method: 'console_fallback' };
};
