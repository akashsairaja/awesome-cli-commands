---
id: nuget-publishing
stackId: nuget
type: skill
name: Publishing NuGet Packages
description: >-
  Create and publish NuGet packages — .csproj metadata, pack, push to
  nuget.org or private feeds, versioning with SemVer, symbols, and CI/CD
  publishing pipelines.
difficulty: intermediate
tags:
  - nuget
  - publishing
  - packages
  - debugging
  - api
  - ci-cd
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Publishing NuGet Packages skill?"
    answer: >-
      Create and publish NuGet packages — .csproj metadata, pack, push to
      nuget.org or private feeds, versioning with SemVer, symbols, and CI/CD
      publishing pipelines. This skill provides a structured workflow for
      package management, ASP.NET patterns, and .NET application development.
  - question: "What tools and setup does Publishing NuGet Packages require?"
    answer: >-
      Requires pip/poetry installed. Works with NuGet/.NET projects. Review
      the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Publishing NuGet Packages

## Overview
Publishing NuGet packages shares your libraries with the .NET ecosystem. Configure .csproj metadata, build packages with dotnet pack, and push to nuget.org or private feeds with proper versioning.

## Why This Matters
- **Code sharing** — distribute reusable libraries across projects and teams
- **Versioning** — SemVer communicates breaking changes to consumers
- **CI/CD** — automate package publishing in build pipelines
- **Ecosystem** — contribute to the .NET community

## How It Works

### Step 1: Configure Package Metadata
```bash
# Key .csproj properties:
# <PropertyGroup>
#   <PackageId>Company.MyLibrary</PackageId>
#   <Version>1.2.0</Version>
#   <Authors>Your Name</Authors>
#   <Description>A useful library for doing things</Description>
#   <PackageLicenseExpression>MIT</PackageLicenseExpression>
#   <PackageProjectUrl>https://github.com/org/repo</PackageProjectUrl>
#   <RepositoryUrl>https://github.com/org/repo.git</RepositoryUrl>
#   <PackageTags>utility;helper</PackageTags>
#   <PackageReadmeFile>README.md</PackageReadmeFile>
#   <GenerateDocumentationFile>true</GenerateDocumentationFile>
# </PropertyGroup>
#
# <ItemGroup>
#   <None Include="../../README.md" Pack="true" PackagePath="/" />
# </ItemGroup>
```

### Step 2: Pack
```bash
# Build package
dotnet pack --configuration Release

# Pack with specific version
dotnet pack --configuration Release /p:Version=1.2.3

# Pack with symbols (for debugging)
dotnet pack --configuration Release --include-symbols --include-source

# Output to specific directory
dotnet pack --configuration Release --output ./nupkgs
```

### Step 3: Push to Feed
```bash
# Push to nuget.org
dotnet nuget push ./nupkgs/Company.MyLibrary.1.2.0.nupkg \
  --api-key $NUGET_API_KEY \
  --source https://api.nuget.org/v3/index.json

# Push to private feed
dotnet nuget push ./nupkgs/*.nupkg \
  --api-key $FEED_KEY \
  --source "CompanyFeed"

# Push symbols package
dotnet nuget push ./nupkgs/Company.MyLibrary.1.2.0.snupkg \
  --api-key $NUGET_API_KEY \
  --source https://api.nuget.org/v3/index.json

# Delete/unlist a package version
dotnet nuget delete Company.MyLibrary 1.2.0 \
  --api-key $NUGET_API_KEY \
  --source https://api.nuget.org/v3/index.json \
  --non-interactive
```

### Step 4: CI/CD Publishing
```bash
# GitHub Actions snippet:
# - name: Pack
#   run: dotnet pack --configuration Release /p:Version=${{ env.VERSION }}
#
# - name: Push to NuGet
#   run: dotnet nuget push ./nupkgs/*.nupkg
#     --api-key ${{ secrets.NUGET_API_KEY }}
#     --source https://api.nuget.org/v3/index.json
#     --skip-duplicate

# --skip-duplicate prevents errors re-publishing same version
```

## Best Practices
- Use SemVer: MAJOR.MINOR.PATCH (breaking.feature.fix)
- Include README.md in the package for nuget.org display
- Generate XML documentation (GenerateDocumentationFile)
- Push symbols packages for debugging support
- Use --skip-duplicate in CI to handle retries gracefully

## Common Mistakes
- Publishing without README (poor discoverability)
- Not using SemVer (consumers can't assess upgrade risk)
- Forgetting --skip-duplicate in CI (fails on retry)
- Hardcoded API keys in scripts (use CI secrets)
- Not including symbols (consumers can't debug issues)
