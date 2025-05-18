# Chatbot Environment Setup Script

Write-Host "Setting up environment variables for the Chatbot component..." -ForegroundColor Green

# Check if .env file already exists
if (Test-Path -Path ".env") {
    Write-Host ".env file already exists. Do you want to overwrite it? (y/n)" -ForegroundColor Yellow
    $overwrite = Read-Host
    if ($overwrite -ne "y") {
        Write-Host "Aborting setup. Existing .env file was preserved." -ForegroundColor Cyan
        exit
    }
}

# Get API keys from user
Write-Host "Please enter your API keys:" -ForegroundColor Cyan
Write-Host "You must provide values for proper functionality" -ForegroundColor Cyan
Write-Host ""

$googleApiKey = Read-Host "Google API Key for Gemini models (required)"
$anthropicApiKey = Read-Host "Anthropic API Key for Claude models (optional)"
$elevenLabsApiKey = Read-Host "ElevenLabs API Key for TTS (optional, Web Speech API used as fallback)"
$elevenLabsVoiceId = Read-Host "ElevenLabs Voice ID (optional)"
$apiBaseUrl = Read-Host "API Base URL (default: http://localhost:5000/api)"

# Set defaults if blank
if (!$apiBaseUrl) { $apiBaseUrl = "http://localhost:5000/api" }

# Check if required keys are provided
if (!$googleApiKey) {
    Write-Host "Warning: No Google API Key provided. Gemini models will not function properly." -ForegroundColor Yellow
}

# Create .env file
$envContent = @"
# API Keys
VITE_GOOGLE_API_KEY=$googleApiKey
VITE_ANTHROPIC_API_KEY=$anthropicApiKey
VITE_ELEVENLABS_API_KEY=$elevenLabsApiKey
VITE_ELEVENLABS_DEFAULT_VOICE_ID=$elevenLabsVoiceId

# API Endpoints
VITE_API_BASE_URL=$apiBaseUrl
"@

# Write to file
$envContent | Out-File -FilePath ".env" -Encoding utf8

Write-Host ""
Write-Host "Environment file created successfully at ./frontend/.env" -ForegroundColor Green
Write-Host "Note: Keep your API keys secure and never commit the .env file to version control." -ForegroundColor Yellow 