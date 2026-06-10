#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Get the workspace folder (parent of .vscode)
WORKSPACE_FOLDER="$(dirname "$(dirname "$0")")"

# Read the .nvmrc file to get the version
NODE_VERSION=$(head -n 1 "$WORKSPACE_FOLDER/src/.nvmrc")

# Use the specific version without changing directory
nvm use "$NODE_VERSION" >/dev/null 2>&1

# Execute node with all passed arguments
exec node "$@"
