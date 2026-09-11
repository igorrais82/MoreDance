# Centers Android Emulator window(s) on the primary screen.
# Usage: powershell -File scripts/center-emulator.ps1

Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class EmulatorWin {
  public delegate bool EnumProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  public const uint SWP_NOSIZE = 0x0001;
  public const uint SWP_NOZORDER = 0x0004;
}
"@

$screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$targets = New-Object System.Collections.Generic.List[IntPtr]
$callback = [EmulatorWin+EnumProc]{
  param($hWnd, $lParam)
  if (-not [EmulatorWin]::IsWindowVisible($hWnd)) { return $true }
  $sb = New-Object System.Text.StringBuilder 512
  [void][EmulatorWin]::GetWindowText($hWnd, $sb, $sb.Capacity)
  $title = $sb.ToString()
  if ($title -match 'Android Emulator|qemu-system|Realme|Pixel') {
    $targets.Add($hWnd) | Out-Null
  }
  return $true
}
[void][EmulatorWin]::EnumWindows($callback, [IntPtr]::Zero)

if ($targets.Count -eq 0) {
  Write-Output "No emulator window found"
  exit 1
}

foreach ($hWnd in $targets) {
  $rect = New-Object EmulatorWin+RECT
  [void][EmulatorWin]::GetWindowRect($hWnd, [ref]$rect)
  $w = $rect.Right - $rect.Left
  $h = $rect.Bottom - $rect.Top
  $x = [int](($screen.Width - $w) / 2 + $screen.Left)
  $y = [int](($screen.Height - $h) / 2 + $screen.Top)
  [void][EmulatorWin]::SetWindowPos($hWnd, [IntPtr]::Zero, $x, $y, 0, 0, [EmulatorWin]::SWP_NOSIZE -bor [EmulatorWin]::SWP_NOZORDER)
  Write-Output "Centered window at $x,$y (${w}x${h})"
}
