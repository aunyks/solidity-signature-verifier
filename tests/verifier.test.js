const { expect } = require('chai')
const { ethers, web3 } = require('hardhat')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

describe('Signature Verifier', () => {
  let sigVerifier = null

  beforeEach(async () => {
    const SignatureVerifier = await ethers.getContractFactory(
      'SignatureVerifier')
    sigVerifier = await SignatureVerifier.deploy()
    await sigVerifier.deployed()
  })

  it('successfully verifies off-chain signatures', async () => {
    const [signerAddress, toAddress] = await web3.eth.getAccounts()
    const amount = 5
    const message = 'Some message'
    const nonce = 3

    // The web3 equivalent of keccak256(abi.encodePacked())
    const hashedTightPacked = web3.utils.soliditySha3(
      { type: 'address', value: toAddress },
      { type: 'uint256', value: amount },
      { type: 'string', value: message },
      { type: 'uint256', value: nonce }
    )
    const signature = await web3.eth.personal.sign(hashedTightPacked, signerAddress)

    await expect(sigVerifier.verify(
      signerAddress,
      toAddress,
      amount,
      message,
      nonce,
      signature
    )).to.equal(
      true,
      'Signature could not be verified on-chain'
    )
  })
})
