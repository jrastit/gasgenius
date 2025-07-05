// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {BalanceHelper} from "../src/BalanceHelper.sol";

contract BalanceHelperScript is Script {
    BalanceHelper public balanceHelper;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        balanceHelper = new BalanceHelper();

        vm.stopBroadcast();
    }
}
