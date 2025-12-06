import nodemailer from 'nodemailer';

// Create transporter with Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD // Your Gmail App Password
    }
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, userName = 'User') => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email credentials not configured in .env file')
      return { 
        success: false, 
        error: 'Email service not configured. Please add EMAIL_USER and EMAIL_PASSWORD to .env file' 
      }
    }

    console.log('📧 Attempting to send OTP email to:', email)
    console.log('📧 Using sender email:', process.env.EMAIL_USER)

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Virtual Assistant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - Virtual Assistant',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #0ea5e9;
              margin-bottom: 30px;
            }
            .otp-box {
              background-color: #0ea5e9;
              color: white;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 20px 0;
            }
            .info {
              background-color: #fef3c7;
              padding: 15px;
              border-left: 4px solid #f59e0b;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              
              <p>Hello ${userName},</p>
              
              <p>We received a request to reset your password for your Virtual Assistant account. Use the OTP below to verify your identity:</p>
              
              <div class="otp-box">
                ${otp}
              </div>
              
              <div class="info">
                <strong>⏰ Important:</strong> This OTP is valid for <strong>10 minutes</strong> only.
              </div>
              
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <p>For security reasons:</p>
              <ul>
                <li>Never share this OTP with anyone</li>
                <li>We will never ask for your OTP via phone or email</li>
                <li>The OTP can only be used once</li>
              </ul>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>&copy; 2025 Virtual Assistant. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', email)
    console.log('✅ Message ID:', info.messageId)
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message)
    if (error.code === 'EAUTH') {
      console.error('❌ Authentication failed. Please check:')
      console.error('   1. EMAIL_USER is correct')
      console.error('   2. EMAIL_PASSWORD is a Gmail App Password (not regular password)')
      console.error('   3. 2-Step Verification is enabled on your Google account')
      console.error('   4. Generate App Password at: https://myaccount.google.com/apppasswords')
    }
    return { success: false, error: error.message };
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, userName = 'User') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Virtual Assistant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Successful - Virtual Assistant',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #10b981;
              margin-bottom: 30px;
            }
            .success-icon {
              font-size: 64px;
              text-align: center;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="success-icon">✅</div>
              <div class="header">
                <h1>Password Reset Successful</h1>
              </div>
              
              <p>Hello ${userName},</p>
              
              <p>Your password has been successfully reset. You can now sign in to your Virtual Assistant account using your new password.</p>
              
              <p>If you did not make this change, please contact our support team immediately.</p>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>&copy; 2025 Virtual Assistant. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Confirmation email failed:', error);
    return { success: false, error: error.message };
  }
};

export default { sendOTPEmail, sendPasswordResetConfirmation };
