#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "$SCRIPT_DIR"

set -a  # Automatically export variables
source "$SCRIPT_DIR/.env"
set +a  # Disable automatic export

# Make the logs directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/logs"

$(which node) $SCRIPT_DIR/dist/index.js >> $SCRIPT_DIR/logs/log_$(date +'%Y-%m-%d_%H-%M').log 2>&1;
