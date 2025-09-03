# PowerShell script to create a new admin user
# Usage: .\create_admin.ps1 -Email "admin@example.com" -Password "password123"

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$Password
)

$jwtServiceUrl = "http://localhost:8080"

Write-Host "Creating admin user with email: $Email" -ForegroundColor Green

try {
    # Create the admin user
    $body = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$jwtServiceUrl/auth/register/admin" -Method POST -ContentType "application/json" -Body $body

    Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
    Write-Host "Response: $response" -ForegroundColor Cyan
    
    # Test login
    Write-Host "`nTesting login..." -ForegroundColor Yellow
    
    $loginBody = @{
        username = $Email
        password = $Password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$jwtServiceUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -SessionVariable session

    Write-Host "✅ Login test successful!" -ForegroundColor Green
    Write-Host "User ID: $($loginResponse.id)" -ForegroundColor Cyan
    Write-Host "Email: $($loginResponse.email)" -ForegroundColor Cyan
    Write-Host "Role: $($loginResponse.role)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error creating admin user:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        # Try to get error details
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Details: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}

Write-Host "`nScript completed." -ForegroundColor Blue
