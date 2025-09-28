#!/usr/bin/env bash

if [[ "$1" == "send-usdc" ]]; then
  cast rpc --rpc-url "$RPC_URL" anvil_impersonateAccount "$USDC_WHALE"
  cast rpc --rpc-url "$RPC_URL" anvil_setBalance "$USDC_WHALE" 0x56BC75E2D63100000
  cast send --rpc-url "$RPC_URL" --from "$USDC_WHALE" "$USDC" 'transfer(address,uint256)' "$TARGET" 1000000000 --unlocked --legacy --gas-limit 500000 --gas-price 30gwei
  cast rpc --rpc-url "$RPC_URL" anvil_stopImpersonatingAccount "$USDC_WHALE"
elif [[ "$1" == "check-balance" ]]; then
  cast call "$USDC" "balanceOf(address)(uint256)" "$TARGET" --rpc-url "$RPC_URL"
elif [[ "$1" == "mint-polymarket-positions" ]]; then
  forge script test/script/MintPolymarketPositions.s.sol:MintPolymarketPositions --rpc-url "$RPC_URL" --ffi --broadcast --private-key "$PRIVATE_KEY"
else
  echo "Invalid script"
  exit 1
fi