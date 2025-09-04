# PowerShell script to test the new parent table columns
# This script tests the status field

$parentServiceUrl = "http://localhost:8082"

Write-Host "Testing Parent Table New Columns" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

try {
    # First, let's get an existing parent to test with
    Write-Host "`nStep 1: Getting existing parent..." -ForegroundColor Yellow
    
    # You'll need to replace this with an actual parent email from your database
    $parentEmail = "test@example.com"  # Replace with actual parent email
    
    $parentResponse = Invoke-RestMethod -Uri "$parentServiceUrl/api/parents/by-email/$parentEmail" -Method GET
    $parentId = $parentResponse.id
    
    Write-Host "✅ Found parent with ID: $parentId" -ForegroundColor Green
    Write-Host "Current status: $($parentResponse.status)" -ForegroundColor Cyan
    
    # Test updating parent status
    Write-Host "`nStep 2: Testing status update..." -ForegroundColor Yellow
    
    $newStatus = "suspended"
    $statusResponse = Invoke-RestMethod -Uri "$parentServiceUrl/api/parents/$parentId/status" -Method PUT -ContentType "application/json" -Body "`"$newStatus`""
    
    Write-Host "✅ Status updated to: $($statusResponse.status)" -ForegroundColor Green
    
    # Reset status back to active
    Write-Host "`nStep 3: Resetting status to active..." -ForegroundColor Yellow
    
    $resetStatusResponse = Invoke-RestMethod -Uri "$parentServiceUrl/api/parents/$parentId/status" -Method PUT -ContentType "application/json" -Body "`"active`""
    
    Write-Host "✅ Status reset to: $($resetStatusResponse.status)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error during testing:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
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

Write-Host "`nTest completed!" -ForegroundColor Blue
