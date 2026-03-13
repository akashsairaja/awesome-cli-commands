---
id: nuget-package-management
stackId: nuget
type: skill
name: NuGet Package Management Basics
description: >-
  Manage .NET packages with NuGet CLI and dotnet — adding, updating, and
  removing packages, configuring sources, resolving version conflicts, and
  maintaining clean dependency graphs.
difficulty: beginner
tags:
  - nuget
  - package
  - management
  - basics
  - security
  - api
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
  - question: "When should I use the NuGet Package Management Basics skill?"
    answer: >-
      Manage .NET packages with NuGet CLI and dotnet — adding, updating, and
      removing packages, configuring sources, resolving version conflicts, and
      maintaining clean dependency graphs. This skill provides a structured
      workflow for package management, ASP.NET patterns, and .NET application
      development.
  - question: "What tools and setup does NuGet Package Management Basics require?"
    answer: >-
      Works with standard NuGet/.NET tooling (dotnet CLI, NuGet CLI). Review
      the setup section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# NuGet Package Management Basics

## Overview
NuGet is the package manager for .NET. Learn to add, update, and remove packages using the dotnet CLI, configure package sources, and resolve version conflicts for clean dependency management.

## Why This Matters
- **Dependency management** — use libraries without reinventing the wheel
- **Version control** — lock versions for reproducible builds
- **Source management** — use public and private package feeds
- **Project health** — keep dependencies updated and conflict-free

## How It Works

### Step 1: Adding & Removing Packages
```bash
# Add a package
dotnet add package Newtonsoft.Json
dotnet add package Serilog --version 3.1.1

# Add prerelease
dotnet add package Microsoft.EntityFrameworkCore --prerelease

# Add to specific project
dotnet add src/MyApp/MyApp.csproj package AutoMapper

# Remove a package
dotnet remove package Newtonsoft.Json

# List installed packages
dotnet list package
dotnet list package --outdated
dotnet list package --vulnerable
dotnet list package --deprecated
```

### Step 2: Updating Packages
```bash
# Update to latest version
dotnet add package Serilog    # re-adding updates to latest

# List outdated packages
dotnet list package --outdated

# Update all packages (requires dotnet-outdated tool)
dotnet tool install -g dotnet-outdated-tool
dotnet outdated --upgrade

# Restore packages
dotnet restore
dotnet restore --force-evaluate    # ignore cache
```

### Step 3: Source Management
```bash
# List configured sources
dotnet nuget list source

# Add a private feed
dotnet nuget add source https://pkgs.dev.azure.com/org/_packaging/feed/nuget/v3/index.json \
  --name "CompanyFeed" \
  --username user \
  --password $PAT \
  --store-password-in-clear-text

# Remove a source
dotnet nuget remove source "CompanyFeed"

# Disable a source temporarily
dotnet nuget disable source "CompanyFeed"
dotnet nuget enable source "CompanyFeed"

# Clear NuGet cache
dotnet nuget locals all --clear
dotnet nuget locals http-cache --clear
```

### Step 4: nuget.config
```bash
# Create solution-level nuget.config
# <?xml version="1.0" encoding="utf-8"?>
# <configuration>
#   <packageSources>
#     <clear />
#     <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
#     <add key="company" value="https://pkgs.example.com/nuget/v3/index.json" />
#   </packageSources>
#   <packageSourceMapping>
#     <packageSource key="nuget.org">
#       <package pattern="*" />
#     </packageSource>
#     <packageSource key="company">
#       <package pattern="Company.*" />
#     </packageSource>
#   </packageSourceMapping>
# </configuration>
```

## Best Practices
- Pin major versions in production: `<PackageReference Include="Pkg" Version="3.*" />`
- Use dotnet list package --vulnerable regularly (security)
- Configure package source mapping for supply chain security
- Use Central Package Management for multi-project solutions
- Clear NuGet cache when troubleshooting restore issues

## Common Mistakes
- Not pinning versions (unexpected breaking changes)
- Ignoring vulnerable package warnings
- Not using nuget.config for source configuration (inconsistent across team)
- Storing credentials in nuget.config without encryption
- Missing dotnet restore before build (stale packages)
