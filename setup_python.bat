@echo off
REM filepath: c:\Users\oteja\OneDrive\Desktop\MajorProject\install_python_deps.bat
echo Installing Python dependencies for LOR Recommendation AI...

REM Install required packages
echo Installing pandas...
pip install pandas

echo Installing numpy...
pip install numpy

echo Installing scikit-learn...
pip install scikit-learn

echo Installing pymongo...
pip install pymongo

echo Installing python-dotenv...
pip install python-dotenv

echo Installing spacy...
pip install spacy

echo Downloading spaCy model...
python -m spacy download en_core_web_md

echo.
echo Installation complete! You can now use the LOR Recommendation AI.
pause