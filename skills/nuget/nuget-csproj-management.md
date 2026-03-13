---
id: nuget-csproj-management
stackId: nuget
type: skill
name: .csproj Package Configuration
description: >-
  Configure .csproj for NuGet packages — PackageReference management, version
  ranges, conditional references, private assets, and Directory.Build.props
  for solution-wide settings.
difficulty: beginner
tags:
  - nuget
  - csproj
  - package
  - configuration
  - security
  - optimization
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the .csproj Package Configuration skill?"
    answer: >-
      Configure .csproj for NuGet packages — PackageReference management,
      version ranges, conditional references, private assets, and
      Directory.Build.props for solution-wide settings. This skill provides a
      structured workflow for package management, ASP.NET patterns, and .NET
      application development.
  - question: "What tools and setup does .csproj Package Configuration require?"
    answer: >-
      Works with standard NuGet/.NET tooling (dotnet CLI, NuGet CLI). Review
      the setup section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# .csproj Package Configuration

## Overview
The .csproj file is the heart of .NET project configuration. Master PackageReference syntax, version ranges, conditional references, and Directory.Build.props for clean, maintainable dependency management.

## Why This Matters
- **Version control** — precise control over which versions are allowed
- **Build optimization** — include packages only when needed
- **Solution consistency** — shared settings across all projects
- **Security** — prevent unintended transitive dependency exposure

## How It Works

### Step 1: PackageReference Basics
```bash
# .csproj PackageReference formats:
# <ItemGroup>
#   <!-- Exact version -->
#   <PackageReference Include="Serilog" Version="3.1.1" />
#
#   <!-- Version range -->
#   <PackageReference Include="AutoMapper" Version="[12.0,13.0)" />
#
#   <!-- Floating version (latest patch) -->
#   <PackageReference Include="Polly" Version="8.2.*" />
#
#   <!-- Minimum version -->
#   <PackageReference Include="MediatR" Version="12.0.0" />
# </ItemGroup>

# Check resolved versions
dotnet list package --include-transitive
```

### Step 2: Private Assets & Metadata
```bash
# Package used only at build time (not in output)
# <PackageReference Include="Microsoft.SourceLink.GitHub" Version="8.0.0"
#   PrivateAssets="all" />

# Development dependency (not exposed to consumers)
# <PackageReference Include="coverlet.collector" Version="6.0.0"
#   PrivateAssets="all"
#   IncludeAssets="runtime; build; native" />

# Prevent transitive dependency exposure
# <PackageReference Include="InternalHelper" Version="1.0.0"
#   PrivateAssets="all" />
```

### Step 3: Conditional References
```bash
# Platform-specific packages
# <ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">
#   <PackageReference Include="Microsoft.Extensions.Hosting" Version="8.0.0" />
# </ItemGroup>
# <ItemGroup Condition="'$(TargetFramework)' == 'net6.0'">
#   <PackageReference Include="Microsoft.Extensions.Hosting" Version="6.0.0" />
# </ItemGroup>

# Configuration-specific
# <ItemGroup Condition="'$(Configuration)' == 'Debug'">
#   <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0" />
# </ItemGroup>
```

### Step 4: Directory.Build.props
```bash
# Solution root Directory.Build.props:
# <Project>
#   <PropertyGroup>
#     <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
#     <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
#     <Nullable>enable</Nullable>
#     <ImplicitUsings>enable</ImplicitUsings>
#   </PropertyGroup>
# </Project>

# Directory.Packages.props (central version management):
# <Project>
#   <ItemGroup>
#     <PackageVersion Include="Serilog" Version="3.1.1" />
#     <PackageVersion Include="AutoMapper" Version="12.0.1" />
#     <PackageVersion Include="xunit" Version="2.7.0" />
#   </ItemGroup>
# </Project>

# Then in .csproj (no version needed):
# <PackageReference Include="Serilog" />
```

## Best Practices
- Use Central Package Management for solutions with 3+ projects
- Use PrivateAssets="all" for build-time-only dependencies
- Use Directory.Build.props for shared settings (nullability, warnings)
- Pin versions in production, use floating versions in development
- Review transitive dependencies with --include-transitive

## Common Mistakes
- Different versions of same package across projects (conflicts)
- Not using PrivateAssets for dev dependencies (leaked to consumers)
- Mixing PackageReference and packages.config (choose one)
- Floating versions in production (non-reproducible builds)
- Not using Directory.Build.props (duplicated settings everywhere)
