# 24/7 Keep-Awake Background Thread using Win32 API
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class PowerHelper {
    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    public static extern uint SetThreadExecutionState(uint esFlags);
}
"@

$ES_CONTINUOUS = [uint32]"0x80000000"
$ES_SYSTEM_REQUIRED = [uint32]"0x00000001"
$ES_DISPLAY_REQUIRED = [uint32]"0x00000002"
$ES_AWAYMODE_REQUIRED = [uint32]"0x00000040"

[PowerHelper]::SetThreadExecutionState($ES_CONTINUOUS -bor $ES_SYSTEM_REQUIRED -bor $ES_AWAYMODE_REQUIRED)

while ($true) {
    [PowerHelper]::SetThreadExecutionState($ES_CONTINUOUS -bor $ES_SYSTEM_REQUIRED -bor $ES_AWAYMODE_REQUIRED)
    Start-Sleep -Seconds 60
}
