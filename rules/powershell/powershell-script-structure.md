---
id: powershell-script-structure
stackId: powershell
type: rule
name: PowerShell Script Structure Standards
description: >-
  Enforce consistent PowerShell script structure — requires statement,
  comment-based help, parameter blocks, begin/process/end blocks, and proper
  module layout.
difficulty: beginner
globs:
  - '**/*.ps1'
  - '**/*.psm1'
  - '**/*.psd1'
tags:
  - script-structure
  - comment-help
  - modules
  - requires
  - standards
  - powershell
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
  - powershell
faq:
  - question: 'What is #Requires in PowerShell and should I use it?'
    answer: >-
      The #Requires statement declares prerequisites for a script: minimum
      PowerShell version, required modules, administrator privileges. If
      requirements are not met, PowerShell refuses to run the script with a
      clear error message. Always include it — it prevents cryptic runtime
      failures on machines without the required environment.
  - question: Why should PowerShell functions have begin/process/end blocks?
    answer: >-
      begin runs once at the start (initialization), process runs once per
      pipeline input object (the work), and end runs once at the end (cleanup).
      Without process block, pipeline input is ignored. Without begin/end,
      initialization and cleanup happen for every input object. These blocks
      enable proper pipeline support and resource management.
relatedItems:
  - powershell-coding-standards
  - powershell-automation-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PowerShell Script Structure Standards

## Rule
All PowerShell scripts MUST include #requires, comment-based help, [CmdletBinding()], and proper error handling structure.

## Format
```powershell
#Requires -Version 7.0
#Requires -Modules @{ ModuleName="Az"; ModuleVersion="10.0" }

<#
.SYNOPSIS
Brief description.
.DESCRIPTION
Detailed description.
.PARAMETER Name
Parameter description.
.EXAMPLE
PS> Invoke-MyScript -Name "Example"
#>

function Invoke-MyScript {
    [CmdletBinding()]
    param(...)
    begin { }
    process { }
    end { }
}
```

## Requirements

### 1. Script Header
```powershell
#Requires -Version 7.0
#Requires -RunAsAdministrator  # Only if truly needed

<#
.SYNOPSIS
    Backs up PostgreSQL databases to S3.
.DESCRIPTION
    Creates a compressed backup of the specified database using pg_dump,
    uploads to S3 with server-side encryption, and rotates old backups.
.PARAMETER DatabaseName
    Name of the PostgreSQL database to back up.
.PARAMETER RetentionDays
    Number of days to retain backups. Default: 30.
.EXAMPLE
    PS> ./Backup-Database.ps1 -DatabaseName "production" -RetentionDays 90
.NOTES
    Author: Team Name
    Version: 1.2.0
    Requires: AWS CLI, pg_dump
#>
```

### 2. Function Structure
```powershell
function Backup-Database {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory, Position = 0)]
        [ValidateNotNullOrEmpty()]
        [string]$DatabaseName,

        [ValidateRange(1, 365)]
        [int]$RetentionDays = 30
    )

    begin {
        $ErrorActionPreference = 'Stop'
        Write-Verbose "Starting backup for $DatabaseName"
    }

    process {
        try {
            if ($PSCmdlet.ShouldProcess($DatabaseName, "Backup database")) {
                # Implementation
            }
        } catch {
            Write-Error "Backup failed: $($_.Exception.Message)"
            throw
        }
    }

    end {
        Write-Verbose "Backup operation completed"
    }
}
```

### 3. Module Layout
```
MyModule/
  MyModule.psd1          # Module manifest
  MyModule.psm1          # Root module (dot-source public functions)
  Public/                # Exported functions
    Get-Something.ps1
    Set-Something.ps1
  Private/               # Internal helper functions
    Invoke-Helper.ps1
  Tests/                 # Pester tests
    Get-Something.Tests.ps1
```

## Anti-Patterns
- Scripts without comment-based help (undocumented)
- Missing #Requires statement (fails with cryptic errors)
- Functions without [CmdletBinding()] (basic functions)
- No parameter validation ([ValidateNotNullOrEmpty()], etc.)
- Single monolithic script (should be functions in a module)

## Enforcement
Use PSScriptAnalyzer in CI. Require comment-based help for all exported functions. Use Pester tests for all modules.
