// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {BalanceHelper} from "../src/BalanceHelper.sol";

contract MockERC20 {
    string public name = "MockERC20";
    string public symbol = "MCK";
    uint8 public decimals = 18;
    mapping(address => uint256) public balances;

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function mint(address account, uint256 amount) external {
        balances[account] += amount;
    }
}

contract NonStandardToken {
    string public name = "NonStandardToken";
    string public symbol = "NST";
    uint8 public decimals = 18;
}

contract BalanceHelperTest is Test {
    BalanceHelper public balanceHelper;
    MockERC20 public token1;
    MockERC20 public token2;
    NonStandardToken public nonStandardToken;

    address public user = address(0x123);

    function setUp() public {
        balanceHelper = new BalanceHelper();
        token1 = new MockERC20();
        token2 = new MockERC20();
        nonStandardToken = new NonStandardToken();

        // Mint some tokens for the user
        token1.mint(user, 100);
        token2.mint(user, 200);

        // Send native token to the user
        payable(user).transfer(50 ether);
    }

    function testGetBalances() public {
        address[] memory tokens = new address[](3);
        tokens[0] = address(0); // Native token
        tokens[1] = address(token1);
        tokens[2] = address(token2);

        uint256[] memory balances = balanceHelper.getBalances(user, tokens);

        require(balances[0] == 50 ether, "Native token balance mismatch");
        require(balances[1] == 100, "Token1 balance mismatch");
        require(balances[2] == 200, "Token2 balance mismatch");
    }

    function testNonERC20Token() public {
        address[] memory tokens = new address[](2);
        tokens[0] = address(0); // Native token
        tokens[1] = address(nonStandardToken); // Invalid token address

        uint256[] memory balances = balanceHelper.getBalances(user, tokens);

        require(balances[0] == 50 ether, "Native token balance mismatch");
        require(balances[1] == 0, "Invalid token address should return 0");
    }

    function testMixedCaseNativeTokenAddress() public {
        address[] memory tokens = new address[](3);
        tokens[0] = address(0); // Native token (lowercase address)
        tokens[1] = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE; // Native token (mixed case address)
        tokens[2] = address(token1); // Valid ERC20 token

        uint256[] memory balances = balanceHelper.getBalances(user, tokens);

        require(balances[0] == 50 ether, "Native token balance mismatch (lowercase)");
        require(balances[1] == 50 ether, "Native token balance mismatch (mixed case)");
        require(balances[2] == 100, "ERC20 token balance mismatch");
    }

    function testLowercaseNativeTokenAddress() public {
        address[] memory tokens = new address[](2);
        tokens[0] = address(uint160(uint256(keccak256("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")))); // Native token (lowercase address)
        tokens[1] = address(token1); // Valid ERC20 token

        uint256[] memory balances = balanceHelper.getBalances(user, tokens);

        require(balances[0] == 50 ether, "Native token balance mismatch (lowercase)");
        require(balances[1] == 100, "ERC20 token balance mismatch");
    }

    function testPerformanceWithManyTokens() public {
        uint256 numTokens = 100;
        address[] memory tokens = new address[](numTokens);

        for (uint256 i = 0; i < numTokens; i++) {
            MockERC20 token = new MockERC20();
            token.mint(user, i + 1); // Устанавливаем уникальный баланс для каждого токена
            tokens[i] = address(token);
        }

        uint256 startGas = gasleft();
        uint256[] memory balances = balanceHelper.getBalances(user, tokens);
        uint256 gasUsed = startGas - gasleft();

        for (uint256 i = 0; i < numTokens; i++) {
            require(balances[i] == i + 1, "Balance mismatch for token");
        }
    }
}
