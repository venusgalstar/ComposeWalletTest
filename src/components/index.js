import { useCallback, useEffect, useState } from "react";
import web3ModalSetup from "./../helpers/web3ModalSetup";
import Web3 from "web3";
import getAbi from "../Abi";
import axios from "axios";

const web3Modal = web3ModalSetup();
// console.log("web3Modal: ", web3Modal);

const Interface = () => {
    const contractAddress = '0x7412441Ab9Bd26aEF0Fe28f8E0bf88bFfa5Fa587';
    let isMobile = window.matchMedia("only screen and (max-width: 1000px)").matches;

    const interactAddress = "http://localhost:9000";

    const [networkList, setNetworkList] = useState();
    const [nftList, setNFTList] = useState();
    const [Abi, setAbi] = useState();
    const [tokenAbi, setTokenAbi] = useState();
    const [web3, setWeb3] = useState();
    const [isConnected, setIsConnected] = useState(false);
    const [injectedProvider, setInjectedProvider] = useState();
    const [refetch, setRefetch] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [current, setCurrent] = useState(null);
    const [connButtonText, setConnButtonText] = useState("CONNECT");
    const [refLink, setRefLink] = useState(
        "https://mangominer.finance/?ref=0x0000000000000000000000000000000000000000"
      );
    const [contractBalance, setContractBalance] = useState(0);
    const [userBalance,setUserBalance] = useState(0);
    const [userApprovedAmount,setUserApprovedAmount] = useState(0);
    const [userInvestment,setUserInvestment] = useState(0);
    const [userDailyRoi, setUserDailyRoi] = useState(0);
    const [dailyReward,setDailyReward] = useState(0);
    const [startTime,setClaimStartTime] = useState(0);
    const [deadline,setClaimDeadline] = useState(0);
    const [approvedWithdraw,setApprovedWithdraw] = useState(0);
    const [lastWithdraw,setLastWithdraw] = useState(0);
    const [nextWithdraw, setNextWithdraw] = useState(0);
    const [totalWithdraw,setTotalWithdraw] = useState(0);
    const [referralReward,setReferralReward] = useState(0);
    const [refTotalWithdraw, setRefTotalWithdraw] = useState(0);
    const [value, setValue] = useState('');
    const [balance,setBalance] = useState(0);

    const [pendingMessage,setPendingMessage] = useState('');
    const [calculate,setCalculator] = useState('');

    const [defaultRef, setDefaultRef] = useState("0x0000000000000000000000000000000000000000");
    const [limit, setLimit] = useState(0);

    const [address, setAddress] = useState("");
    const [roi, setRoi] = useState(8);
    
    useEffect(()=>{
      
      const getData = async () => {
        var data = await axios.get(interactAddress + "/getChainList");

        console.log("data: ", data.data);

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
      // console.log("Connecting Wallet...");
      const provider = await web3Modal.connect();
      // console.log("provider: ", provider);
      setInjectedProvider(new Web3(provider));
      const acc = provider.selectedAddress
        ? provider.selectedAddress
        : provider.accounts[0];
      const short = shortenAddr(acc);
  
      setWeb3(new Web3(provider));
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

    useEffect(() => {
      const Contract = async () => {
        if (isConnected && Abi) {
          // console.log(current);

          // let userBalance = await web3.eth.getBalance(current);
          let userBalance = await tokenAbi.methods.balanceOf(current).call();
          setUserBalance(userBalance);

          let approvedAmount = await tokenAbi.methods.allowance(current, contractAddress).call();
          // console.log("approvedAmount: ", approvedAmount);
          setUserApprovedAmount(approvedAmount);

          let userInvestment = await Abi.methods.investments(current).call();
          setUserInvestment(userInvestment.invested / 10e17);

          let dailyRoi = await Abi.methods.DailyRoi(userInvestment.invested).call();
          setUserDailyRoi(dailyRoi / 10e17);

          let dailyReward = await Abi.methods.userReward(current).call();
          setDailyReward(dailyReward / 10e17);
        }

        // let owner = await Abi.methods.owner().call();

        // console.log('Owner: ', owner);
      };
  
      Contract();
      // eslint-disable-next-line
    }, [refetch]);

    useEffect(() => {
      const Withdrawlconsole = async () => {
        if(isConnected && Abi) {
        let approvedWithdraw = await Abi.methods.approvedWithdrawal(current).call();
        setApprovedWithdraw(approvedWithdraw.amount / 10e17);

        let totalWithdraw = await Abi.methods.totalWithdraw(current).call();
        setTotalWithdraw(totalWithdraw.amount / 10e17);
      }
      }
      Withdrawlconsole();
      // eslint-disable-next-line
    },[refetch]);

    useEffect(() => {
      const TimeLine = async () => {
        if(isConnected && Abi) {
        let claimTime = await Abi.methods.claimTime(current).call();
        if(claimTime.startTime > 0) {
        let _claimStart = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(claimTime.startTime + "000");
        let _claimEnd = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(claimTime.deadline + "000");
        setClaimStartTime(_claimStart);

        setClaimDeadline(_claimEnd);

        let weekly = await Abi.methods.weekly(current).call();
        let _start = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(weekly.startTime + "000");
        let _end = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(weekly.deadline + "000");

        setLastWithdraw(_start);
        setNextWithdraw(_end);
      }
      }
      }
      TimeLine();
      // eslint-disable-next-line
    },[refetch]);


    useEffect(() => {
      const ContractReward = async () => {
        if (isConnected && Abi) {
      
        let refEarnedWithdraw = await Abi.methods.refferal(current).call();
        setReferralReward(refEarnedWithdraw.reward / 10e17);

        let refTotalWithdraw = await Abi.methods.refTotalWithdraw(current).call();
        setRefTotalWithdraw(refTotalWithdraw.totalWithdraw / 10e17);
        
        }
      };
  
      ContractReward();
      // eslint-disable-next-line
    }, [refetch]);

    const shortenAddr = (addr) => {
      if (!addr) return "";
      const first = addr.substr(0, 3);
      const last = addr.substr(38, 41);
      return first + "..." + last;
    };
      
    // buttons
    const ClaimNow = async (e) => {
      e.preventDefault();
      if (isConnected && Abi) {
        //  console.log("success")
          setPendingMessage("Claiming Funds")
        await Abi.methods.claimDailyRewards().send({
          from: current,
        });
        setPendingMessage("Claimed Successfully");
        
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
                            value={calculate}
                            onChange={(e) => setCalculator(e.target.value)}
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
                            value={calculate}
                            onChange={(e) => setCalculator(e.target.value)}
                          />
                        </h6>
                      </td>                                            
                    </tr>
                    <tr>                      
                      <td style={{textAlign:"center"}}>
                        <button className="btn btn-primary btn-lg btn-custom" onClick={ClaimNow}>CLAIM</button>
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
                      <h3 className="subtitle-normal" style={{fontSize: "16px"}}>ROI</h3>                      
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
