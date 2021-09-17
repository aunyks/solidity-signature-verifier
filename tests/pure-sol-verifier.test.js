const { expect } = require('chai')
const { ethers } = require('hardhat')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

describe('Pure Solidity Signature Verifier', () => {
  let sigVerifier = null
  let deployerAccount = null
  let receiverAccount = null

  beforeEach(async () => {
    ;[deployerAccount, receiverAccount] = await ethers.getSigners()
    const PureSolSigVerifier = await ethers.getContractFactory(
      'PureSolSigVerifier'
    )
    sigVerifier = await PureSolSigVerifier.deploy()
    await sigVerifier.deployed()
  })

  it('successfully verifies off-chain signatures', async () => {
    const amount = 5
    const message = 'Some message'
    const nonce = 3

    // The equivalent of keccak256(abi.encodePacked())
    const hashedTightPacked = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'string', 'uint256'],
      [receiverAccount.address, amount, message, nonce]
    )
    // Sign the message and get the 65 byte signature back
    const signature = await deployerAccount.signMessage(
      ethers.utils.arrayify(hashedTightPacked)
    )

    await expect(
      sigVerifier.verify(
        deployerAccount.address,
        receiverAccount.address,
        amount,
        message,
        nonce,
        ethers.utils.arrayify(signature)
      )
    ).not.to.be.reverted
  })

  it('fails when one message parameter is changed', async () => {
    const amount = 5
    const message = 'Some message'
    const nonce = 3

    // The equivalent of keccak256(abi.encodePacked())
    const hashedTightPacked = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'string', 'uint256'],
      [receiverAccount.address, amount, message, nonce]
    )
    // Sign the message and get the 65 byte signature back
    const signature = await deployerAccount.signMessage(
      ethers.utils.arrayify(hashedTightPacked)
    )

    await expect(
      sigVerifier.verify(
        deployerAccount.address,
        receiverAccount.address,
        amount,
        message,
        nonce + 1,
        ethers.utils.arrayify(signature)
      )
    ).to.be.reverted
  })

  it('fails when a non-signer claims to be the message signer', async () => {
    const amount = 5
    const message = 'Some message'
    const nonce = 3

    // The equivalent of keccak256(abi.encodePacked())
    const hashedTightPacked = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'string', 'uint256'],
      [receiverAccount.address, amount, message, nonce]
    )
    // Sign the message and get the 65 byte signature back
    const signature = await deployerAccount.signMessage(
      ethers.utils.arrayify(hashedTightPacked)
    )

    await expect(
      sigVerifier.verify(
        receiverAccount.address,
        receiverAccount.address,
        amount,
        message,
        nonce,
        ethers.utils.arrayify(signature)
      )
    ).to.be.reverted
  })
})
