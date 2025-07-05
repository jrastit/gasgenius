// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

contract BalanceHelper {
    function getBalances(
        address user,
        address[] calldata tokenAddresses
    ) external view returns (uint256[] memory) {
        address nativeCurrencyAddress = address(uint160(uint256(keccak256("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"))));
        uint256[] memory balances = new uint256[](tokenAddresses.length);

        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            if (tokenAddresses[i] == address(0) ||
                tokenAddresses[i] == nativeCurrencyAddress ||
                tokenAddresses[i] == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
                balances[i] = user.balance;
            } else {
                try IERC20(tokenAddresses[i]).balanceOf(user) returns (uint256 balance) {
                    balances[i] = balance;
                } catch {
                    balances[i] = 0;
                }
            }
        }

        return balances;
    }
}
