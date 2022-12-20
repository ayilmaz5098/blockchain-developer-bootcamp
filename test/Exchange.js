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
    token2 = await Token.deploy(`Mokc Dai`, `mDAI`,`1000000`)
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
  let transaction, result
  let amount = tokens(100)
   describe(`Success`, () => {

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
        expect(eventLog.args.token).to.be.equal(token1.address)
        expect(eventLog.args.user).to.be.equal(user1.address)
        expect(eventLog.args.amount).to.be.equal(amount)
        expect(eventLog.args.balance).to.be.equal(0)
       })

   })

   describe(`Failure`, () => {

    it(`fails for insufficient balances`, async () => {

     await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
    })

   })
  })

  describe(`Checking balances`, async () => {

    let transaction, result
    let amount = tokens(1)
    beforeEach(async () => {

       transaction = await token1.connect(user1).approve(exchange.address, amount)
       result = await transaction.wait()

       transaction = await exchange.connect(user1).depositToken(token1.address, amount)
       result = await transaction.wait()

      })

    it(`returns user balance`, async () => {

      expect(await exchange.balanceOf(token1.address, user1.address)).to.be.equal(amount)

    })

  })

  describe(`Making Orders`, () => {
    let transaction, result
    let amount = tokens(1)

    describe(`Success`, async () => {

      beforeEach(async () => {
        // deposit tokens before making order
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()

        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()

        transaction = await exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))
        result = await transaction.wait()

      })

      it(`tracks the newly created order`, async () => {

        expect(await exchange.orderCount()).to.equal(1)

      })

      it(`emits an order event`, async () => {

        const eventLog = result.events[0]
        expect(eventLog.event).to.equal(`Order`)
        expect(eventLog.args.id).to.equal(1)
        expect(eventLog.args.user).to.equal(user1.address)
        expect(eventLog.args.tokenGet).to.equal(token2.address)
        expect(eventLog.args.amountGet).equal(tokens(1))
        expect(eventLog.args.tokenGive).to.equal(token1.address)
        expect(eventLog.args.amountGive).to.equal(tokens(1))
        expect(eventLog.args.timestamp).to.at.least(1)
      })
    })

    describe(`Failure`, async () => {


    })
  })

})
