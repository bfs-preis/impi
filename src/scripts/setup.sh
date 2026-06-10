#!/bin/bash

# IMPI Project Setup Script (Unix/Linux/macOS)
# This script ensures pnpm is installed and sets up the development environment

set -e  # Exit on any error

echo "🚀 IMPI Project Setup"
echo "===================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        print_status "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"

    # Check version (basic check for v20+)
    if [[ "$NODE_VERSION" < "v20" ]]; then
        print_warning "Node.js 20+ recommended. Current: $NODE_VERSION"
        print_status "Latest LTS: v22.19.0"
    elif [[ "$NODE_VERSION" < "v22" ]]; then
        print_status "Consider upgrading to Node.js v22.19.0 LTS"
    fi
}

# Check and setup pnpm
setup_pnpm() {
    print_status "Checking pnpm installation..."

    # Run our Node.js script to check/install pnpm
    if node scripts/ensure-pnpm.js; then
        print_success "pnpm is ready!"
    else
        print_error "Failed to setup pnpm"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."

    if pnpm install; then
        print_success "Dependencies installed successfully!"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Build project
build_project() {
    print_status "Building project..."

    if pnpm run build; then
        print_success "Project built successfully!"
    else
        print_warning "Build failed - check the output above"
        return 1
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."

    if pnpm run test; then
        print_success "All tests passed!"
    else
        print_warning "Some tests failed - check the output above"
        return 1
    fi
}

# Main setup process
main() {
    echo
    check_node
    echo
    setup_pnpm
    echo
    install_dependencies
    echo

    # Ask if user wants to build and test
    read -p "🔨 Would you like to build and test the project now? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo
        build_project
        echo
        run_tests
    fi

    echo
    print_success "Setup complete! 🎉"
    echo
    print_status "Available commands:"
    echo "  pnpm run build     # Build all packages"
    echo "  pnpm run test      # Run all tests"
    echo "  pnpm run clean     # Clean build outputs"
    echo "  pnpm run dev       # Build and test"
    echo "  pnpm run lint      # Lint code"
    echo
    print_status "Happy coding! 💻"
}

# Run main function
main "$@"