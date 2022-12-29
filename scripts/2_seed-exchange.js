
const { ethers } = require("hardhat");

const config = require("../src/config.json")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(),`ether`)
}
const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {


    //Fetch accounts
    const accounts = await ethers.getSigners()
    //Fetch deployede tokens 
    //Fetch Network
    const { chainId } = await ethers.provider.getNetwork() 
    //network id in config.json file
    console.log(`Using chainId:`, chainId)
    const Dapp = await ethers.getContractAt(`Token`, config[chainId].DApp.address)
    console.log(`Dapp Token fetched: ${Dapp.address}`)

    const mETH = await ethers.getContractAt(`Token`, config[chainId].mETH.address)
    console.log(`mETH Token fetched: ${mETH.address}`)

    const mDAI = await ethers.getContractAt(`Token`, config[chainId].mDAI.address)
    console.log(`mDAI Token fetched: ${mDAI.address}`)

    //Fetch deployed exchange
    const exchange = await ethers.getContractAt(`Exchange`, config[chainId].exchange.address)
    console.log(`Exchange fetched: ${exchange.address}`)
    //distribute tokens

    //set up users
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = tokens(10000)
    //give tokens to account[1]
    let transaction, result, orderId
    //user1 transfers 10.000 mETH
    transaction = await mETH.connect(sender).transfer(receiver.address, amount)
    await transaction.wait()
    console.log(`Transferred ${amount} from ${sender.address} to ${receiver.address}/n`)
    //set up exchange users
    const user1 = accounts[0]
    const user2 = accounts[1]
    amount = tokens(10000)

    //user1 approves 10.000 Dapp
    transaction = await Dapp.connect(user1).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user1.address}`)
    //user1 deposits 10.000 tokens

    transaction = await exchange.connect(user1).depositToken(Dapp.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from ${user1.address}/n`)
    // deposit tokens to exchange
    // receiver and user2 are smae console.log(`${receiver.address} == ${user2.address}`)
    // user2 approves mETH

    transaction = await mETH.connect(user2).approve(exchange.address,amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user2.address}/n`)
    //user2 depostis 10.000 mETH to exchange

    transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from ${user2.address}/n`)

    //////////////////////////////////////////////////////
    /// Seed a Cancelled Order
    
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Dapp.address, tokens(5))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)  
    //user1 cancels the order
    
    orderId = ( result.events[0].args.id)
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancelled order from ${user1.address}/n`)
    // wait 1 second
    await wait(1) 

    ///////////////////////////////////////////////////////
    ///Seed Filled Orders

    //user1 makes order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Dapp.address, tokens(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)
    
    
    
    orderId = ( result.events[0].args.id)

    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user2.address}`)

    await wait(1)

    //user1 makes another order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), Dapp.address, tokens(15))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`) 

    orderId = result.events[0].args.id
    //user2 fills another order
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user2.address}`)
    
    await wait(1) 
 
    //user1 makes  final order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), Dapp.address, tokens(20))
    result = await transaction.wait()
    console.log(`Made order from ${user2.address}`)
    //user2 fills final order 
    eventLog = result.events[0]
    orderId = eventLog.args.id

    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user2.address}`)
    await wait(1)
    ///////////////////////////////////////////////////////////////
    //Seed Open Orders
    //user1 makes 10 orders orders 

    for(let i = 1; i <= 10; i++){
 
     transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10*i), Dapp.address, tokens(10))
     result = await transaction.wait()
     console.log(`Made order from ${user1.address}`)

    await wait(1)
    }

   //user2 makes orders
   for(i = 1; i <=10; i++)
   {
    transaction = await exchange.connect(user2).makeOrder(Dapp.address, tokens(10), mETH.address, tokens(10*i))
    result = await transaction.wait()
    console.log(`Made order from ${user2.address}`)
    wait(1)
    }

  
}

 
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
/**/
        