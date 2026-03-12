---
id: powershell-remoting
stackId: powershell
type: skill
name: PowerShell Remoting & Invoke-Command
description: >-
  Execute PowerShell commands on remote machines — WinRM configuration,
  Invoke-Command patterns, persistent sessions, credential management, and
  cross-platform SSH remoting.
difficulty: intermediate
tags:
  - remoting
  - invoke-command
  - winrm
  - ssh
  - remote-management
  - powershell
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
languages:
  - powershell
prerequisites:
  - PowerShell 7.0+
  - WinRM or SSH configured on targets
faq:
  - question: What is the difference between Invoke-Command and Enter-PSSession?
    answer: >-
      Invoke-Command runs a script block on remote machines non-interactively —
      it is scriptable, supports multiple computers simultaneously, and returns
      results as objects. Enter-PSSession starts an interactive remote session
      (like SSH) for one machine. Use Invoke-Command for automation and
      Enter-PSSession for troubleshooting.
  - question: Can PowerShell remoting work between Windows and Linux?
    answer: >-
      Yes, PowerShell 7+ supports SSH-based remoting which works cross-platform
      (Windows to Linux, Linux to Windows, Linux to Linux). Install PowerShell
      on both machines, configure the SSH subsystem, and use -HostName parameter
      instead of -ComputerName. No WinRM needed.
relatedItems:
  - powershell-automation-architect
  - powershell-error-handling
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PowerShell Remoting & Invoke-Command

## Overview
PowerShell remoting lets you run commands on remote machines as if you were local. It uses WinRM (Windows) or SSH (cross-platform) to establish secure connections. Invoke-Command is the primary cmdlet — it scales from one server to thousands.

## Why This Matters
- Manage 500 servers with one command instead of logging into each
- Execute scripts remotely without copying files to each server
- Parallel execution across multiple machines simultaneously

## Remoting Patterns

### Step 1: Enable Remoting
```powershell
# On the remote server (Windows)
Enable-PSRemoting -Force

# Configure WinRM for HTTPS (production)
winrm quickconfig -transport:https

# Or use SSH remoting (PowerShell 7+, cross-platform)
# Requires SSH server with PowerShell subsystem configured
```

### Step 2: Run Commands on Remote Machines
```powershell
# Single server
Invoke-Command -ComputerName "server01" -ScriptBlock {
    Get-Service | Where-Object Status -eq 'Running'
}

# Multiple servers simultaneously
$servers = @("web01", "web02", "web03", "db01")
Invoke-Command -ComputerName $servers -ScriptBlock {
    [PSCustomObject]@{
        Hostname = $env:COMPUTERNAME
        Uptime   = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
        CPU      = (Get-CimInstance Win32_Processor).LoadPercentage
        FreeGB   = [math]::Round((Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace / 1GB, 2)
    }
} -ThrottleLimit 10 | Format-Table
```

### Step 3: Pass Variables to Remote Sessions
```powershell
$serviceName = "nginx"
$action = "restart"

Invoke-Command -ComputerName $servers -ScriptBlock {
    param($svc, $act)
    if ($act -eq "restart") {
        Restart-Service -Name $svc -Force
    }
    Get-Service -Name $svc | Select-Object Name, Status
} -ArgumentList $serviceName, $action

# PowerShell 7+: Use $using: scope modifier (simpler)
Invoke-Command -ComputerName $servers -ScriptBlock {
    Restart-Service -Name $using:serviceName -Force
    Get-Service -Name $using:serviceName
}
```

### Step 4: Persistent Sessions for Multiple Commands
```powershell
# Create persistent sessions (reuse connection)
$sessions = New-PSSession -ComputerName $servers -Credential $cred

# Run multiple commands on the same sessions
Invoke-Command -Session $sessions -ScriptBlock { Stop-Service myapp }
Invoke-Command -Session $sessions -ScriptBlock { Copy-Item C:\deploy\app.zip C:\app\ }
Invoke-Command -Session $sessions -ScriptBlock { Start-Service myapp }

# Clean up sessions
Remove-PSSession $sessions
```

### Step 5: SSH-Based Remoting (Cross-Platform)
```powershell
# Connect to Linux from Windows (or vice versa)
Invoke-Command -HostName "linux-server" -UserName "admin" -ScriptBlock {
    Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
}

# Create SSH session
$session = New-PSSession -HostName "linux-server" -UserName "admin"
Invoke-Command -Session $session -ScriptBlock { systemctl status nginx }
```

## Best Practices
- Use Invoke-Command (not Enter-PSSession) for automation (scriptable, parallelizable)
- Set -ThrottleLimit to control concurrency (default 32 for Invoke-Command)
- Use $using: scope modifier instead of -ArgumentList (cleaner syntax in PS 7+)
- Create persistent sessions when running multiple commands on the same targets
- Always clean up sessions with Remove-PSSession
- Use SSH remoting for cross-platform and internet-facing scenarios

## Common Mistakes
- Using Enter-PSSession in scripts (interactive only, not scriptable)
- Not handling unreachable machines (use -ErrorAction and check results)
- Opening too many sessions without cleanup (resource exhaustion)
- Passing large objects via $using: or -ArgumentList (serialization overhead)
- Not using -Credential for non-domain joined machines
