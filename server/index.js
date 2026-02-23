const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const imapRoutes = require('./routes/imap');
const submitRoutes = require('./routes/submit');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    credentials: true,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

app.use('/api', imapRoutes);
app.use('/api', submitRoutes);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`DOM Onboarding server running on http://localhost:${PORT}`);
  const outputDir = process.env.DOM_ONBOARDING_OUTPUT_DIR || path.join(process.cwd(), 'onboarding_output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  }
});
