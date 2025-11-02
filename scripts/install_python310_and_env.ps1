<#
.SYNOPSIS
  Helper script to (a) install Python 3.10 via winget (if missing), (b) create an isolated virtual env,
  (c) install conversion dependencies, and (d) run the export pipeline to produce TFJS artifacts.

.USAGE
  From repo root (PowerShell):
    powershell -ExecutionPolicy Bypass -File .\scripts\install_python310_and_env.ps1

.PARAMETERS (environment variables you can override before calling)
  $Env:PY310_ID           Winget package id (default Python.Python.3.10)
  $Env:PY310_ROOT         Expected install root (auto-detected if empty)
  $Env:PY310_VENV_NAME    Virtual env folder name (default .venv-py310-convert)
  $Env:PY310_REQUIREMENTS Path to requirements file (default convert/requirements-py310.txt)
  $Env:PY310_RUN_EXPORT   Set to '0' to skip running export script after install

.NOTES
  Requires winget (Windows 10 1709+ / Windows 11). If winget is unavailable, the script will fall back
  to direct download of the official 64-bit installer from python.org.
  Silent installs accept license agreements automatically.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Section($msg) { Write-Host "`n==== $msg ====\n" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Gray }
function Assert-File($path,$label) { if (-not (Test-Path $path)) { throw "$label not found at $path" } }

$pkgId = $Env:PY310_ID; if (-not $pkgId) { $pkgId = 'Python.Python.3.10' }
$venvName = $Env:PY310_VENV_NAME; if (-not $venvName) { $venvName = '.venv-py310-convert' }
$reqFile = $Env:PY310_REQUIREMENTS; if (-not $reqFile) { $reqFile = 'convert/requirements-py310.txt' }
$runExport = $true; if ($Env:PY310_RUN_EXPORT -eq '0') { $runExport = $false }

Write-Section "Detect existing Python 3.10"
$pyCandidate = $null
if (Get-Command py -ErrorAction SilentlyContinue) {
  try { $verOut = py -3.10 --version 2>$null; if ($LASTEXITCODE -eq 0) { $pyCandidate = 'py -3.10' } } catch { }
}
if (-not $pyCandidate) {
  $expected = Join-Path $Env:LOCALAPPDATA 'Programs/Python/Python310/python.exe'
  if (Test-Path $expected) { $pyCandidate = $expected }
}
if ($pyCandidate) {
  Write-Info "Found Python 3.10 at: $pyCandidate"
} else {
  Write-Section "Installing Python 3.10 via winget"
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    winget install -e --id $pkgId --accept-package-agreements --accept-source-agreements --silent
  } else {
    Write-Warn "winget not found. Falling back to direct download..."
    $installer = 'python-3.10.11-amd64.exe'
    $url = "https://www.python.org/ftp/python/3.10.11/$installer"
    Invoke-WebRequest -Uri $url -OutFile $installer
    Write-Info "Running silent installer (per-user)"
    Start-Process -FilePath .\$installer -ArgumentList '/quiet InstallAllUsers=0 PrependPath=1 Include_test=0' -Wait
  }
  # Re-evaluate
  if (Get-Command py -ErrorAction SilentlyContinue) {
    try { $verOut = py -3.10 --version 2>$null; if ($LASTEXITCODE -eq 0) { $pyCandidate = 'py -3.10' } } catch { }
  }
  if (-not $pyCandidate) {
    $expected = Join-Path $Env:LOCALAPPDATA 'Programs/Python/Python310/python.exe'
    if (Test-Path $expected) { $pyCandidate = $expected }
  }
  if (-not $pyCandidate) { throw 'Python 3.10 installation failed or not found.' }
  Write-Info "Python 3.10 installed: $pyCandidate"
}

Write-Section "Create / refresh virtual environment: $venvName"
if (Test-Path $venvName) { Write-Info "Existing venv found. Skipping recreate." } else {
  if ($pyCandidate -eq 'py -3.10') {
    Write-Info 'Creating venv via py launcher'
    py -3.10 -m venv $venvName
  } else {
    & $pyCandidate -m venv $venvName
  }
}
Assert-File "$venvName/Scripts/Activate.ps1" 'Virtualenv Activate script'
Write-Info "Activating venv"
. "$venvName/Scripts/Activate.ps1"
Write-Info "Python: $(python --version)"

Write-Section "Upgrade pip/setuptools/wheel"
python -m pip install --upgrade pip setuptools wheel

Write-Section "Install conversion requirements ($reqFile)"
Assert-File $reqFile 'Requirements file'
pip install -r $reqFile
if ($LASTEXITCODE -ne 0) { throw "pip install failed with exit code $LASTEXITCODE" }

if ($runExport) {
  Write-Section "Run export script"
  if (-not (Test-Path 'convert/export_to_tfjs.py')) { throw 'export_to_tfjs.py not found' }
  if (Test-Path 'assets/models/banana/model.json') { Write-Info 'Removing existing TFJS artifacts (stale)' ; Remove-Item 'assets/models/banana/*' -Force }
  python convert/export_to_tfjs.py
  Write-Section "Export complete"
  Get-ChildItem assets/models/banana | Format-Table Name,Length
} else {
  Write-Info "Skipping export run (PY310_RUN_EXPORT=0)"
}

Write-Host "\nAll done." -ForegroundColor Green
