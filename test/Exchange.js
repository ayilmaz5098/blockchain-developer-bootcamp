const { ethers } = require("hardhat")
const { expect } = require(`chai`)

const tokens = (n) =>{
  return ethers.utils.parseUnits(n.toString(),`ether`)
 }

describe(`Exchange`, () => {

  let deployer, feeAccount,accounts,exchange

  const feePercent = 10

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory(`Exchange`)
    const Token = await ethers.getContractFactory(`Token`)

    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]  
    user1 = accounts[2]


    let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))    
    await transaction.wait()
    exchange = await Exchange.deploy(feeAccount.address, feePercent)
  })

  describe(`Deployment`, () => {
       
    it(`tracks the fee account`, async () => 
      {
        expect(await exchange.feeAccount()).to.be.equal(feeAccount.address)
      })

    it(`tracks the fee percent`, async () =>
      {
        expect(await exchange.feePercent() ).to.be.equal(feePercent)           
      })
  }) 

  describe(`Depositing Tokens`, () =>{
    let transaction, result
    let amount = tokens(10)


    describe(`Success`, () => {  
      beforeEach( async () =>{
       //approve token 
       transaction = await token1.connect(user1).approve(exchange.address, amount)
       result = await transaction.wait()
       //deposit token
       transaction = await exchange.connect(user1).depositToken(token1.address, amount)
       result = await transaction.wait()
      })
      it(`tracks the token deposits`, async () => {
        expect(await token1.balanceOf(exchange.address)).to.be.equal(amount)
        expect(await exchange.tokens(token1.address, user1.address)).to.be.equal(amount)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.be.equal(amount)
       )

      })

      it(`emits a Deposit Event`, async () => {

        const eventLog = result.events[1]
        expect(eventLog.args.token).to.be.equal(token1.address)
        expect(eventLog.args.user).to.be.equal(user1.address)
        expect(eventLog.args.amount).to.be.equal(amount)
        expect(eventLog.args.balance).to.be.equal(amount)
      })

    })
    describe(`Failure`, () => {

      it(`fails when no tokens are approved`, async () => {

      await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
        
      })
    })
  })

  describe(`Withdrawing Tokens`, () => {

    beforeEach( async () => {
      //approve
      transaction = await token1.connect(user1).approve(exchange.address, amount)
      result = await transaction.wait()
      //deposit token
      transaction = await exchange.connect(user1).depositToken(token1.address, amount)
      result = await transaction.wait()
      //withdraw token
      transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
      result = await transaction.wait()
    })

    it(`withdraws token funds`, async () => {

        expect(await token1.balanceOf(exchange.address)).to.be.equal(0)
        expect(await exchange.tokens(token1.address, user1.address)).to.be.equal(0)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.be.equal(0)

    })

    it(`emits a withdraw event`, async () =>{

      eventLog = result.events[1]
      expect(eventLog.event).to.be.equal(`Withdraw`)

    })

  })
})
