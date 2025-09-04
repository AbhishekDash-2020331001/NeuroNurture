# PowerShell script to test admin service integration
# This script tests the admin service endpoints

$adminServiceUrl = "http://localhost:8090"
$parentServiceUrl = "http://localhost:8082"

Write-Host "Testing Admin Service Integration" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

try {
    # Test 1: Check if parent service is running
    Write-Host "`nStep 1: Checking parent service..." -ForegroundColor Yellow
    
    $parentResponse = Invoke-RestMethod -Uri "$parentServiceUrl/api/parents" -Method GET -ErrorAction SilentlyContinue
    if ($parentResponse) {
        Write-Host "✅ Parent service is running" -ForegroundColor Green
        Write-Host "Found $($parentResponse.Count) parents" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Parent service is not running or not accessible" -ForegroundColor Red
        Write-Host "Please start the parent service first: cd Backend/Services/parent && mvn spring-boot:run" -ForegroundColor Yellow
        exit 1
    }
    
    # Test 2: Check if admin service is running
    Write-Host "`nStep 2: Checking admin service..." -ForegroundColor Yellow
    
    $adminResponse = Invoke-RestMethod -Uri "$adminServiceUrl/api/admin/parents" -Method GET -ErrorAction SilentlyContinue
    if ($adminResponse) {
        Write-Host "✅ Admin service is running" -ForegroundColor Green
        Write-Host "Admin service returned $($adminResponse.Count) parents" -ForegroundColor Cyan
        
        # Display parent information
        if ($adminResponse.Count -gt 0) {
            Write-Host "`nParent Details:" -ForegroundColor Yellow
            foreach ($parent in $adminResponse) {
                Write-Host "  - ID: $($parent.id), Name: $($parent.name), Email: $($parent.email), Status: $($parent.status)" -ForegroundColor Cyan
                if ($parent.children -and $parent.children.Count -gt 0) {
                    Write-Host "    Children: $($parent.children.Count)" -ForegroundColor Gray
                    foreach ($child in $parent.children) {
                        Write-Host "      * $($child.name) (Age: $($child.age))" -ForegroundColor Gray
                    }
                }
            }
        }
    } else {
        Write-Host "❌ Admin service is not running or not accessible" -ForegroundColor Red
        Write-Host "Please start the admin service first: cd Backend/Services/admin && mvn spring-boot:run" -ForegroundColor Yellow
        exit 1
    }
    
    # Test 3: Test status update (if we have parents)
    if ($adminResponse.Count -gt 0) {
        Write-Host "`nStep 3: Testing status update..." -ForegroundColor Yellow
        
        $firstParent = $adminResponse[0]
        $parentId = $firstParent.id
        $currentStatus = $firstParent.status
        $newStatus = if ($currentStatus -eq "active") { "suspended" } else { "active" }
        
        Write-Host "Updating parent $parentId status from '$currentStatus' to '$newStatus'" -ForegroundColor Cyan
        
        $updateResponse = Invoke-RestMethod -Uri "$adminServiceUrl/api/admin/parents/$parentId/status" -Method PUT -ContentType "application/json" -Body "`"$newStatus`""
        
        if ($updateResponse) {
            Write-Host "✅ Status update successful" -ForegroundColor Green
            Write-Host "New status: $($updateResponse.status)" -ForegroundColor Cyan
            
            # Reset status back
            $resetStatus = if ($newStatus -eq "active") { "suspended" } else { "active" }
            Write-Host "Resetting status back to '$resetStatus'" -ForegroundColor Cyan
            $resetResponse = Invoke-RestMethod -Uri "$adminServiceUrl/api/admin/parents/$parentId/status" -Method PUT -ContentType "application/json" -Body "`"$resetStatus`""
            Write-Host "✅ Status reset successful" -ForegroundColor Green
        } else {
            Write-Host "❌ Status update failed" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Error during testing:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`nIntegration test completed!" -ForegroundColor Blue
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Start the admin frontend: cd Frontend/admin-website && npm run dev" -ForegroundColor Cyan
Write-Host "2. Open http://localhost:3001 and test the User Management section" -ForegroundColor Cyan
