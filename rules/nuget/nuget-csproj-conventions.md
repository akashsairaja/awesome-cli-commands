---
id: nuget-csproj-conventions
stackId: nuget
type: rule
name: .csproj File Conventions
description: >-
  Write clean .csproj files — use SDK-style format, organize package references,
  set proper metadata for libraries, and leverage Directory.Build.props for
  shared settings.
difficulty: beginner
globs:
  - '**/*.csproj'
  - '**/Directory.Build.props'
  - '**/Directory.Build.targets'
tags:
  - csproj
  - project-file
  - sdk-style
  - directory-build-props
  - dotnet
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
  - question: What is Directory.Build.props and why should I use it?
    answer: >-
      Directory.Build.props is an MSBuild file automatically imported by all
      .csproj files in the same directory and below. Use it for shared settings
      like TargetFramework, Nullable, TreatWarningsAsErrors, and NuGet audit.
      This eliminates duplication across projects and ensures consistent build
      configuration.
  - question: What is the difference between SDK-style and old-style .csproj?
    answer: >-
      SDK-style .csproj (starts with <Project Sdk='...'>) is concise, uses glob
      patterns for file inclusion, and supports modern .NET features. Old-style
      .csproj lists every file explicitly, uses GUIDs, and is verbose. All new
      .NET projects use SDK-style. Migrate old projects using 'dotnet
      try-convert' tool.
relatedItems:
  - nuget-package-versioning
  - nuget-security-auditing
version: 1.0.0
lastUpdated: '2026-03-12'
---

# .csproj File Conventions

## Rule
All projects MUST use SDK-style .csproj format. Shared settings go in Directory.Build.props. Package references must be alphabetically ordered. Use property groups for NuGet package metadata.

## Good Examples
```xml
<!-- Directory.Build.props — shared across all projects -->
<Project>
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <NuGetAudit>true</NuGetAudit>
    <NuGetAuditLevel>moderate</NuGetAuditLevel>
  </PropertyGroup>
</Project>

<!-- Application .csproj — clean and minimal -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" />
    <PackageReference Include="Serilog.AspNetCore" />
    <PackageReference Include="Swashbuckle.AspNetCore" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Shared\Shared.csproj" />
  </ItemGroup>
</Project>

<!-- Library .csproj — with NuGet metadata -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <PackageId>MyOrg.SharedLib</PackageId>
    <Version>1.2.0</Version>
    <Description>Shared utilities for MyOrg services</Description>
    <Authors>MyOrg</Authors>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
    <PackageReadmeFile>README.md</PackageReadmeFile>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
  </PropertyGroup>
</Project>
```

## Bad Examples
```xml
<!-- BAD: Duplicated settings in every project -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <!-- Repeated in every .csproj — use Directory.Build.props -->
  </PropertyGroup>
</Project>

<!-- BAD: Old-style .csproj with GUIDs -->
<Project ToolsVersion="15.0">
  <Import Project="$(MSBuildExtensionsPath)..." />
  <PropertyGroup>
    <ProjectGuid>{GUID-HERE}</ProjectGuid>
    <!-- Migrate to SDK-style -->
  </PropertyGroup>
</Project>
```

## Enforcement
- `dotnet format` for consistent formatting
- TreatWarningsAsErrors in Directory.Build.props
- CI validates NuGet audit passes with no vulnerabilities
