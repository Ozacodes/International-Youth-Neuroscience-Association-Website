const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const resend = new Resend('re_7sfbEAvG_L7SocJ4x2rhLntPRoU7vNt5f'); // <-- Replace with your key

// In-memory store for demo (replace with DB in production)
const pendingVerifications = {};

app.post('/api/chapter-registration', async (req, res) => {
  const { name, email, school, chapterName } = req.body;
  if (!name || !email || !school || !chapterName) {
    return res.status(400).json({ error: 'All fields required.' });
  }

  // Generate a simple verification token
  const token = Math.random().toString(36).substring(2, 15);

  // Store pending registration (replace with DB in production)
  pendingVerifications[token] = { name, email, school, chapterName, verified: false };

  // Send verification email
  const verifyUrl = `http://localhost:3000/api/verify-email?token=${token}`;
  try {
    await resend.emails.send({
      from: 'IYNA <n.thamakaison@gmail.com>', // Use your verified domain
      to: email,
      subject: 'Verify your email for IYNA Chapter Registration',
      html: `<p>Hi ${name},</p>
        <p>Thank you for registering a new chapter. Please verify your email by clicking the link below:</p>
        <p><a href="${verifyUrl}">Verify Email</a></p>
        <p>If you did not request this, you can ignore this email.</p>`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send verification email.' });
  }
});

app.get('/api/verify-email', (req, res) => {
  const { token } = req.query;
  const registration = pendingVerifications[token];
  if (!registration) {
    return res.status(400).send('Invalid or expired token.');
  }
  registration.verified = true;
  // Here, you would move the registration to your main DB for admin review
  res.send('Email verified! Your chapter registration is now pending admin review.');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});