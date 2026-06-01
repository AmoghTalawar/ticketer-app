# ============================================================
#  BlockTicket — Full Development Startup Script
#  Run this ONCE to start everything from scratch.
#  Usage:  .\start-dev.ps1
# ============================================================

$ROOT   = $PSScriptRoot
$BC     = "$ROOT\blockchain"
$BACK   = "$ROOT\backend"

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  BlockTicket Dev Environment Startup" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Start Hardhat Node in a new terminal window ──────
Write-Host "[1/4] Starting Hardhat local node..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BC'; npx hardhat node"
Write-Host "      Waiting 5 seconds for Hardhat to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# ── Step 2: Deploy contracts ──────────────────────────────────
Write-Host "[2/4] Deploying smart contracts to localhost..." -ForegroundColor Yellow
Push-Location $BC
$deploy = & npx hardhat run scripts/deploy.js --network localhost 2>&1
Pop-Location

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Contract deployment failed!" -ForegroundColor Red
    Write-Host $deploy -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure Hardhat node is running on http://127.0.0.1:8545" -ForegroundColor Yellow
    exit 1
}

Write-Host $deploy -ForegroundColor Green
Write-Host ""
Write-Host "      Contracts deployed! addresses.js updated." -ForegroundColor Green

# ── Step 3: Start Backend in a new terminal window ───────────
Write-Host "[3/4] Starting backend API server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BACK'; npm run dev"
Write-Host "      Backend starting at http://localhost:5000" -ForegroundColor Gray
Start-Sleep -Seconds 2

# ── Step 4: Start Frontend in a new terminal window ──────────
Write-Host "[4/4] Starting React frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT'; npm run dev"
Write-Host "      Frontend starting at http://localhost:5173" -ForegroundColor Gray

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Hardhat Node  : http://127.0.0.1:8545" -ForegroundColor White
Write-Host "  Backend API   : http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend App  : http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "  TIP: If you restart the Hardhat node, run:" -ForegroundColor Yellow
Write-Host "       .\redeploy.ps1" -ForegroundColor Cyan
Write-Host ""
