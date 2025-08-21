@echo off
echo Installing required dependencies for WebGazer...
echo.

echo Installing transformers...
pip install transformers

echo.
echo Installing torch...
pip install torch

echo.
echo Installing sentence-transformers...
pip install sentence-transformers

echo.
echo Installing numpy...
pip install numpy

echo.
echo All dependencies installed successfully!
echo You can now run: python main.py
pause
