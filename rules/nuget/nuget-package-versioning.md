---
id: nuget-package-versioning
stackId: nuget
type: rule
name: NuGet Package Versioning Standards
description: >-
  Follow semantic versioning for NuGet packages — proper version constraints in
  .csproj files, central package management for monorepos, and deterministic
  restore for CI builds.
difficulty: beginner
globs:
  - '**/*.csproj'
  - '**/nuget.config'
  - '**/Directory.Packages.props'
  - '**/Directory.Build.props'
tags:
  - versioning
  - central-package-management
  - nuget-restore
  - semver
  - dependencies
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
  - question: What is Central Package Management in NuGet?
    answer: >-
      Central Package Management uses a Directory.Packages.props file at the
      solution root to define package versions once. Individual .csproj files
      reference packages without specifying versions. This ensures all projects
      use the same version of each dependency and simplifies version updates
      across large solutions.
  - question: Should I use exact or minimum version constraints in NuGet?
    answer: >-
      Use exact versions ([1.0.0]) for applications to ensure reproducible
      builds. Use minimum versions (1.0.0) for libraries to allow consumers
      flexibility. In either case, commit the packages.lock.json file and use
      'dotnet restore --locked-mode' in CI for deterministic restores.
relatedItems:
  - nuget-csproj-conventions
  - nuget-security-auditing
version: 1.0.0
lastUpdated: '2026-03-12'
---

# NuGet Package Versioning Standards

## Rule
All NuGet package references MUST use explicit version ranges. Use Central Package Management (Directory.Packages.props) for solutions with multiple projects. Pin versions for reproducible builds.

## Version Range Syntax
| Syntax | Meaning | Example |
|--------|---------|---------|
| `1.0.0` | Minimum version (inclusive) | >= 1.0.0 |
| `[1.0.0]` | Exact version | = 1.0.0 |
| `[1.0.0, 2.0.0)` | Range (inclusive min, exclusive max) | >= 1.0.0, < 2.0.0 |

## Good Examples
```xml
<!-- Directory.Packages.props — central version management -->
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
    <PackageVersion Include="Microsoft.Extensions.Logging" Version="8.0.0" />
    <PackageVersion Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageVersion Include="xunit" Version="2.7.0" />
    <PackageVersion Include="Moq" Version="4.20.70" />
  </ItemGroup>
</Project>

<!-- Individual .csproj — no version needed with central management -->
<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="Microsoft.Extensions.Logging" />
    <PackageReference Include="Newtonsoft.Json" />
  </ItemGroup>
</Project>
```

## Bad Examples
```xml
<!-- BAD: Wildcard versions -->
<PackageReference Include="Newtonsoft.Json" Version="*" />

<!-- BAD: No version specified without central management -->
<PackageReference Include="Newtonsoft.Json" />

<!-- BAD: Different versions of same package across projects -->
<!-- Project A -->
<PackageReference Include="Serilog" Version="3.1.0" />
<!-- Project B -->
<PackageReference Include="Serilog" Version="2.12.0" />
```

## Enforcement
- Use Central Package Management for solutions with 3+ projects
- `dotnet restore --locked-mode` in CI for deterministic builds
- Enable NuGet audit: `<NuGetAudit>true</NuGetAudit>` in Directory.Build.props
- Dependabot or Renovate for automated version updates
