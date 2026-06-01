# ============================================================
#  BlockTicket — Quick Redeploy Script
#  Run this whenever you restart the Hardhat node.
#  Requires: Hardhat node already running on port 8545
#  Usage:  .\redeploy.ps1
# ============================================================

$ROOT = $PSScriptRoot
$BC   = "$ROOT\blockchain"

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  BlockTicket — Redeploying Contracts" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Hardhat node is reachable
Write-Host "Checking Hardhat node at http://127.0.0.1:8545..." -ForegroundColor Gray
try {
    $body = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
    $res  = Invoke-WebRequest -Uri "http://127.0.0.1:8545" -Method POST `
              -ContentType "application/json" -Body $body -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  Hardhat node is RUNNING" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "ERROR: Hardhat node is NOT running!" -ForegroundColor Red
    Write-Host "Start it first with:  cd blockchain && npx hardhat node" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Deploying contracts to localhost..." -ForegroundColor Yellow
Push-Location $BC
$deploy = & npx hardhat run scripts/deploy.js --network localhost 2>&1
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    Write-Host $deploy -ForegroundColor Red
    exit 1
}

Write-Host $deploy -ForegroundColor Green
Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "  Contracts redeployed successfully!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  addresses.js has been updated with new addresses." -ForegroundColor White
Write-Host "  The frontend hot-reload will pick up the changes." -ForegroundColor White
Write-Host ""
Write-Host "  IMPORTANT: Reset MetaMask account nonce!" -ForegroundColor Yellow
Write-Host "  MetaMask -> Settings -> Advanced -> Clear Activity Tab Data" -ForegroundColor Gray
Write-Host ""
