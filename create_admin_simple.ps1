# Simple one-liner to create admin user
# Usage: .\create_admin_simple.ps1

$email = "admin@neuronurture.com"
$password = "admin123"

Write-Host "Creating admin: $email" -ForegroundColor Green

$body = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/auth/register/admin" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ Admin created: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
