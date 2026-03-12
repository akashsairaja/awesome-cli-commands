---
id: nuget-security-auditing
stackId: nuget
type: rule
name: NuGet Security Auditing
description: >-
  Enable NuGet security auditing in all .NET projects — audit dependencies for
  known vulnerabilities, configure severity thresholds, and integrate with CI
  for automated blocking.
difficulty: intermediate
globs:
  - '**/*.csproj'
  - '**/Directory.Build.props'
  - '**/nuget.config'
tags:
  - security-audit
  - vulnerabilities
  - supply-chain
  - nuget-audit
  - compliance
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
languages:
  - csharp
faq:
  - question: How does NuGet audit work?
    answer: >-
      NuGet audit checks your package dependencies against the GitHub Advisory
      Database during restore. It reports vulnerabilities as warnings
      (NU1901-NU1904) based on severity level. With TreatWarningsAsErrors
      enabled, builds fail on vulnerable dependencies, preventing deployment of
      known-vulnerable code.
  - question: Should I audit transitive dependencies in NuGet?
    answer: >-
      Absolutely. Set NuGetAuditMode to 'all' to check both direct and
      transitive dependencies. A vulnerability in a deeply nested transitive
      dependency is just as exploitable as one in a direct dependency. Use
      'dotnet list package --vulnerable --include-transitive' for a complete
      view.
relatedItems:
  - nuget-package-versioning
  - nuget-csproj-conventions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# NuGet Security Auditing

## Rule
All .NET projects MUST enable NuGet audit with a minimum severity level of moderate. CI builds MUST fail on known vulnerabilities. Audit results must be reviewed before suppressing any warnings.

## Configuration
```xml
<!-- Directory.Build.props -->
<Project>
  <PropertyGroup>
    <NuGetAudit>true</NuGetAudit>
    <NuGetAuditLevel>moderate</NuGetAuditLevel>
    <NuGetAuditMode>all</NuGetAuditMode>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
```

## Good Examples
```bash
# Run audit during restore
dotnet restore

# Explicit audit check
dotnet list package --vulnerable

# Include transitive dependencies
dotnet list package --vulnerable --include-transitive

# CI pipeline
dotnet restore --locked-mode
dotnet list package --vulnerable --include-transitive
# Fails if any vulnerable packages found
```

```xml
<!-- Suppress specific advisory with documented reason -->
<ItemGroup>
  <NuGetAuditSuppress Include="https://github.com/advisories/GHSA-xxxx">
    <!-- Suppressed: Not exploitable in our usage context. Reviewed 2024-03-01 -->
  </NuGetAuditSuppress>
</ItemGroup>
```

## Bad Examples
```xml
<!-- BAD: Audit disabled -->
<NuGetAudit>false</NuGetAudit>

<!-- BAD: Only checking direct dependencies -->
<NuGetAuditMode>direct</NuGetAuditMode>
<!-- Transitive vulnerabilities are just as dangerous -->

<!-- BAD: Blanket suppression without documentation -->
<NoWarn>NU1904;NU1903;NU1902</NoWarn>
```

## Enforcement
- NuGetAudit enabled in Directory.Build.props (affects all projects)
- CI runs `dotnet list package --vulnerable --include-transitive`
- Dependabot or Renovate for automated security updates
- Quarterly review of audit suppressions
