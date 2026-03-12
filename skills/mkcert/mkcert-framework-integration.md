---
id: mkcert-framework-integration
stackId: mkcert
type: skill
name: Integrate mkcert with Development Frameworks
description: >-
  Configure HTTPS with mkcert certificates in Next.js, Vite, webpack-dev-server,
  Express, and other development servers for trusted local TLS.
difficulty: beginner
tags:
  - mkcert-integration
  - nextjs-https
  - vite-https
  - express-https
  - framework-tls
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - mkcert installed
  - CA installed with mkcert -install
  - Development framework project
faq:
  - question: How do I set up HTTPS in Next.js with mkcert?
    answer: >-
      Generate certs with 'mkcert -cert-file certs/local-cert.pem -key-file
      certs/local-key.pem localhost 127.0.0.1'. Create a custom server.js that
      uses Node's https.createServer with the mkcert certificates and passes
      requests to the Next.js handler.
  - question: How do I configure Vite for HTTPS with mkcert?
    answer: >-
      Generate certificates, then set server.https in vite.config.ts with key
      and cert pointing to the mkcert PEM files. Vite will automatically serve
      over HTTPS with trusted certificates.
  - question: Do all team members need to install mkcert separately?
    answer: >-
      Yes. mkcert's CA is per-machine — each developer must run 'mkcert
      -install' to trust the local CA. The generated certificates can be shared
      (add them to a team-accessible location), but the CA installation must
      happen on each machine.
relatedItems:
  - mkcert-docker-https
  - mkcert-local-https-specialist
  - mkcert-multi-service-agent
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Integrate mkcert with Development Frameworks

## Overview
Modern web APIs like Service Workers, WebAuthn, and Secure Cookies require HTTPS. mkcert generates locally-trusted certificates that eliminate browser warnings, letting you develop with HTTPS just like production.

## Why This Matters
- **Service Workers** — require HTTPS (except localhost without port)
- **Secure Cookies** — `SameSite=None; Secure` requires HTTPS
- **WebAuthn/FIDO2** — requires a secure context
- **HTTP/2** — browsers only support HTTP/2 over TLS
- **Mixed content** — HTTPS pages cannot load HTTP resources

## How It Works

### Step 1: Install mkcert and Create CA
```bash
# macOS
brew install mkcert

# Linux
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert

# Windows
choco install mkcert

# Install the local CA (one-time, requires admin/sudo)
mkcert -install
```

### Step 2: Generate Certificates
```bash
# Create certs directory
mkdir -p certs

# Generate for localhost and custom domains
mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem \
  localhost 127.0.0.1 ::1 myapp.local api.myapp.local

# Add to .gitignore
echo "certs/" >> .gitignore
```

### Step 3: Configure Your Framework

#### Next.js (with custom server)
```javascript
// server.js
const { createServer } = require('https');
const { readFileSync } = require('fs');
const { parse } = require('url');
const next = require('next');

const app = next({ dev: true });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: readFileSync('./certs/local-key.pem'),
  cert: readFileSync('./certs/local-cert.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(3000, () => {
    console.log('> Ready on https://localhost:3000');
  });
});
```

#### Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./certs/local-key.pem'),
      cert: fs.readFileSync('./certs/local-cert.pem'),
    },
  },
});
```

#### Express.js
```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();
const options = {
  key: fs.readFileSync('./certs/local-key.pem'),
  cert: fs.readFileSync('./certs/local-cert.pem'),
};

https.createServer(options, app).listen(3000, () => {
  console.log('HTTPS server running on https://localhost:3000');
});
```

#### webpack-dev-server
```javascript
// webpack.config.js
const fs = require('fs');

module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync('./certs/local-key.pem'),
      cert: fs.readFileSync('./certs/local-cert.pem'),
    },
  },
};
```

## Best Practices
- Store certs in a `certs/` directory at project root
- Always add `certs/` to .gitignore
- Include mkcert setup in project README for team onboarding
- Use environment variables for cert paths in CI vs local
- Add localhost, 127.0.0.1, and ::1 to every certificate

## Common Mistakes
- Forgetting to run `mkcert -install` first (certificates are not trusted)
- Committing certificates or CA keys to Git
- Not including 127.0.0.1 and ::1 in the certificate SANs
- Hardcoding absolute certificate paths (breaks on other machines)
