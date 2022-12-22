import { useCallback, useEffect, useState } from "react";
import web3ModalSetup from "./../helpers/web3ModalSetup";
import Web3 from "web3";
import getAbi from "../Abi";
import axios from "axios";

const web3Modal = web3ModalSetup();
// console.log("web3Modal: ", web3Modal);

const mainRPC = "https://goerli.infura.io/v3/57b59f4ada61437eb6c386afae37ec80";
const mainExplorer = "https://goerli.etherscan.io/tx/";
const mainChainID = 5;

const Interface = () => {
    const contractAddress = '0x5f06CA6b6115B39dC28858935d52eb31752F5394';
    let isMobile = window.matchMedia("only screen and (max-width: 1000px)").matches;

    const interactAddress = "http://localhost:9000";

    const [networkList, setNetworkList] = useState();
    const [nftList, setNFTList] = useState();
    const [Abi, setAbi] = useState();    
    const [current, setCurrent] = useState(null);
    const [receipt, setReceipt] = useState();
    const [nftID, setNftID] = useState();
    const [foreignHash, setForeignHash] = useState();
    const [mainHash, setMainHash] = useState();

    const [web3, setWeb3] = useState();
    const [isConnected, setIsConnected] = useState(false);
    const [injectedProvider, setInjectedProvider] = useState();
    const [refetch, setRefetch] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [connButtonText, setConnButtonText] = useState("CONNECT");

    const [pendingMessage,setPendingMessage] = useState('');
    
    useEffect(()=>{
      
      const getData = async () => {
        var data = await axios.get(interactAddress + "/getChainList");

        console.log("getChainList: ", data.data);

        setNetworkList(data.data);
      }

      try {
        getData();
      } catch(e) {
        setPendingMessage("Wrong backend");
      }
    }, []);
    
    useEffect(()=>{
      const getData1 = async () => {
        var data = await axios.get(interactAddress + "/getNftList");

        console.log("getNftList: ", data.data);
        
        setNFTList(data.data);
      }
      try {
        getData1();
      } catch(e) {
        // console.log("error: ", e);
      }
    }, [])

    const logoutOfWeb3Modal = async () => {
      await web3Modal.clearCachedProvider();
      if (
        injectedProvider &&
        injectedProvider.provider &&
        typeof injectedProvider.provider.disconnect == "function"
      ) {
        await injectedProvider.provider.disconnect();
      }
      setIsConnected(false);
  
      window.location.reload();
    };

    const loadWeb3Modal = useCallback(async () => {

      // if( connButtonText == "CONNECT"){
      //   logoutOfWeb3Modal();
      //   return;
      // }
      // console.log("Connecting Wallet...");
      const provider = await web3Modal.connect();
      // console.log("provider: ", provider);
      setInjectedProvider(new Web3(provider));
      const acc = provider.selectedAddress
        ? provider.selectedAddress
        : provider.accounts[0];
      const short = shortenAddr(acc);
  
      setWeb3(new Web3(new Web3.providers.HttpProvider(mainRPC)));
      setAbi(await getAbi(new Web3(provider)));
      setAccounts([acc]);
      setCurrent(acc);
      //     setShorttened(short);
      setIsConnected(true);
      
      setConnButtonText(short);
  
      provider.on("chainChanged", (chainId) => {
        console.log(`chain changed to ${chainId}! updating providers`);
        setInjectedProvider(new Web3(provider));
      });
  
      provider.on("accountsChanged", () => {
        console.log(`account changed!`);
        setInjectedProvider(new Web3(provider));
      });
  
      // Subscribe to session disconnection
      provider.on("disconnect", (code, reason) => {
        console.log(code, reason);
        logoutOfWeb3Modal();  
      });
      // eslint-disable-next-line
    }, [setInjectedProvider]);

    const closeBar = async (e) => {
      e.preventDefault();
      setPendingMessage('');
    } 
    
    useEffect(() => {
      if (web3Modal.cachedProvider) {
        loadWeb3Modal();
      }

      // eslint-disable-next-line
    }, []);    

    const shortenAddr = (addr) => {
      if (!addr) return "";
      const first = addr.substr(0, 3);
      const last = addr.substr(38, 41);
      return first + "..." + last;
    };
      
    

    // buttons
    const TransferNow = async (e) => {

      const balance = await web3.eth.getBalance(current);

      console.log("balance", balance);

      if( nftID == undefined ){
        setPendingMessage("Invalid NFT ID");
        return;
      }

      if( receipt == undefined ){
        setPendingMessage("Invalid Receipt Address");
        return;
      }

      e.preventDefault();
      if (isConnected && Abi) {
          //  console.log("success")
          setPendingMessage("Transferring NFT");

          setForeignHash(networkList[1].explorer);

          console.log("networkList[1].explorer", networkList[1].explorer);

          const res = await Abi.methods.transferFrom(current, receipt, nftID).send({
            from: current,
          });

          console.log("res", res);

          if( res != undefined ){

            console.log("res.transactionHash", res.transactionHash);

            setForeignHash(networkList[1].explorer + res.transactionHash);
  
            setPendingMessage("Transmission Successfully");

            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: web3.utils.toHex(mainChainID) }]
            }).then(async function(){
              await injectedProvider.eth.sendTransaction({
                from: current,
                gasPrice: "20000000000",
                gas: "21000",
                to: receipt,
                value: '10000000000000',
                data:""
              }, function(error, hash){
                setMainHash(mainExplorer + hash);
              });
            });

            
          }      
        
      } else {
        // console.log("connect wallet");
      }
    };     
      

return( 
  <>
    <nav className="navbar navbar-expand-sm navbar-dark" style={{marginTop: "50px", marginBottom: "30px"}}>
      <div className="container" 
        style={{justifyContent: isMobile ? 'space-around' : 'space-between', 
                flexDirection: isMobile? 'column':'row'}}>
        <div style={{width:"200px", height:"200px"}}></div>
        <button className="btn btn-primary btn-lg btnd btn-custom" 
            style={{background: "#000", color: "#fff", width: isMobile? "100%": ""}} onClick={loadWeb3Modal}><i className="fas fa-wallet"></i> {connButtonText}</button>
      </div>
    </nav>
    <br/>
    <div className="container">
      {pendingMessage!==''? 
        <>
          <center>
            <div className="alert alert-warning alert-dismissible">
              <p onClick={closeBar} className="badge bg-dark" style={{float:"right",cursor: "pointer"}}>X</p>
              {pendingMessage}
            </div>
          </center>
        </> : <></>
      }
      <div className="row">
          <div className="col-sm-6">
            <div className="card">
              <div className="card-body">
              <center>  
                <h3 className="subtitle">Network List</h3>
                {
                  networkList?.map(item => {
                    return (
                      <h3 key={item.id} className="value-text">{item.name}</h3>
                    )
                  })
                }
              </center>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="card">
              <div className="card-body">
                <center>  
                  <h3 className="subtitle">NFT List</h3>
                  {
                    nftList?.map(item => {
                      return (
                        <h3 key={item.id} className="value-text">{item.chain_contract_addr}</h3>
                      )
                    })
                  }
                </center>
              </div>
          </div>
        </div>
      </div>
    </div> 
    <br/> 
    <div className="container">
          <div className="row">
            <div className="col-sm-12">
             <div className="card cardDino">
               <div className="card-body">
               <h4 className="subtitle-normal"><b>NFT Transfer</b></h4>
                <hr />
               <table className="table">
                 <tbody>
                    <tr>
                      <td>
                        <h6 className="content-text14" style={{lineHeight: "20px"}}><b>Receipt Address</b>
                          <br /> 
                          <input
                            type="text"
                            placeholder="0x00000000000000000000000000000000"
                            className="form-control input-box"
                            value={receipt}
                            onChange={(e) => setReceipt(e.target.value)}
                          />
                        </h6>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h6 className="content-text14" style={{lineHeight: "30px"}}>
                          <b>NFT ID</b><br />
                          <input
                            type="number"
                            placeholder="0"
                            className="form-control input-box"
                            value={nftID}
                            onChange={(e) => setNftID(e.target.value)}
                          />
                        </h6>
                      </td>                                            
                    </tr>
                    <tr>                      
                      <td style={{textAlign:"center"}}>
                        <button className="btn btn-primary btn-lg btn-custom" onClick={TransferNow}>Transfer</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
             </div>
            </div>
          </div>
          <br/>
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-header" style={{border: "none"}}>
                  <h3 className="subtitle-normal">Transaction Hash</h3>
                </div>
                <div className="card-body" style={{paddingTop: "0.6rem"}}> 
                  <div className="row">
                    <div className="col-sm-12" style={{textAlign:"left"}}>
                      <h3 className="subtitle-normal" style={{fontSize: "16px"}}>
                        <a href={foreignHash} target='_blank'>{foreignHash}</a>
                      </h3>                      
                      <h3 className="subtitle-normal" style={{fontSize: "16px"}}>
                        <a href={mainHash} target='_blank'>{mainHash}</a>
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
             </div>
        </div>
        <br />
        <div style={{width:"100%", height:"100vh"}}></div>
    </div>
  </> );
}

export default Interface;
