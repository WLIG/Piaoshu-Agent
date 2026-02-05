#!/bin/bash
# Vercel Environment Variables Setup Script
# Run this script to automatically configure all environment variables

echo "Setting up Vercel environment variables..."

# Database
vercel env add DATABASE_URL production <<< "file:./db/custom.db"

# DeepSeek API
vercel env add DEEPSEEK_API_KEY production <<< "sk-85004076a7fb47dc99ead5543dd8bda2"
vercel env add DEEPSEEK_BASE_URL production <<< "https://api.deepseek.com/v1"

# OpenRouter API
vercel env add OPENROUTER_API_KEY production <<< "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"
vercel env add OPENROUTER_BASE_URL production <<< "https://openrouter.ai/api/v1"

# NVIDIA API
vercel env add NVIDIA_API_KEY production <<< "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"
vercel env add NVIDIA_BASE_URL production <<< "https://integrate.api.nvidia.com/v1"
vercel env add NVIDIA_USERNAME production <<< "NVIDIABuild-Autogen-37"

# Application Settings
vercel env add NODE_ENV production <<< "production"
vercel env add NEXTAUTH_SECRET production <<< "production_secret_key_change_this"

# Feature Flags
vercel env add ENABLE_WEBSOCKET production <<< "true"
vercel env add ENABLE_MULTIMODAL production <<< "true"
vercel env add ENABLE_VOICE_INPUT production <<< "true"
vercel env add ENABLE_MEMORY_SYSTEM production <<< "true"

# Vector Database
vercel env add CHROMA_URL production <<< "http://localhost:8000"
vercel env add ENABLE_VECTOR_SEARCH production <<< "true"

echo "Environment variables setup complete!"
echo "Triggering redeployment..."
vercel --prod

echo "Done! Check your deployment at https://vercel.com/wligs-projects"
