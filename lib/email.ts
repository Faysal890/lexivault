import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `Lexora <${process.env.GMAIL_USER}>`;

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  userName: string
): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Reset your Lexora password",
    html: buildResetEmailHtml(resetUrl, userName),
  });
}

export async function sendVerificationEmail(
  to: string,
  verificationUrl: string,
  userName: string
): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Verify your Lexora email",
    html: buildVerificationEmailHtml(verificationUrl, userName),
  });
}

function buildVerificationEmailHtml(verificationUrl: string, userName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:24px;padding:40px;max-width:480px;width:100%;">
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:28px;font-weight:900;color:#191c1d;">Lexora</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#191c1d;">Verify your email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;color:#424754;font-size:15px;line-height:1.6;">
              Hi ${userName},<br/><br/>
              Thanks for signing up for Lexora! Click the button below to verify your email
              address and activate your account. This link expires in <strong>24 hours</strong>.
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <a href="${verificationUrl}"
                 style="display:inline-block;background:#0058be;color:#ffffff;font-weight:700;
                        font-size:16px;padding:16px 40px;border-radius:16px;text-decoration:none;">
                Verify Email
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;color:#424754;font-size:13px;line-height:1.5;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${verificationUrl}" style="color:#0058be;word-break:break-all;">${verificationUrl}</a>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e1e3e4;padding-top:24px;color:#727785;font-size:12px;line-height:1.5;">
              If you didn't create a Lexora account, you can safely ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function buildResetEmailHtml(resetUrl: string, userName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:24px;padding:40px;max-width:480px;width:100%;">
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:28px;font-weight:900;color:#191c1d;">Lexora</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#191c1d;">Reset your password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;color:#424754;font-size:15px;line-height:1.6;">
              Hi ${userName},<br/><br/>
              We received a request to reset the password for your Lexora account.
              Click the button below to choose a new password. This link expires in
              <strong>1 hour</strong>.
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <a href="${resetUrl}"
                 style="display:inline-block;background:#0058be;color:#ffffff;font-weight:700;
                        font-size:16px;padding:16px 40px;border-radius:16px;text-decoration:none;">
                Reset Password
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;color:#424754;font-size:13px;line-height:1.5;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color:#0058be;word-break:break-all;">${resetUrl}</a>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e1e3e4;padding-top:24px;color:#727785;font-size:12px;line-height:1.5;">
              If you didn't request a password reset, you can safely ignore this email.
              Your password won't change until you click the link above and create a new one.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
