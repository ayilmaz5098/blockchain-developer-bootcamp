import logo from '../logo.svg';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import config from '../config.json';
import store from '../store/store';
import { loadProvider, loadNetwork, loadAccount, loadToken} from '../store/interactions';


function App() {

    const dispatch = useDispatch()

    const loadBlockchainData = async () => {
      await loadAccount(dispatch)//await window.ethereum.request({method: `eth_requestAccounts`})
 
      
      //Connect Ethers to blockchain
      const provider = loadProvider(dispatch)// new ethers.providers.Web3Provider(window.ethereum)
      //dispatch({type:`PROVIDER_LOADED`, connection: provider })//store.dispatch we were using that before defining dispatch 5 satir ustte
      //const chainId  = 
      const chainId = await loadNetwork(provider, dispatch)//await provider.getNetwork()
      //console.log(config[chainId])
      //Token Smart Contract
      
      //console.log(token.address)
      await loadToken(provider, config[chainId].Dapp.address,dispatch)
      //const symbol = await token.symbol()
      //console.log(symbol)

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

