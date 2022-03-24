// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.6;

import "ds-test/test.sol";

interface Hevm {
  function store(address c, bytes32 loc, bytes32 val) external;
}

interface IConvex {
  function owner() external view returns (address);
  function shutdownSystem() external;
}

contract ConvexTest is DSTest {
  Hevm constant hevm = Hevm(HEVM_ADDRESS);
  IConvex constant convex = IConvex(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);

  function setUp() public {
    hevm.store(address(convex), bytes32(uint256(4)), bytes32(uint256(uint160(address(this)))));
    assertEq(convex.owner(), address(this));
  }

  function testShutdownCost() public {
    convex.shutdownSystem();
  }
}
