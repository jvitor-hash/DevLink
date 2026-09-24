#!/bin/bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to run command in directory
run_in_dir() {
    local dir=$1
    local cmd=$2
    local description=$3

    print_message "\n📁 [$dir] $description" "$YELLOW"
    cd "$dir" || exit 1

    if eval "$cmd"; then
        print_message "✅ [$dir] $description - PASSED" "$GREEN"
    else
        print_message "❌ [$dir] $description - FAILED" "$RED"
        exit 1
    fi

    cd - > /dev/null || exit 1
}

# Store original directory
ORIGINAL_DIR=$(pwd)

print_message "🚀 Starting test suite..." "$GREEN"

# API Tests
if [ -d "API" ]; then
    print_message "\n========== API TESTS ==========" "$YELLOW"

    run_in_dir "API" "bun run lint" "Linting"
    run_in_dir "API" "bun run type-check" "Type checking"
    run_in_dir "API" "bun test" "Unit tests"
else
    print_message "⚠️  API directory not found" "$YELLOW"
fi

# FRONTEND Tests
if [ -d "FRONTEND" ]; then
    print_message "\n========== FRONTEND TESTS ==========" "$YELLOW"

    run_in_dir "FRONTEND" "bun run lint" "Linting"
    run_in_dir "FRONTEND" "bun run type-check" "Type checking"
    run_in_dir "FRONTEND" "bun run cy:run" "Cypress tests"
else
    print_message "⚠️  FRONTEND directory not found" "$YELLOW"
fi

print_message "\n🎉 All tests passed successfully!" "$GREEN"

# Return to original directory
cd "$ORIGINAL_DIR" || exit 1
