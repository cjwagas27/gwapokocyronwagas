# Auto-start the DormFinder server on port 3000 if it isn't already running.
# Invoked by the Kiro SessionStart hook so the SQLite database is always
# reachable from the browser front-end (http://localhost:3000/index.html).
# Returns immediately (exit 0); the server runs detached in its own process.

$port   = 3000
$listen = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($listen) {
    Write-Output "DormFinder server already running on port $port (PID $($listen.OwningProcess))."
    exit 0
}

# .kiro is one level below the workspace root.
$root  = Split-Path -Parent $PSScriptRoot
$server = Join-Path $root 'backend\server.py'

if (-not (Test-Path $server)) {
    Write-Output "server.py not found at $server - nothing to start."
    exit 0
}

Start-Process -FilePath 'python' -ArgumentList "`"$server`"" -WorkingDirectory $root -WindowStyle Hidden
Write-Output "DormFinder server started on port $port (python $server)."
exit 0
