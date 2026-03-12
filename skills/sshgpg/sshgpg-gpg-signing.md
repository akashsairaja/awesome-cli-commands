---
id: sshgpg-gpg-signing
stackId: sshgpg
type: skill
name: GPG Commit Signing for Git
description: >-
  Set up GPG commit signing with Git — key generation, Git configuration, GitHub
  verified badges, gpg-agent caching, and SSH signing as a modern alternative.
difficulty: intermediate
tags:
  - gpg-signing
  - commit-signing
  - ssh-signing
  - verified-commits
  - git-security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - GnuPG 2.2+ or Git 2.34+ (for SSH signing)
  - Git configured with user.email
faq:
  - question: Should I use GPG or SSH signing for Git commits?
    answer: >-
      SSH signing (Git 2.34+) is simpler — reuse your existing SSH key, no GPG
      toolchain needed. GPG signing is better for compliance (established
      standard, key servers, revocation lists). For most developers, SSH signing
      is the easier choice.
  - question: How do I get the Verified badge on GitHub commits?
    answer: >-
      Sign commits with GPG or SSH key, then add the public key to GitHub
      Settings > SSH and GPG keys. Ensure your GPG/SSH key email matches your
      GitHub email. Enable 'commit.gpgsign = true' in Git config to sign all
      commits automatically.
  - question: Why are my signed commits showing as Unverified on GitHub?
    answer: >-
      Common causes: GPG key email doesn't match GitHub email, public key not
      uploaded to GitHub, key expired, or using a subkey without the primary
      key's UID. Verify with 'git verify-commit HEAD' locally and check email
      alignment.
relatedItems:
  - sshgpg-key-management
  - sshgpg-ssh-config
  - git-security-guardian
version: 1.0.0
lastUpdated: '2026-03-11'
---

# GPG Commit Signing for Git

## Overview
GPG signing cryptographically proves that commits were authored by you, not someone impersonating your email. GitHub and GitLab show "Verified" badges on signed commits. Modern Git also supports SSH key signing as a simpler alternative.

## Why This Matters
- **Verified identity** — proves commits are genuinely from you
- **Compliance** — required for SOC2, HIPAA, and regulated environments
- **Supply chain security** — prevents commit impersonation
- **GitHub badges** — green "Verified" label on signed commits

## GPG Signing Setup

### Step 1: Generate GPG Key
```bash
# Generate Ed25519 GPG key
gpg --full-generate-key
# Select: (9) ECC (sign and encrypt)
# Curve: Curve 25519
# Expiry: 2y (set expiration!)
# Name: Your Name
# Email: your@email.com (must match Git email)

# List your keys
gpg --list-secret-keys --keyid-format=long
# sec   ed25519/ABC123DEF456 2026-03-11 [SC] [expires: 2028-03-11]
#       FINGERPRINT1234567890
# uid                 [ultimate] Your Name <your@email.com>
```

### Step 2: Configure Git
```bash
# Set signing key
git config --global user.signingkey ABC123DEF456

# Sign all commits automatically
git config --global commit.gpgsign true

# Sign all tags automatically
git config --global tag.gpgsign true

# Set GPG program (if needed)
git config --global gpg.program gpg
```

### Step 3: Add Key to GitHub
```bash
# Export public key
gpg --armor --export ABC123DEF456

# Copy output → GitHub Settings → SSH and GPG keys → New GPG key
```

### Step 4: Configure gpg-agent
```bash
# Cache passphrase for 8 hours
echo "default-cache-ttl 28800" >> ~/.gnupg/gpg-agent.conf
echo "max-cache-ttl 28800" >> ~/.gnupg/gpg-agent.conf

# Restart agent
gpgconf --kill gpg-agent
```

## SSH Signing (Simpler Alternative)

### Setup SSH Signing
```bash
# Use your existing SSH key for signing (Git 2.34+)
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true

# Create allowed signers file
echo "your@email.com $(cat ~/.ssh/id_ed25519.pub)" >> ~/.config/git/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

## Verifying Signed Commits
```bash
# Verify a specific commit
git verify-commit HEAD

# Show signatures in log
git log --show-signature -5

# Verify during merge
git merge --verify-signatures feature-branch
```

## Best Practices
- **Use SSH signing** for simplicity (Git 2.34+, fewer tools)
- **Use GPG signing** for compliance (established standard, key servers)
- **Set expiration dates** — 1-2 years, extend before expiry
- **Cache passphrases** with gpg-agent (8+ hours)
- **Match Git email** with GPG key email exactly
- **Sign all commits** with commit.gpgsign = true

## Common Mistakes
- GPG key email doesn't match git user.email (commits unverified)
- No passphrase caching (typing passphrase every commit)
- Forgetting to add public key to GitHub (no verified badge)
- Using GPG when SSH signing would be simpler
- Key expiration not set (keys should rotate)
