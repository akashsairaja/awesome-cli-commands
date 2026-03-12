---
id: powershell-error-handling
stackId: powershell
type: skill
name: PowerShell Error Handling Patterns
description: >-
  Master PowerShell error handling — try/catch/finally, terminating vs
  non-terminating errors, ErrorAction, error records, and building resilient
  scripts that fail gracefully.
difficulty: intermediate
tags:
  - error-handling
  - try-catch
  - erroraction
  - exceptions
  - resilience
  - powershell
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - powershell
prerequisites:
  - PowerShell 7.0+
  - Basic PowerShell scripting
faq:
  - question: Why doesn't try/catch work for some PowerShell errors?
    answer: >-
      PowerShell has two error types: terminating (caught by try/catch) and
      non-terminating (written to error stream but execution continues). Most
      cmdlets produce non-terminating errors by default. Add -ErrorAction Stop
      to the cmdlet to convert it to a terminating error that try/catch can
      handle.
  - question: >-
      What is the difference between -ErrorAction Stop and
      $ErrorActionPreference = 'Stop'?
    answer: >-
      -ErrorAction Stop applies to a single cmdlet. $ErrorActionPreference =
      'Stop' applies to all cmdlets in the current scope (script or function).
      Set the preference at the top of your script for consistent behavior, and
      override with -ErrorAction on specific cmdlets when needed.
relatedItems:
  - powershell-automation-architect
  - powershell-module-development
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PowerShell Error Handling Patterns

## Overview
PowerShell has two types of errors: terminating (caught by try/catch) and non-terminating (silently continue by default). This catches most people off guard — a cmdlet can fail without entering your catch block. Mastering the distinction is key to reliable scripts.

## Why This Matters
- Non-terminating errors skip catch blocks by default (silent failures)
- Without proper error handling, scripts continue after failures causing data corruption
- Enterprise automation requires predictable failure behavior

## Error Handling Patterns

### Step 1: Understanding Error Types
```powershell
# Non-terminating error (DEFAULT for most cmdlets)
# This writes to error stream but CONTINUES execution
Get-Item "C:\nonexistent\path"
Write-Output "This line STILL runs!"

# Terminating error (caught by try/catch)
# This stops execution
throw "Something went wrong"
```

### Step 2: Force Terminating Errors with -ErrorAction Stop
```powershell
# BAD: catch block never executes (non-terminating error)
try {
    Get-Item "C:\nonexistent\path"
} catch {
    Write-Output "This never runs!"
}

# GOOD: -ErrorAction Stop converts to terminating error
try {
    Get-Item "C:\nonexistent\path" -ErrorAction Stop
} catch {
    Write-Output "Caught: $($_.Exception.Message)"
} finally {
    Write-Output "Always runs (cleanup)"
}
```

### Step 3: Set Default ErrorAction for the Script
```powershell
# Set at script/function level with CmdletBinding
function Invoke-DatabaseBackup {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$DatabaseName
    )

    # Set default for all cmdlets in this function
    $ErrorActionPreference = 'Stop'

    try {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupPath = "D:\Backups\$DatabaseName_$timestamp.bak"

        Backup-SqlDatabase -ServerInstance "localhost" -Database $DatabaseName -BackupFile $backupPath
        Write-Output "Backup succeeded: $backupPath"
    } catch {
        Write-Error "Backup failed for $DatabaseName : $($_.Exception.Message)"
        Send-ErrorNotification -Message $_.Exception.Message
    }
}
```

### Step 4: Rich Error Information
```powershell
try {
    Invoke-RestMethod -Uri "https://api.example.com/data" -ErrorAction Stop
} catch {
    # Error record has detailed information
    Write-Error "API call failed"
    Write-Output "Exception Type: $($_.Exception.GetType().FullName)"
    Write-Output "Message: $($_.Exception.Message)"
    Write-Output "Stack Trace: $($_.ScriptStackTrace)"
    Write-Output "Target: $($_.TargetObject)"
    Write-Output "Category: $($_.CategoryInfo.Category)"

    # Re-throw if you can't handle it
    # throw
}
```

### Step 5: Custom Error Records
```powershell
function Get-UserData {
    [CmdletBinding()]
    param([string]$UserId)

    $user = Get-ADUser -Identity $UserId -ErrorAction SilentlyContinue

    if (-not $user) {
        $errorRecord = [System.Management.Automation.ErrorRecord]::new(
            [System.Exception]::new("User '$UserId' not found in Active Directory"),
            "UserNotFound",
            [System.Management.Automation.ErrorCategory]::ObjectNotFound,
            $UserId
        )
        $PSCmdlet.ThrowTerminatingError($errorRecord)
    }

    return $user
}
```

## Best Practices
- Always use [CmdletBinding()] on functions
- Set $ErrorActionPreference = 'Stop' at the top of scripts
- Use try/catch/finally for all operations that can fail
- Log errors before handling them (audit trail)
- Use -ErrorAction Stop on individual cmdlets when needed
- Never use -ErrorAction SilentlyContinue without a good reason
- Use $PSCmdlet.ThrowTerminatingError() for custom errors in advanced functions

## Common Mistakes
- Expecting try/catch to catch non-terminating errors (need -ErrorAction Stop)
- Using Write-Host for error output (use Write-Error)
- Catching all errors with empty catch blocks (swallowing errors)
- Not using finally for cleanup (temp files, connections)
- Using $Error[0] instead of $_ in catch block
