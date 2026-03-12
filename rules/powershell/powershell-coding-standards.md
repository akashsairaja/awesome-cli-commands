---
id: powershell-coding-standards
stackId: powershell
type: rule
name: PowerShell Coding Standards
description: >-
  Enforce PowerShell coding best practices — approved verbs, CmdletBinding,
  PascalCase naming, no aliases in scripts, proper output handling, and
  PSScriptAnalyzer compliance.
difficulty: beginner
globs:
  - '**/*.ps1'
  - '**/*.psm1'
  - '**/*.psd1'
tags:
  - coding-standards
  - naming-conventions
  - cmdletbinding
  - psscriptanalyzer
  - best-practices
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
  - question: Why should I use approved verbs in PowerShell function names?
    answer: >-
      Approved verbs (Get-Verb) ensure consistency across the PowerShell
      ecosystem. When every function uses standard verbs, users can predict
      function names: Get- for retrieval, Set- for modification, New- for
      creation, Remove- for deletion. Non-standard verbs generate warnings when
      importing modules and confuse users.
  - question: Why should I avoid aliases in PowerShell scripts?
    answer: >-
      Aliases (gci, ?, %, select) are shortcuts for interactive use only. In
      scripts they hurt readability, break cross-platform compatibility (some
      aliases differ between Windows and Linux), and make scripts harder to
      maintain. Always use full cmdlet names (Get-ChildItem, Where-Object,
      ForEach-Object) in scripts.
relatedItems:
  - powershell-automation-architect
  - powershell-error-handling
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PowerShell Coding Standards

## Rule
All PowerShell scripts and functions MUST follow community naming conventions, use CmdletBinding, and pass PSScriptAnalyzer checks.

## Format
```powershell
function Verb-Noun {
    [CmdletBinding()]
    param(...)
    ...
}
```

## Requirements

### 1. Use Approved Verbs
```powershell
# Check approved verbs
Get-Verb | Sort-Object Verb

# GOOD: Uses approved verbs
function Get-UserReport { }
function Set-DatabaseConfig { }
function New-BackupArchive { }
function Remove-ExpiredSessions { }
function Test-ServiceHealth { }
function Invoke-DeployPipeline { }

# BAD: Non-standard verbs
function Create-User { }       # Use New-
function Delete-File { }       # Use Remove-
function Run-Script { }        # Use Invoke-
function Check-Status { }      # Use Test-
function Fetch-Data { }        # Use Get-
```

### 2. Always Use CmdletBinding
```powershell
# GOOD: Advanced function with CmdletBinding
function Get-ServerHealth {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [string[]]$ComputerName,

        [ValidateSet("Basic", "Detailed")]
        [string]$Level = "Basic"
    )

    process {
        foreach ($computer in $ComputerName) {
            # Implementation
        }
    }
}

# BAD: Basic function without CmdletBinding
function Get-ServerHealth($ComputerName) {
    # No parameter validation, no pipeline support
}
```

### 3. No Aliases in Scripts
```powershell
# BAD: Aliases (unreadable, non-portable)
gci C:\ | ? { $_.Length -gt 1MB } | % { $_.Name } | select -First 10

# GOOD: Full cmdlet names
Get-ChildItem C:\ |
    Where-Object { $_.Length -gt 1MB } |
    ForEach-Object { $_.Name } |
    Select-Object -First 10
```

### 4. Output Objects, Not Strings
```powershell
# BAD: String output (can't filter, sort, or pipe)
function Get-DiskInfo {
    "Disk C: 45GB free of 256GB"
}

# GOOD: Object output
function Get-DiskInfo {
    [CmdletBinding()]
    param()

    Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" |
        Select-Object @{N='Drive';E={$_.DeviceID}},
                      @{N='FreeGB';E={[math]::Round($_.FreeSpace/1GB,2)}},
                      @{N='TotalGB';E={[math]::Round($_.Size/1GB,2)}},
                      @{N='PercentFree';E={[math]::Round($_.FreeSpace/$_.Size*100,1)}}
}
```

### 5. PascalCase for Everything
```powershell
# Variables: $PascalCase
$UserName = "admin"
$MaxRetries = 3
$OutputPath = "C:\Reports"

# Functions: Verb-PascalNoun
function Get-UserReport { }

# Parameters: PascalCase
param([string]$ComputerName, [int]$MaxRetries)
```

## Enforcement
```powershell
# Run PSScriptAnalyzer
Install-Module PSScriptAnalyzer
Invoke-ScriptAnalyzer -Path ./MyScript.ps1 -Severity Warning,Error

# In CI pipeline:
Invoke-ScriptAnalyzer -Path ./src/ -Recurse -EnableExit
```
