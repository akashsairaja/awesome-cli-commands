---
id: vercel-codex-vercel-deploy
stackId: vercel
type: skill
name: Vercel Deployment Automation
description: >-
  Deploy any project to Vercel from the CLI — preview and production
  deployments, prebuilt output, environment variables, framework detection,
  team scoping, and CI/CD integration patterns.
difficulty: advanced
tags:
  - vercel
  - deployment
  - automation
compatibility:
  - codex
faq:
  - question: "When should I use the Vercel Deployment Automation skill?"
    answer: >-
      Use this skill to deploy projects to Vercel from the command line or CI
      pipelines. It covers preview deployments, production promotion, prebuilt
      output, environment variable management, and automated deployment
      workflows with the Vercel CLI.
  - question: "What tools and setup does Vercel Deployment Automation require?"
    answer: >-
      Requires the Vercel CLI (npm i -g vercel) and authentication via
      'vercel login' or a VERCEL_TOKEN environment variable for CI. Works with
      any framework Vercel supports — Next.js, Remix, Astro, SvelteKit, etc.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Vercel Deployment Automation

Deploy any project to Vercel from the command line. **Always deploy as preview** (not production) unless the user explicitly asks for production. Preview deployments get unique URLs, do not affect your live site, and can be promoted to production later.

## Prerequisites

Check whether the Vercel CLI is installed without escalated permissions:

```bash
command -v vercel
```

If missing, install it globally:

```bash
npm install -g vercel
```

For CI environments, authenticate with a token instead of interactive login:

```bash
export VERCEL_TOKEN=your-token-here
# Or pass inline:
vercel deploy --token $VERCEL_TOKEN
```

## Preview Deployments

Preview is the default and the safe choice. Each preview deployment gets a unique URL tied to that specific build.

```bash
# Deploy current directory as preview (auto-detects framework)
vercel deploy -y

# Deploy a specific directory
vercel deploy ./dist -y

# Deploy and get just the URL (useful for scripting)
PREVIEW_URL=$(vercel deploy -y)
echo "Preview: $PREVIEW_URL"
```

The `-y` flag confirms the default project settings without prompting. Vercel auto-detects the framework (Next.js, Remix, Astro, SvelteKit, etc.) and applies the correct build settings.

**Important:** Use a 10-minute (600,000ms) timeout for the deploy command. Builds can take several minutes depending on project size and framework.

## Production Deployments

Only deploy to production when explicitly requested:

```bash
# Deploy directly to production
vercel deploy --prod -y

# Promote an existing preview deployment to production
vercel promote <deployment-url>
```

The promote pattern is safer for CI — deploy a preview, run tests against the preview URL, then promote only if tests pass.

## Prebuilt Output

If you build locally or in CI before deploying, skip Vercel's build step entirely with `--prebuilt`. This is faster and gives you full control over the build:

```bash
# Build locally first
npm run build

# Generate Vercel build output
vercel build

# Deploy the prebuilt output (skips remote build)
vercel deploy --prebuilt -y
```

This is particularly useful for monorepos or projects with complex build pipelines that Vercel's build system cannot handle natively.

## Environment Variables

Manage environment variables per deployment environment (production, preview, development):

```bash
# Add an environment variable for all environments
vercel env add DATABASE_URL

# Add for specific environments
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview

# Pull environment variables to local .env file
vercel env pull .env.local

# List all configured variables
vercel env ls
```

For CI, set secrets as environment variables in your CI provider and pass them during deploy:

```bash
# Environment variables can be set in Vercel project settings
# or passed via --build-env for build-time variables
vercel deploy -y \
  --build-env NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-env SENTRY_DSN=$SENTRY_DSN
```

## Team and Project Scoping

When working across multiple teams or projects:

```bash
# Deploy to a specific team's project
vercel deploy -y --scope my-team

# Link to a specific project (run once per repo)
vercel link

# Switch projects
vercel switch my-team
```

## Framework-Specific Patterns

### Next.js

```bash
# Standard deploy (Vercel auto-detects Next.js)
vercel deploy -y

# Deploy with specific Next.js output mode
vercel deploy -y --build-env NEXT_OUTPUT=standalone
```

### Static Sites (Astro, Hugo, etc.)

```bash
# Build static output, then deploy
npm run build
vercel deploy ./dist -y
```

### Monorepo with Root Config

```bash
# Deploy a specific package in a monorepo
vercel deploy ./packages/web -y

# Or configure the root directory in project settings
vercel deploy -y  # Uses configured root directory
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/preview.yml
name: Preview Deploy
on: [pull_request]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Deploy Preview
        id: deploy
        run: |
          URL=$(vercel deploy -y --token ${{ secrets.VERCEL_TOKEN }})
          echo "url=$URL" >> "$GITHUB_OUTPUT"

      - name: Comment PR with Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `Preview: ${{ steps.deploy.outputs.url }}`
            })
```

### Deploy-Test-Promote Pattern

```bash
#!/bin/bash
# deploy-and-test.sh — deploy preview, test, promote if green

# Deploy preview
PREVIEW_URL=$(vercel deploy -y --token "$VERCEL_TOKEN")
echo "Preview deployed: $PREVIEW_URL"

# Run tests against the preview
if npm run test:e2e -- --base-url "$PREVIEW_URL"; then
  echo "Tests passed. Promoting to production."
  vercel promote "$PREVIEW_URL" --token "$VERCEL_TOKEN"
else
  echo "Tests failed. Preview remains at: $PREVIEW_URL"
  exit 1
fi
```

## Fallback: No Auth or CLI Unavailable

If the CLI fails with "No existing credentials found" or is not installed, use the deploy script:

```bash
skill_dir="<path-to-skill>"

# Deploy current directory
bash "$skill_dir/scripts/deploy.sh"

# Deploy specific project
bash "$skill_dir/scripts/deploy.sh" /path/to/project

# Deploy existing tarball
bash "$skill_dir/scripts/deploy.sh" /path/to/project.tgz
```

The script handles framework detection, packaging, and deployment. It returns JSON with `previewUrl` and `claimUrl`. Tell the user: "Your deployment is ready at [previewUrl]. Claim it at [claimUrl] to manage your deployment."

## Deployment Inspection

```bash
# List recent deployments
vercel ls

# Inspect a specific deployment
vercel inspect <deployment-url>

# View build logs
vercel logs <deployment-url>

# Remove a deployment
vercel remove <deployment-url>
```

## Troubleshooting

**Sandbox network access**: If deployment fails due to network issues (timeouts, DNS errors), the deploy command needs escalated network access. Rerun with `sandbox_permissions=require_escalated`. Do not escalate the `command -v vercel` check — only the actual deploy.

**Build failures**: Check logs with `vercel logs <url>`. Common causes: missing environment variables, incorrect Node.js version, or framework misconfiguration.

**Authentication errors**: For CI, always use `--token`. For local, run `vercel login` to re-authenticate. Tokens can be created in the Vercel dashboard under Account Settings > Tokens.

**Timeout issues**: Large projects may exceed default timeouts. Set explicit timeouts in your CI configuration (10 minutes minimum).

**Do not** curl or fetch the deployed URL to verify it works. Just return the link to the user.
