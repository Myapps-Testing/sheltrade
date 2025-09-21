# Email Templates for Sheltrade

This folder contains professional HTML email templates designed for the Sheltrade fintech platform. All templates are responsive and compatible with major email clients.

## Templates Included

### 1. Base Template (`base-template.html`)
- Foundation template with placeholders for content
- Consistent header, footer, and styling
- Use this as a starting point for custom emails

### 2. Welcome Email (`welcome-email.html`)
- Sent to new users after successful registration
- Includes feature overview and call-to-action
- Variables: `{{USER_NAME}}`, `{{DASHBOARD_URL}}`

### 3. Email Verification (`email-verification.html`)
- Confirms user email address during registration
- Security-focused messaging with clear instructions
- Variables: `{{USER_NAME}}`, `{{VERIFICATION_URL}}`

### 4. Transaction Confirmation (`transaction-confirmation.html`)
- Confirms successful transactions with detailed breakdown
- Professional layout with transaction details table
- Variables: `{{USER_NAME}}`, `{{TRANSACTION_ID}}`, `{{TRANSACTION_TYPE}}`, `{{AMOUNT}}`, `{{DATE_TIME}}`, `{{DASHBOARD_URL}}`, `{{TRANSACTION_URL}}`

### 5. Password Reset (`password-reset.html`)
- Secure password reset functionality
- Includes security warnings and best practices
- Variables: `{{USER_NAME}}`, `{{RESET_URL}}`

## Template Variables

Replace these placeholders with actual data when sending emails:

- `{{USER_NAME}}` - User's display name
- `{{DASHBOARD_URL}}` - Link to user dashboard
- `{{VERIFICATION_URL}}` - Email verification link
- `{{RESET_URL}}` - Password reset link
- `{{TRANSACTION_ID}}` - Unique transaction identifier
- `{{TRANSACTION_TYPE}}` - Type of transaction (Deposit, Withdrawal, etc.)
- `{{AMOUNT}}` - Transaction amount with currency
- `{{DATE_TIME}}` - Transaction date and time
- `{{TRANSACTION_URL}}` - Link to specific transaction details

## Usage with Email Services

### Resend Integration
These templates work perfectly with Resend's email API. Example usage:

```javascript
const emailResponse = await resend.emails.send({
  from: "Sheltrade <noreply@sheltrade.com>",
  to: [userEmail],
  subject: "Welcome to Sheltrade!",
  html: welcomeEmailTemplate
    .replace("{{USER_NAME}}", userName)
    .replace("{{DASHBOARD_URL}}", dashboardUrl),
});
```

### Supabase Edge Functions
Use these templates in Supabase Edge Functions for automated email sending:

```typescript
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Load and customize template
const emailHtml = welcomeTemplate
  .replace("{{USER_NAME}}", user.name)
  .replace("{{DASHBOARD_URL}}", `${origin}/dashboard`);

await resend.emails.send({
  from: "Sheltrade <onboarding@sheltrade.com>",
  to: [user.email],
  subject: "Welcome to Sheltrade!",
  html: emailHtml,
});
```

## Design Features

- **Responsive Design**: Works on all devices and screen sizes
- **Email Client Compatibility**: Tested with Gmail, Outlook, Apple Mail, etc.
- **Inline CSS**: All styles are inline for maximum compatibility
- **Professional Branding**: Consistent with Sheltrade's visual identity
- **Security Focused**: Clear messaging for security-related actions
- **Accessibility**: High contrast colors and readable fonts

## Customization

To customize these templates:

1. Update the logo URL in the header section
2. Modify colors to match your brand palette
3. Adjust content and messaging as needed
4. Test with different email clients before deploying

## Best Practices

- Always use HTTPS links for security
- Include unsubscribe links in promotional emails
- Keep subject lines under 50 characters
- Test templates with real data before production use
- Monitor email deliverability and engagement metrics

## Security Considerations

- Never include sensitive information in emails
- Use secure, time-limited links for password resets
- Implement proper DKIM and SPF records for your domain
- Monitor for suspicious email activity