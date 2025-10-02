// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TOKEN
 * @dev Simple ERC-20 token for Hyperliquid HyperEVM
 * 
 * IMPORTANT FOR HYPERLIQUID:
 * - Entire supply MUST be minted to the system address
 * - System address format: 0x20 + zeros + token_index (in hex)
 * - This allows linking to HyperCore spot token
 */
contract TOKEN is ERC20 {
    // System address for HyperCore linking
    // For token index 0: 0x2000000000000000000000000000000000000000
    // For token index 1: 0x2000000000000000000000000000000000000001
    // Update this based on your HyperCore token index!
    address public constant SYSTEM_ADDRESS = 0x2000000000000000000000000000000000000000;
    
    constructor() ERC20("My Token", "TOKEN") {
        // Mint entire supply to system address
        // This is REQUIRED for HyperCore <-> HyperEVM linking
        _mint(SYSTEM_ADDRESS, 1_000_000 * 10 ** decimals());
    }
}