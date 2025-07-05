curl -X POST http://localhost:3030/api/generate \
    -H "Content-Type: application/json" \
    -d '{"address":"0x111111111117dC0aa78b770fA6A738034120C302","chainId":1}' > registry/OneInch/calldata-OneInch.json
export ETHERSCAN_API_KEY=R5ASCCIW54UUM88ZRZCBBYDM5U8D5FVEP8
erc7730 lint .