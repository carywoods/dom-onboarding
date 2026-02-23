const express = require('express');
const router = express.Router();
const Imap = require('imap');

function classifyImapError(err) {
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('invalid credentials') || msg.includes('authentication failed') || msg.includes('login failed') || msg.includes('bad credentials')) {
    return 'Authentication failed. Please check your username and password. If using Gmail or Microsoft 365, ensure you are using an App Password, not your regular account password.';
  }
  if (msg.includes('self signed') || msg.includes('certificate') || msg.includes('tls') || msg.includes('ssl')) {
    return 'TLS/SSL certificate error. Try toggling the TLS setting or check your host configuration.';
  }
  if (msg.includes('econnrefused')) {
    return 'Connection refused. The IMAP host rejected the connection. Check the host address and port number.';
  }
  if (msg.includes('enotfound') || msg.includes('getaddrinfo')) {
    return 'Host not found. The IMAP server address could not be resolved. Check for typos in the hostname.';
  }
  if (msg.includes('etimedout') || msg.includes('timeout')) {
    return 'Connection timed out. The server did not respond. Check the host, port, and whether your network allows outbound IMAP connections.';
  }
  if (msg.includes('econnreset')) {
    return 'Connection was reset by the server. This may be a TLS/port mismatch — try changing TLS mode or port.';
  }
  if (msg.includes('mailbox does not exist') || msg.includes('no such mailbox') || msg.includes("doesn't exist")) {
    return 'The specified mailbox folder does not exist. Try "INBOX" or check the exact folder name in your email client.';
  }
  return `Connection error: ${err.message}`;
}

function validateImapInput(body) {
  const { host, port, tls, username, password, folder } = body;
  if (!host || typeof host !== 'string' || host.trim().length === 0) return 'IMAP host is required.';
  if (!port || isNaN(parseInt(port, 10))) return 'IMAP port must be a valid integer.';
  if (typeof tls !== 'boolean') return 'TLS must be a boolean.';
  if (!username || typeof username !== 'string' || username.trim().length === 0) return 'Username is required.';
  if (!password || typeof password !== 'string' || password.length === 0) return 'Password is required.';
  return null;
}

router.post('/test-imap', (req, res) => {
  const validationError = validateImapInput(req.body);
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  const { host, port, tls, username, password, folder } = req.body;
  const mailboxFolder = (folder && typeof folder === 'string' && folder.trim()) ? folder.trim() : 'INBOX';

  const imapConfig = {
    host: host.trim(),
    port: parseInt(port, 10),
    tls: tls === true,
    user: username.trim(),
    password: password,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000,
    connTimeout: 15000,
  };

  let responded = false;
  const imap = new Imap(imapConfig);

  const finish = (successMsg, errorMsg) => {
    if (responded) return;
    responded = true;
    try { imap.destroy(); } catch (_) {}
    if (successMsg) {
      return res.json({ success: true, message: successMsg });
    }
    return res.status(400).json({ success: false, error: errorMsg });
  };

  imap.once('ready', () => {
    imap.openBox(mailboxFolder, true, (err, box) => {
      if (err) {
        finish(null, classifyImapError(err));
      } else {
        finish(`Successfully connected and opened "${mailboxFolder}" (${box.messages.total} message(s) found).`, null);
      }
    });
  });

  imap.once('error', (err) => {
    finish(null, classifyImapError(err));
  });

  imap.once('end', () => {
    finish(null, 'Connection ended unexpectedly.');
  });

  imap.connect();
});

module.exports = router;
