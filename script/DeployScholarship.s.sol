// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {Scholarship} from "../src/Scholarship.sol";

contract DeployScholarship is Script {
    function run() external returns (Scholarship) {
        vm.startBroadcast();

        Scholarship scholarship = new Scholarship();

        vm.stopBroadcast();

        return scholarship;
    }
}