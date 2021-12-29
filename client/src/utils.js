import { ethers } from 'ethers'
import Contract from './contracts/BlindAuction.json'

export async function getAccount() {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  })
  return accounts[0]
}

export function getContract(withSigner=false) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const networks = Object.values(Contract.networks)
  const network = networks[networks.length - 1]
  const contract = new ethers.Contract(network.address, Contract.abi, provider)
  if(!withSigner) {
    return contract
  }
  const signer = provider.getSigner()
  const contractWithSigner = contract.connect(signer)
  return contractWithSigner
}
