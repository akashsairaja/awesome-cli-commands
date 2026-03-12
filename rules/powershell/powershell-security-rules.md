---
id: powershell-security-rules
stackId: powershell
type: rule
name: PowerShell Security Rules
description: >-
  Enforce PowerShell security standards — no plain text credentials, no
  Invoke-Expression with user input, execution policy requirements, and secure
  string handling.
difficulty: intermediate
globs:
  - '**/*.ps1'
  - '**/*.psm1'
tags:
  - security
  - credentials
  - invoke-expression
  - input-validation
  - securestring
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
  - question: Why is Invoke-Expression dangerous in PowerShell?
    answer: >-
      Invoke-Expression (iex) executes any string as PowerShell code. If the
      string contains user input, an attacker can inject arbitrary commands —
      deleting files, exfiltrating data, or installing malware. Always use
      cmdlet parameters instead of building command strings. Use the call
      operator (&) if you need to invoke a dynamic command name.
  - question: How do I securely store credentials for PowerShell automation?
    answer: >-
      Three options: (1) Export-Clixml encrypts credentials using DPAPI (locked
      to current user + machine). (2) Windows Credential Manager via the
      CredentialManager module. (3) Azure Key Vault or HashiCorp Vault for cloud
      environments. Never store plain text passwords in scripts, config files,
      or environment variables.
relatedItems:
  - powershell-security-specialist
  - powershell-coding-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PowerShell Security Rules

## Rule
All PowerShell scripts MUST handle credentials securely, validate input, and never use Invoke-Expression with dynamic content.

## Format
Never store credentials in plain text. Never execute user-supplied strings.

## Requirements

### 1. Never Store Plain Text Credentials
```powershell
# BAD: Plain text password in script
$password = "MyPassword123"
$cred = New-Object PSCredential("admin", (ConvertTo-SecureString $password -AsPlainText -Force))

# GOOD: Prompt for credentials
$cred = Get-Credential

# GOOD: Encrypted credential file (locked to user + machine)
# Save once:
Get-Credential | Export-Clixml -Path "C:\secure\creds.xml"
# Use in script:
$cred = Import-Clixml -Path "C:\secure\creds.xml"

# GOOD: Azure Key Vault
$secret = Get-AzKeyVaultSecret -VaultName "MyVault" -Name "DbPassword" -AsPlainText
```

### 2. Never Use Invoke-Expression with Dynamic Input
```powershell
# DANGEROUS: Command injection
$userInput = Read-Host "Enter server name"
Invoke-Expression "Get-Service -ComputerName $userInput"
# User enters: "server01; Remove-Item C:\ -Recurse -Force"

# SAFE: Use parameters, not string execution
$userInput = Read-Host "Enter server name"
Get-Service -ComputerName $userInput

# SAFE: Use the call operator for dynamic commands
$cmdName = "Get-Service"
& $cmdName -ComputerName $userInput
```

### 3. Validate All Input Parameters
```powershell
function Remove-OldBackups {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [ValidateScript({ Test-Path $_ -PathType Container })]
        [string]$BackupPath,

        [ValidateRange(1, 365)]
        [int]$OlderThanDays = 30,

        [ValidateSet("sql", "tar", "gz")]
        [string]$Extension = "sql"
    )

    # Safe: validated parameters prevent path traversal and injection
    $cutoff = (Get-Date).AddDays(-$OlderThanDays)
    Get-ChildItem -Path $BackupPath -Filter "*.$Extension" |
        Where-Object LastWriteTime -lt $cutoff |
        ForEach-Object {
            if ($PSCmdlet.ShouldProcess($_.Name, "Delete backup")) {
                Remove-Item $_.FullName
            }
        }
}
```

### 4. Use SecureString for Sensitive Data
```powershell
# Read sensitive input as SecureString
$apiKey = Read-Host "Enter API key" -AsSecureString

# Convert when needed (PowerShell 7+)
$plainKey = ConvertFrom-SecureString -SecureString $apiKey -AsPlainText

# In memory, clear when done
$plainKey = $null
[System.GC]::Collect()
```

## Anti-Patterns
- Hard-coded passwords in scripts
- ConvertTo-SecureString -AsPlainText with literal strings
- Invoke-Expression with any variable input
- Scripts running as SYSTEM or admin without justification
- Disabling execution policy in production
- Using -ExecutionPolicy Bypass in scheduled tasks

## Enforcement
Run PSScriptAnalyzer with security rules enabled. Scan scripts for common credential patterns before deployment.
