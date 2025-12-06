# Email Setup Guide for OTP Functionality

## Gmail App Password Setup

To enable email sending for OTP verification, you need to set up a Gmail App Password:

### Step 1: Enable 2-Step Verification
1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google," find **2-Step Verification**
4. Click on it and follow the steps to enable it

### Step 2: Generate App Password
1. After enabling 2-Step Verification, go back to **Security**
2. Under "Signing in to Google," find **App passwords**
3. Click on it (you may need to sign in again)
4. Select app: **Mail**
5. Select device: **Other (Custom name)** - enter "Virtual Assistant"
6. Click **Generate**
7. Copy the 16-character password (remove spaces)

### Step 3: Update .env File
Open `server/.env` and update these values:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
```

**Example:**
```env
EMAIL_USER=sanaarshad1209@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Step 4: Restart Server
After updating the `.env` file, restart your server:
```bash
cd server
npm run dev
```

## Testing
1. Go to the **Forgot Password** page
2. Enter your email address
3. Click **Send OTP**
4. Check your email inbox for the OTP
5. Enter the OTP on the verification page

## Troubleshooting

### Email not received?
- Check your spam/junk folder
- Verify EMAIL_USER and EMAIL_PASSWORD are correct in .env
- Make sure 2-Step Verification is enabled
- Try generating a new App Password
- Check server console for error messages

### Common Errors

**"Invalid login: 535-5.7.8 Username and Password not accepted"**
- Solution: Generate a new App Password and update .env

**"self signed certificate in certificate chain"**
- Solution: This is usually a network/firewall issue. Try using a different network.

**OTP still showing in console instead of email**
- If email sending fails, the system falls back to showing OTP in console
- Check the server logs for email error details

## Alternative Email Services

If you don't want to use Gmail, you can modify `server/config/email.js` to use:
- **SendGrid**: Professional email service with better deliverability
- **AWS SES**: Amazon's email service
- **Mailgun**: Developer-friendly email API
- **Outlook/Hotmail**: Similar to Gmail setup

## Security Notes
- Never commit your actual email password to Git
- Use environment variables for sensitive data
- App Passwords are safer than using your main Gmail password
- You can revoke App Passwords anytime from Google Account settings

## Production Recommendations
1. Use a dedicated email service (SendGrid, AWS SES) instead of Gmail
2. Remove OTP from response body (only send via email)
3. Implement rate limiting for OTP requests
4. Add email templates for better branding
5. Enable email tracking and analytics
