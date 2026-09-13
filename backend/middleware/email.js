const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Some hosts/networks resolve smtp.gmail.com to an IPv6 address but
    // don't actually have working outbound IPv6 routing, which fails with
    // "ECONNREFUSED <ipv6 address>" even though the credentials/config are
    // fine. Forcing IPv4 avoids that class of failure.
    family: 4,
    // Some campus/corporate networks run SSL-inspecting proxies that swap
    // in their own certificate, which fails strict TLS validation with
    // "self-signed certificate in certificate chain". This is a network
    // issue, not a Gmail issue. Disabling strict validation here is a
    // pragmatic workaround for local development on such networks — if
    // you deploy this to a real server (not a restrictive campus/office
    // network), it's safe to remove the `tls` block below entirely.
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendApprovalEmail = async (to, itemName, type) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Lost & Found Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject: `✅ Your ${type} item report has been approved`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0f0f1a; color: #fff; padding: 30px; border-radius: 10px;">
          <h1 style="color: #6366f1;">Lost & Found Campus Portal</h1>
          <h2 style="color: #a5b4fc;">Your report has been approved!</h2>
          <p>Your report for <strong style="color: #818cf8;">"${itemName}"</strong> has been approved and is now live on the portal.</p>
          <p style="color: #94a3b8;">If your item is found/matches, we will notify you immediately.</p>
          <hr style="border-color: #2d2d4a;" />
          <p style="color: #64748b; font-size: 12px;">Lost & Found Campus Portal - Helping reunite lost items with their owners.</p>
        </div>
      `
    });
    console.log(`✉️ Approval email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

const sendMatchEmail = async (to, lostItemName, foundDescription) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Lost & Found Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🎯 Potential Match Found for "${lostItemName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0f0f1a; color: #fff; padding: 30px; border-radius: 10px;">
          <h1 style="color: #6366f1;">Lost & Found Campus Portal</h1>
          <h2 style="color: #34d399;">🎯 We found a potential match!</h2>
          <p>Great news! A found item may match your lost item <strong style="color: #818cf8;">"${lostItemName}"</strong>.</p>
          <div style="background: #1e1e3a; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
            <p><strong>Found Item Description:</strong></p>
            <p style="color: #a5b4fc;">${foundDescription}</p>
          </div>
          <p>Please visit <strong>Room No 405</strong> or contact the campus Lost & Found office to verify and collect your item.</p>
          <p><strong>Contact:</strong> lostfound@college.edu</p>
          <hr style="border-color: #2d2d4a;" />
          <p style="color: #64748b; font-size: 12px;">Lost & Found Campus Portal</p>
        </div>
      `
    });
    console.log(`✉️ Match email sent to ${to}`);
  } catch (err) {
    console.error('Match email send error:', err.message);
  }
};

const sendRejectionEmail = async (to, itemName, type, reason) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Lost & Found Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Update on your ${type} item report`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background: #fafafa; color: #1a1a2e; padding: 30px; border-radius: 12px; max-width: 480px; margin: 0 auto;">
          <h1 style="color: #b8860b; font-size: 20px;">Lost & Found Campus Portal</h1>
          <h2 style="color: #1a1a2e; font-size: 16px;">Your report was not approved</h2>
          <p>Your report for <strong>"${itemName}"</strong> could not be approved${reason ? `: ${reason}` : '.'}</p>
          <p style="color: #6b7280; font-size: 13px;">If you believe this was a mistake, please contact the campus Lost &amp; Found office or submit a new report with more details.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 11px;">Lost & Found Campus Portal</p>
        </div>
      `
    });
    console.log(`✉️ Rejection email sent to ${to}`);
  } catch (err) {
    console.error('Rejection email send error:', err.message);
  }
};

const isOtpDevMode = () => process.env.OTP_DEV_MODE === 'true';

const sendOtpEmail = async (to, otp) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      if (isOtpDevMode()) console.log(`📧 OTP for ${to}: [dev mode — email not configured]`);
      return;
    }
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Lost & Found Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Email Verification — Lost & Found Portal',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background: #fafafa; color: #1a1a2e; padding: 40px 32px; border-radius: 12px; max-width: 480px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #b8860b; font-size: 22px; margin: 0;">Lost & Found Portal</h1>
          </div>
          <h2 style="color: #1a1a2e; font-size: 18px; margin-bottom: 12px;">Email Verification</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Use the following One-Time Password to verify your email address:
          </p>
          <div style="background: #fff; border: 2px solid #d4af37; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 0.3em; color: #b8860b; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #4b5563; font-size: 13px; line-height: 1.6; margin-bottom: 8px;">
            This OTP is valid for 5 minutes. For your security, do not share this code with anyone.
          </p>
          <p style="color: #4b5563; font-size: 13px; line-height: 1.6;">
            If you did not request this verification, you may safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Lost &amp; Found Portal Team</p>
        </div>
      `,
    });
    console.log(`✉️ OTP email sent to ${to}`);
  } catch (err) {
    console.error('OTP email send error:', err.message);
    if (isOtpDevMode()) console.log(`📧 Fallback OTP for ${to}: [check devOtp in API response — dev mode only]`);
  }
};

module.exports = { sendApprovalEmail, sendRejectionEmail, sendMatchEmail, sendOtpEmail };
