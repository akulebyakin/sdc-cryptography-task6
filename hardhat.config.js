/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");

module.exports = {
    solidity: "0.8.0",
    networks: {
        hardhat: {},
        localhost: {
            url: "http://127.0.0.1:8545"
        }
    }
};
