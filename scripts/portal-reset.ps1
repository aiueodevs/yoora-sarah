$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$portalRoot = Join-Path $workspaceRoot "apps\portal"
$nextDirs = @(
  (Join-Path $portalRoot ".next")
  (Join-Path $portalRoot ".next-build")
)
$tsBuildInfo = Join-Path $portalRoot "tsconfig.tsbuildinfo"
$logOut = Join-Path $workspaceRoot ".codex-portal.log"
$logErr = Join-Path $workspaceRoot ".codex-portal.err.log"
$port = 3001
$startupDelaySeconds = 10

function Assert-InWorkspace {
  param([string]$PathToCheck)

  $resolved = Resolve-Path -LiteralPath $PathToCheck -ErrorAction Stop
  $workspaceResolved = (Resolve-Path -LiteralPath $workspaceRoot -ErrorAction Stop).Path

  if (-not $resolved.Path.StartsWith($workspaceResolved, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to operate outside workspace: $($resolved.Path)"
  }

  return $resolved.Path
}

function Stop-PortalListener {
  $listener = netstat -ano | Select-String "127.0.0.1:$port"
  if (-not $listener) {
    return
  }

  $processId = (($listener | Select-Object -First 1).ToString().Trim() -split '\s+' | Select-Object -Last 1)
  if ($processId -match '^\d+$') {
    Write-Host "Stopping process on port $port (PID $processId)..."
    Stop-Process -Id ([int]$processId) -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
  }
}

function Remove-PortalArtifacts {
  foreach ($dir in $nextDirs) {
    if (Test-Path -LiteralPath $dir) {
      $safeDir = Assert-InWorkspace -PathToCheck $dir
      Write-Host "Removing $safeDir"
      Remove-Item -LiteralPath $safeDir -Recurse -Force
    }
  }

  if (Test-Path -LiteralPath $tsBuildInfo) {
    $safeBuildInfo = Assert-InWorkspace -PathToCheck $tsBuildInfo
    Write-Host "Removing $safeBuildInfo"
    Remove-Item -LiteralPath $safeBuildInfo -Force
  }
}

function Start-PortalServer {
  Set-Content -LiteralPath $logOut -Value ""
  Set-Content -LiteralPath $logErr -Value ""

  Write-Host "Starting portal dev server on http://127.0.0.1:$port"
  Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList "run", "dev", "--", "--hostname", "127.0.0.1", "--port", "$port" `
    -WorkingDirectory $portalRoot `
    -RedirectStandardOutput $logOut `
    -RedirectStandardError $logErr `
    -WindowStyle Hidden

  Start-Sleep -Seconds $startupDelaySeconds
}

function Test-PortalRoute {
  param([string]$Url)

  $response = Invoke-WebRequest -Uri $Url -UseBasicParsing
  return $response.StatusCode
}

Write-Host "Resetting portal development runtime..."
Stop-PortalListener
Remove-PortalArtifacts
Start-PortalServer

$loginStatus = Test-PortalRoute -Url "http://127.0.0.1:$port/login?next=%2F"
$homeStatus = Test-PortalRoute -Url "http://127.0.0.1:$port/"

Write-Host "Portal reset complete."
Write-Host "login=$loginStatus home=$homeStatus"
Write-Host "stdout=$logOut"
Write-Host "stderr=$logErr"
