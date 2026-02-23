# DOM Onboarding Wizard

A self-hosted onboarding wizard for **DOM (Digital Office Manager)** that collects IMAP connection details, validates them via a live connection test, captures 20 email classification rules, and writes all configuration to the local server filesystem.

---

## Features

- 6-step guided wizard with full validation
- Live IMAP connection test (required gate before proceeding)
- 20 configurable email classification "toast types" with recommended defaults
- Outputs a human-readable `.txt` file and a machine-readable `.json` file per onboarding run
- Multi-tenant: each run writes uniquely named files
- No external database, no Supabase, no cloud storage — all data stays on your server
- Password/secrets are never logged to console or stored in the browser

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

---

## Setup

```bash
# 1. Clone or copy the project directory
cd dom-onboarding-wizard

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment variables — see below

# 4. Run in development mode (starts both Express server and Vite dev server)
npm run dev
```

Open your browser to **http://localhost:5173** to begin onboarding.

The Express API server runs on **http://localhost:3001**.

---

## Running in Production

```bash
# Build the React frontend
npm run build

# Start the Express server (serves the built frontend + API)
NODE_ENV=production npm start
```

Open **http://localhost:3001**.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DOM_ONBOARDING_OUTPUT_DIR` | `./onboarding_output` | Directory where output files are written |
| `PORT` | `3001` | Port for the Express server |
| `NODE_ENV` | `development` | Set to `production` to serve built frontend |

---

## Where Files Are Written

After a successful onboarding submission, two files are written:

```
{DOM_ONBOARDING_OUTPUT_DIR}/
  {YYYYMMDD-HHMMSS}_{org_name}_{randomId}.txt
  {YYYYMMDD-HHMMSS}_{org_name}_{randomId}.json
```

**Example:**
```
onboarding_output/
  20240115-143022_Acme_Small_Business_LLC_eX4mPl3a.txt
  20240115-143022_Acme_Small_Business_LLC_eX4mPl3a.json
```

- Files are created with mode `0600` (owner read/write only).
- The directory is created automatically if it does not exist.
- See `/examples/` for sample output files (fake data, no real credentials).

---

## How the IMAP Test Works

The wizard's Step 3 calls `POST /api/test-imap` on the Express backend. The server:

1. Receives `host`, `port`, `tls`, `username`, `password`, and `folder` in the request body.
2. Opens an IMAP connection using the `imap` npm package.
3. Attempts to `openBox` (select the specified mailbox folder).
4. Returns a success message including the message count, or a descriptive error.

**The password is only held in memory during the test and is NOT persisted to disk until the user completes full onboarding and clicks Submit.**

Error hints are provided for common failures: wrong credentials, TLS mismatch, host unreachable, port blocked, mailbox not found.

---

## Security Considerations

### CRITICAL: Secure the Output Directory

The output files contain IMAP credentials (passwords) in plaintext. You MUST:

1. **Restrict filesystem permissions:**
   ```bash
   chmod 700 ./onboarding_output
   chmod 600 ./onboarding_output/*.txt
   chmod 600 ./onboarding_output/*.json
   ```

2. **Run the app as a dedicated non-root user** with minimal permissions.

3. **Do not expose the output directory** via any web server, NFS mount, or cloud sync service.

4. **Consider encrypting the output directory** using filesystem-level encryption (e.g., LUKS on Linux, FileVault on macOS) for sensitive deployments.

5. **Do not commit output files to version control.** The `.gitignore` excludes `onboarding_output/` by default.

6. **Rotate credentials** after onboarding if the mailbox password changes.

### Additional Security Notes

- Secrets are never written to `console.log` on client or server.
- Secrets are never stored in `localStorage` or `sessionStorage`.
- Rate limiting is applied to all `/api/` routes (50 requests per 15 minutes per IP).
- All filename components are sanitized to prevent directory traversal.
- The app uses `SameSite` cookie policy and restricts CORS to localhost in development.
- Input validation is performed on both client and server.

---

## Project Structure

```
dom-onboarding-wizard/
├── server/
│   ├── index.js              # Express app entry point
│   └── routes/
│       ├── imap.js           # POST /api/test-imap
│       └── submit.js         # POST /api/submit-onboarding
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Wizard state + step routing
│   ├── data/
│   │   └── defaultToastTypes.js  # 20 default classification categories
│   ├── steps/
│   │   ├── StepTenant.jsx        # Step 1: Organization info
│   │   ├── StepImap.jsx          # Step 2: IMAP settings
│   │   ├── StepImapTest.jsx      # Step 3: Live connection test
│   │   ├── StepToastTypes.jsx    # Step 4: 20 classification rules
│   │   ├── StepOperational.jsx   # Step 5: Operational settings
│   │   └── StepReview.jsx        # Step 6: Review & submit
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── StepCard.jsx
│   │   ├── FormField.jsx
│   │   ├── NavButtons.jsx
│   │   ├── Alert.jsx
│   │   └── SuccessScreen.jsx
│   └── styles/
│       └── global.css
├── examples/                 # Sample output files (fake data)
├── onboarding_output/        # Created at runtime (gitignored)
├── package.json
├── vite.config.js
└── README.md
```

---

## Multi-Tenant Usage

Each completed onboarding run writes a separate pair of files. Run the wizard once per organization. There is no shared state between runs — each produces a unique `{timestamp}_{org}_{randomId}` file pair.

---

## Supported Email Providers

| Provider | IMAP Host | Port | TLS |
|---|---|---|---|
| Gmail | imap.gmail.com | 993 | Yes |
| Microsoft 365 | outlook.office365.com | 993 | Yes |
| Yahoo Mail | imap.mail.yahoo.com | 993 | Yes |
| iCloud | imap.mail.me.com | 993 | Yes |
| Custom | User-defined | User-defined | User-defined |

> **App Passwords:** Gmail, Yahoo, iCloud, and Microsoft 365 typically require an App Password when 2-Factor Authentication is enabled. The wizard includes provider-specific instructions.
