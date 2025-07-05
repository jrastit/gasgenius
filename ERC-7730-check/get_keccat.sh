#!/bin/bash

# Usage: ./get_keccat.sh "function_signature"
# Example: ./get_keccat.sh "remove_liquidity_imbalance(uint256[4] amounts,uint256 max_burn_amount)"

if [ -z "$1" ]; then
    echo "Usage: $0 \"function_signature\""
    exit 1
fi

cast sig "$1"