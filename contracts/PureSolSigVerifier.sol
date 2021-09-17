//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

contract PureSolSigVerifier {
  function verify(
    address _signer,
    address _to,
    uint256 _amount,
    string memory _message,
    uint256 _nonce,
    bytes memory signature
  ) public pure {
    bytes32 messageHash = keccak256(
      abi.encodePacked(_to, _amount, _message, _nonce)
    );
    bytes32 ethSignedMessageHash = keccak256(
      abi.encodePacked('\x19Ethereum Signed Message:\n32', messageHash)
    );
    require(recoverSigner(ethSignedMessageHash, signature) == _signer);
  }

  function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
    public
    pure
    returns (address)
  {
    (bytes32 r, bytes32 s, uint8 v) = extractSigComponents(_signature);
    return ecrecover(_ethSignedMessageHash, v, r, s);
  }

  function extractSigComponents(bytes memory sig)
    public
    pure
    returns (
      bytes32 r,
      bytes32 s,
      uint8 v
    )
  {
    require(sig.length == 65, 'PureSolSigVerifier: Invalid signature length');
    assembly {
      r := mload(add(sig, 32))
      s := mload(add(sig, 64))
      v := byte(0, mload(add(sig, 96)))
    }
  }
}
