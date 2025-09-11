@echo off
echo Fixing parent table status column...
echo.

REM Set PostgreSQL password
set PGPASSWORD=pscjscsschsc

echo Running SQL migration script...
psql -h localhost -U postgres -d neuronurture -f fix_parent_status_column.sql

echo.
echo Migration completed!
echo.

REM Clear password
set PGPASSWORD=

pause
