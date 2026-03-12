---
id: snyk-license-compliance
stackId: snyk
type: rule
name: License Compliance Policy
description: >-
  Enforce open source license compliance with Snyk — define allowed, restricted,
  and prohibited licenses across all project dependencies for legal and
  compliance safety.
difficulty: intermediate
globs:
  - '**/package.json'
  - '**/requirements*.txt'
  - '**/go.mod'
  - '**/*.gemspec'
tags:
  - license-compliance
  - open-source
  - legal
  - gpl
  - snyk
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: Why does open source license compliance matter?
    answer: >-
      Open source licenses carry legal obligations. GPL requires you to
      open-source your code if you distribute it. AGPL extends this to network
      use (SaaS). Using a GPL dependency in proprietary software can create
      legal liability. Snyk tracks licenses across all dependencies, including
      transitive ones.
  - question: Which open source licenses are safe for commercial software?
    answer: >-
      MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, and ISC are permissive
      licenses safe for commercial use. They require attribution but not source
      code disclosure. Avoid GPL, AGPL, and SSPL in proprietary or SaaS
      applications unless you comply with their copyleft terms.
relatedItems:
  - snyk-severity-policy
  - snyk-ignore-standards
  - snyk-dependency-scanning
version: 1.0.0
lastUpdated: '2026-03-11'
---

# License Compliance Policy

## Rule
All project dependencies MUST comply with the organization's license policy. Prohibited licenses block builds. Restricted licenses require legal team approval.

## License Categories

### Allowed (No Restrictions)
- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC
- CC0-1.0
- Unlicense

### Restricted (Requires Approval)
- MPL-2.0 (Mozilla Public License)
- LGPL-2.1 / LGPL-3.0 (Lesser GPL)
- EPL-1.0 / EPL-2.0 (Eclipse)
- CDDL-1.0

### Prohibited (Block Build)
- GPL-2.0 / GPL-3.0 (in proprietary software)
- AGPL-3.0 (network copyleft)
- SSPL (Server Side Public License)
- BSL (Business Source License) — check terms
- No license / Unknown

## Snyk Configuration
```
In Snyk Dashboard:
1. Organization Settings → License Policies
2. Set severity for each license:
   - GPL-3.0 → High (blocks CI)
   - AGPL-3.0 → Critical (blocks CI)
   - Unknown → Medium (warns)
3. Apply to all projects in organization
```

## CLI Check
```bash
# snyk test shows license issues alongside vulnerabilities
snyk test

# Filter for license issues specifically
snyk test --json | jq '.licensesPolicy'
```

## Handling License Issues
1. **Prohibited license found**: Find an alternative package with a compatible license
2. **Restricted license found**: Submit request to legal team with package details
3. **Unknown license found**: Check the package repository for license files manually

## Anti-Patterns
- Using dependencies without checking licenses
- Assuming all npm packages are MIT (many are GPL or unlicensed)
- Ignoring AGPL in SaaS applications (triggers copyleft over network)
- Not tracking license changes when dependencies are updated
