# Starts the project Android emulator centered on the primary screen.
# Usage: powershell -File scripts/start-emulator.ps1 [-Avd Realme_12_Pro_Plus] [-FastBoot] [-SoftwareGpu]
#
# By default the emulator boots cold: snapshots on this machine restore a stale
# screen (another app in the foreground) and can crash qemu during GPU init.
# Pass -FastBoot to restore the saved snapshot instead.
#
# GPU: hardware (host = Intel UHD) is the default, because SwiftShader renders the
# whole UI in software and every frame costs 90-150 ms (100% janky frames).
# Pass -SoftwareGpu only if the host driver refuses to start qemu.

param(
  [string]$Avd = "Realme_12_Pro_Plus",
  [switch]$FastBoot,
  [switch]$SoftwareGpu
)

$ErrorActionPreference = "Stop"
$sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$emulator = Join-Path $sdk "emulator\emulator.exe"
$adb = Join-Path $sdk "platform-tools\adb.exe"
$centerScript = Join-Path $PSScriptRoot "center-emulator.ps1"

if (-not (Test-Path $emulator)) { throw "Android emulator not found at $emulator" }
if (-not (Test-Path $adb)) { throw "adb not found at $adb" }

$env:Path = "$sdk\emulator;$sdk\platform-tools;$env:Path"

$listed = & $emulator -list-avds
if ($listed -notcontains $Avd) {
  $Avd = ($listed | Select-Object -First 1).ToString().Trim()
  if (-not $Avd) { throw "No Android Virtual Devices found" }
}

$already = & $adb devices | Select-String "emulator-\d+\s+device"
if (-not $already) {
  $emuArgs = @("-avd", $Avd, "-netdelay", "none", "-netspeed", "full")
  if (-not $FastBoot) {
    # Cold boot: the saved snapshot restores a stale screen on this host.
    $emuArgs += "-no-snapshot-load"
  }
  $gpuMode = if ($SoftwareGpu) { "swiftshader_indirect" } else { "host" }
  $emuArgs += @("-gpu", $gpuMode)
  Write-Output "Starting AVD: $Avd (fastBoot=$($FastBoot.IsPresent), gpu=$gpuMode)"
  Start-Process -FilePath $emulator -ArgumentList $emuArgs -WindowStyle Normal
  & $adb wait-for-device
  $deadline = (Get-Date).AddMinutes(4)
  do {
    Start-Sleep -Seconds 2
    $boot = & $adb shell getprop sys.boot_completed 2>$null
    if ($boot -match "1") { break }
  } while ((Get-Date) -lt $deadline)
} else {
  Write-Output "Emulator already running"
}

# Center after the window exists (retry briefly while UI settles).
powershell -NoProfile -ExecutionPolicy Bypass -File $centerScript -Retries 24 -DelayMs 500
Write-Output "Emulator ready and centered"
Write-Output "Next: run 'npx expo start' and press 'a' to open MoreDance in Expo Go."
