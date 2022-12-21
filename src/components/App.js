import logo from '../logo.svg';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import config from '../config.json';
import TOKEN_ABI from '../abis/Token.json';
import '../App.css';




function App() {


    const loadBlockchainData = async () => {
      
      const accounts = await window.ethereum.request({method: `eth_requestAccounts`})
      console.log(accounts[0])

      const provider= new ethers.providers.Web3Provider(window.ethereum)
      const {chainId} = await provider.getNetwork()
      console.log(chainId)

      console.log(config[chainId])
      const token = new ethers.Contract(config[chainId].Dapp.address,TOKEN_ABI ,provider)
      console.log(token.address)
      const symbol = await token.symbol()
      console.log(symbol)

      //Token Smart Contract-create a connection-we use ether.js little bit different then how we use it in test
      //we are pulling the ethers from hardhat library in test stage
      //NOW WE are pulling the ethers from ethers here, llok at the description of ethers in both here and testjs file, like how we import

      //Connect Ethers to Blockchain




      //Token Smart Contract
    }
    
    useEffect(() => {

      loadBlockchainData()


    })

    return (
      <div>
  
        {/* Navbar */}
  
        <main className='exchange grid'>
          <section className='exchange__section--left grid'>
  
            {/* Markets */}
  
            {/* Balance */}
  
            {/* Order */}
  
          </section>
          <section className='exchange__section--right grid'>
  
            {/* PriceChart */}
  
            {/* Transactions */}
  
            {/* Trades */}
  
            {/* OrderBook */}
  
          </section>
        </main>
  
        {/* Alert */}
  
      </div>
    );
  }
  
  export default App;
