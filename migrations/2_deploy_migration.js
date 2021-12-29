const BlindAuction = artifacts.require("BlindAuction")

module.exports = function (deployer, networks, accounts) {
  deployer.deploy(BlindAuction, 60, 60*10, accounts[1])
}
