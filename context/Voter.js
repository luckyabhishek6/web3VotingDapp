import React, { useState, useEffect } from 'react';
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { useRouter } from "next/router";

// // // internal import .....
import { VotingAddress, VotingAddressABI } from "./constants";

// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
const projectId = '2ERpWFhn0Fttmf8cAQTaifKvbVN'
const projectSecret = 'ae9b9247797c3cdcda89d63332710eba'
const auth = 'Basic ' + Buffer.from(projectId + ":" + projectSecret).toString('base64');

const client = ipfsHttpClient({
  host:'ipfs.infura.io',
  port:5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
})

const fetchContract = (signerOrProvider) =>
    new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

export const VotingContext = React.createContext();

export const VotingProvider = ({ children }) => {
    const votingTitle = 'my first smart contract app';
    const router = useRouter();
    const [currentAccount, setCurrentAccount] = useState("");
    const [candidateLength, setCandidateLength] = useState("");
    const pushCandidate = [];
    const candidateIndex = [];
    const [candidateArray, setCandidateArray] = useState(pushCandidate);

// .....................end of candidate data..................

    const [error, setError] = useState('');
    const higestVote = [];

//......................Voter section 
    const pushVoter = [];
    const [voterArray, setVoterArray] = useState(pushVoter);
    const [voterLength, setVoterLength] = useState("");
    const [voterAddress, setVoterAddress] = useState([]);

    // --------CONNECTING  MATAMASK
const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setError("Please Install MetaMask");

    const account = await window.ethereum.request({ method: "eth_accounts" });

    if (account.length) {
      setCurrentAccount(account[0]);
           //getAllVoterData();
// //       //getNewCandidate();
    } else {
      setError("Please Install MetaMask & Connect, Reload");
    }
  };
// // //.................CONNECT Wallet.................................................
const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const account = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setCurrentAccount(account[0]);
// //    // getAllVoterData();
// //     //getNewCandidate();
  };
// //   // ==============================.UPLOAD TO IPFS VOTER Image..................................
  const uploadToIPFS = async (file) => {
    try {
      const added = await client.add({ content: file });

      const url = `https://votingapp.infura-ipfs.io/ipfs/${added.path}`;

      // setImage(url);
      return url;
    } catch (error) {
      console.log("Error uploading file to IPFS");
    }
  };
  const uploadToIPFSCandidate = async (file) => {
    try {
      const added = await client.add({ content: file });

      const url = `https://votingapp.infura-ipfs.io/ipfs/${added.path}`;

      // setImage(url);
      return url;
    } catch (error) {
      console.log("Error uploading file to IPFS");
    }
  };
  
//  ........... create voters.................
  const createVoter =async (formInput,fileUrl,router)=>{
   try {
     const {name, address, position }=formInput;   //fileInput;
    //  console.log(name,address,position,fileUrl)
     if (!name || !address || !position) 
     return setError("input data is missing");

     // connecting to smart contract
     const web3Modal= new Web3Modal();
    //  console.log(web3Modal)
     const connection = await web3Modal.connect();
     const provider = new ethers.providers.Web3Provider(connection);
     const signer = provider.getSigner();
     const contract = fetchContract(signer);
    //  console.log(contract)


     const data = JSON.stringify({ name, address, position, image: fileUrl });
     const added = await client.add(data);

     const url = `https://votingapp.infura-ipfs.io/ipfs/${added.path}`;
      // console.log(url)
     const voter = await contract.voterRight(address, name, url, fileUrl);
     voter.wait();
 
      // console.log(voter)
     router.push("/voterList");
  
 
  } catch (error) {
    setError("error in creating voter")
   }
};
// //......get voter data......
const getAllVoterData = async () => {
  try {
   const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

//     //........ voter list.......
    const voterListData = await contract.getVoterList();
      setVoterAddress(voterListData);
      // console.log(voterAddress)

      voterListData.map(async (el) => {
      const singleVoterData = await contract.getVoterData(el);
      pushVoter.push(singleVoterData);
      // console.log(singleVoterData);
      });

      //................VOTER LENGTH............
      const voterList =await contract.getVoterLength();
      setVoterLength(voterList.toNumber())
      // console.log(voterList.toNumber())
  } catch (error) {
    setError("somthing went wrong")
   }

};
// console.log(voterAddress)
// useEffect(()=>{
//   getAllVoterData();
//   },[])


// .......give vote...
const giveVote= async(id)=>{
  try {
    const voterAddress=id.address;
    const voterId=id.id;
    const web3Modal = new Web3Modal();
     const connection = await web3Modal.connect();
     const provider = new ethers.providers.Web3Provider(connection);
     const signer = provider.getSigner();
     const contract = fetchContract(signer);

     const voteredList = await contract.vote(voterAddress,voterId);
     console.log(voteredList);
    
  } catch (error) {
    console.log(error);
    }
};


//----------------Candicdaite section-----------------

const setCandidate =async (candidateForm,fileUrl,router)=>{
  try {
    const {name, address, age }=candidateForm;   //fileInput;
   //  console.log(name,address,position,fileUrl)
    if (!name || !address || !age) 
    return setError("input data is missing");

    // connecting to smart contract
    const web3Modal= new Web3Modal();
   //  console.log(web3Modal)
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);
   //  console.log(contract)


    const data = JSON.stringify({ name, address, image: fileUrl, age});
    const added = await client.add(data);

    const ipfs = `https://votingapp.infura-ipfs.io/ipfs/${added.path}`;
    // console.log(url)
    const candidate = await contract.setCandidate(address,age, name, fileUrl,ipfs);
    candidate.wait();

     // console.log(voter)
    router.push("/");
 

 } catch (error) {
   setError("error in creating voter")
  }
};

//----------------------GET CANDIDIATE DATA-----------------------

const getNewCandidate =async ()=>{
  try {
       // connecting to smart contract
       const web3Modal= new Web3Modal();
       //  console.log(web3Modal)
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);
        

        //---------------------All Candidate------------------------

        const allCandidate= await contract.getCandidate();
        console.log(allCandidate)

        allCandidate.map(async(el)=>{
          const singleCandidateData = await contract.getCandidateData(el);
          pushCandidate.push(singleCandidateData);
      console.log(singleCandidateData);

          candidateIndex.push(singleCandidateData[2].toNumber());
        
        });

        //---------------------Candidate length-----------------
        const allCandidateLength = await contract.getCandidateLength();
        setCandidateLength(allCandidateLength.toNumber());

    
  } catch (error) {
    console.log(error)
  }
};

useEffect(()=>
{
  getNewCandidate();
})
    return (
        <VotingContext.Provider 
        value={{ 
            votingTitle,
            checkIfWalletIsConnected,
            connectWallet,
            uploadToIPFS,
            createVoter,
            getAllVoterData,
            giveVote,
            setCandidate,
            getNewCandidate,
            error,
            voterArray,
            voterLength,
            voterAddress, 
            currentAccount,
            candidateLength,
            candidateArray,
            uploadToIPFSCandidate
            }}>
            {children}
        </VotingContext.Provider>
    );
};
