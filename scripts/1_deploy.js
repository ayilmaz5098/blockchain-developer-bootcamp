// SPDX-License-Identifier: Unlicense
const { ethers } = require("hardhat");

async function main() { 

    //fetch the contract to deplou
    const Token = await ethers.getContractFactory("Token")
    const Exchange = await ethers.getContractFactory('Exchange')

    const accounts = await ethers.getSigners()

    console.log(`Accounts fetched:n${accounts[0].address}/n${accounts[1].address}/n`)
     //deploy the contract


    const dapp = await Token.deploy(`Dapp University`, `DAPP`, `1000000`)
    await dapp.deployed()
    console.log(`DAPP deployed to: ${dapp.address}`)
    
    const mETH = await Token.deploy(`mETH`, `mETH`, `1000000`)
    await mETH.deployed()
    console.log(`mETH Deployed to: ${mETH.address}`)

    const mDAI = await Token.deploy(`mDAI`, `mDAI`, `1000000`)
    await mDAI.deployed()
    console.log(`mDAI Deployed to: ${mDAI.address}`)

    //deploy exhange

    const exchange = await Exchange.deploy(accounts[1].address, 10) //constructor function of exchange sc, takes 2 args, feeaccount address and feepercentage
    await exchange.deployed()
    console.log(`Exhange Deployed to: ${exchange.address}`)

    console.log(accounts)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
    

  