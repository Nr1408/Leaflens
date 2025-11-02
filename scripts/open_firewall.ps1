# Requires: Administrator
# Opens inbound firewall rules for FastAPI (8000) and Expo/Metro dev ports
$ErrorActionPreference = 'Stop'

$rules = @(
    @{ Name = 'LeafLens FastAPI 8000'; Port = 8000 },
    @{ Name = 'LeafLens Metro 8081'; Port = 8081 },
    @{ Name = 'LeafLens Expo 19000'; Port = 19000 },
    @{ Name = 'LeafLens Expo 19001'; Port = 19001 },
    @{ Name = 'LeafLens Expo 19002'; Port = 19002 }
)

foreach ($r in $rules) {
    if (-not (Get-NetFirewallRule -DisplayName $r.Name -ErrorAction SilentlyContinue)) {
        New-NetFirewallRule -DisplayName $r.Name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $r.Port | Out-Null
        Write-Host "Created firewall rule: $($r.Name)"
    } else {
        Write-Host "Firewall rule already exists: $($r.Name)"
    }
}
