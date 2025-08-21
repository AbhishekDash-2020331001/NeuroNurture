# WebGazer - Sentence Similarity and Feedback System

This application provides sentence similarity scoring and feedback for Bengali language learning using transformer models.

## Features

- Sentence embedding using multilingual transformer models
- Cosine similarity calculation between sentences
- Basic feedback generation for language learning
- Support for Bengali text

## Installation

### Option 1: Using the batch file (Windows)
1. Double-click `install.bat` to automatically install all dependencies

### Option 2: Manual installation
```bash
pip install transformers torch sentence-transformers numpy
```

## Usage

Run the main application:
```bash
python main.py
```

## How it works

1. **Model Loading**: Downloads and loads a multilingual sentence transformer model
2. **Text Processing**: Converts input text to numerical embeddings
3. **Similarity Calculation**: Computes cosine similarity between sentence embeddings
4. **Feedback Generation**: Provides feedback based on word-level comparison

## Example Output

```
Model loaded successfully!
Calculating similarity...
Similarity Score: 85.23/100
Feedback: খুব ভালো! তুমি বাক্যটি ঠিক বলেছো।
```

## Troubleshooting

- If you get import errors, make sure all dependencies are installed
- The first run will download the model (~100MB) - ensure internet connection
- For GPU acceleration, install PyTorch with CUDA support

## Dependencies

- transformers: Hugging Face transformer models
- torch: PyTorch deep learning framework
- sentence-transformers: Sentence embedding models
- numpy: Numerical computing library
