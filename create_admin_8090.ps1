# Create admin user on port 8090
$email = "admin@gmail.com"
$username = "admin@gmail.com"
$password = "admin123"

Write-Host "Creating admin on port 8090..." -ForegroundColor Green
Write-Host "Username: $username" -ForegroundColor Cyan
Write-Host "Email: $email" -ForegroundColor Cyan
Write-Host "Password: $password" -ForegroundColor Cyan

$body = @{
    username = $username
    email = $email
    password = $password
} | ConvertTo-Json

Write-Host "Request body: $body" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8090/admin/register" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ Admin created successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Red
        }
    }
}
