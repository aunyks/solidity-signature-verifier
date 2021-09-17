//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

contract OZSigVerifier {
  using ECDSA for bytes32;

  function verify(
    address _signer,
    address _to,
    uint256 _amount,
    string memory _message,
    uint256 _nonce,
    bytes memory signature
  ) public {
    require(
      keccak256(abi.encodePacked(_to, _amount, _message, _nonce))
        .toEthSignedMessageHash()
        .recover(signature) == _signer
    );
  }
}
