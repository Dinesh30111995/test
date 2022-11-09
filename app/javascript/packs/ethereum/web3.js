import Web3 from 'web3';
import { ethers } from 'ethers';
import axios from "axios";


const tokenURIPrefix = gon.tokenURIPrefix;
const transferProxyContractAddress = gon.transferProxyContractAddress;
const tokenAddress = gon.tokenAddress;
const tradeContractAddress = gon.tradeContractAddress;
let account;
let signer;
let provider;

async function loadWeb3() {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    window.ethereum.enable();
    await ethereum.request({method: 'eth_accounts'})

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    gon.provider = provider;
  }
}


async function getaccounts() {
  try {
    const signer = provider.getSigner();
    const accounts = await signer.getAddress();
    return accounts;
  } catch (e) {
    console.log(e)
  }
}

async function createUserSession(address, balance, destroySession) {
  const config = {
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
  const resp = await axios.post(`/sessions`, {
    address: address,
    balance: balance,
    destroy_session: destroySession
  }, config)
    .then((response) => {
      return resp
    })
    .catch(err => {
      console.log("User Session Create Error", err)
    })
  return resp;
}

async function destroyUserSession(address) {
  const config = {
    data: {},
    headers: {
      'X-CSRF-TOKEN': $('[name="csrf-token"]')[0].content,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
  const resp = axios.delete(`/sessions/${address}`, config)
    .then(response => response)
    .catch(err => console.log("Session Error: ", err))
  return resp
}

function updateTokenId(tokenId, collectionId, hash) {
  var request = $.ajax({
    url: `/collections/${collectionId}/update_token_id`,
    async: false,
    type: "POST",
    data: {tokenId: tokenId, collectionId: collectionId, tx_id:hash},
    dataType: "script"
  });
  request.done(function (msg) {
    console.log("Token Id updated.");
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Failed to update token id");
  });
}

function saveContractNonceValue(collectionId, sign) {
  var request = $.ajax({
    url: `/collections/${collectionId}/save_contract_nonce_value`,
    async: false,
    type: "POST",
    data: {signature : sign},
    dataType: "script"
  });
  request.done(function (msg) {
    console.log("Contract Nonce Value updated.");
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Failed to update nonce value");
  });
}

function createContract(name, symbol, contract_address, contractType, collectionId) {
  var request = $.ajax({
    url: '/users/create_contract',
    async: false,
    type: "POST",
    data: {
      name: name,
      symbol: symbol,
      contract_address: contract_address,
      contract_type: contractType,
      collection_id: collectionId
    },
    dataType: "script"
  });
  request.done(function (msg) {
    console.log("Token Id updated.");
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Failed to update token id");
  });
}

function updateCollectionBuy(collectionId, quantity, transactionHash, tokenId=0) {
  var request = $.ajax({
    url: '/collections/' + collectionId + '/buy',
    type: 'POST',
    async: false,
    data: {quantity: quantity, transaction_hash: transactionHash, tokenId: tokenId},
    dataType: "script",
    success: function (respVal) {
      console.log(respVal)
    }
  });
}

function updateCollectionSell(collectionId, buyerAddress, bidId, transactionHash, tokenId=0) {
  var request = $.ajax({
    url: '/collections/' + collectionId + '/sell',
    type: 'POST',
    async: false,
    data: {address: buyerAddress, bid_id: bidId, transaction_hash: transactionHash, tokenId: tokenId},
    dataType: "script",
    success: function (respVal) {
      console.log(respVal)
    }
  });
}

function updateOwnerTransfer(collectionId, recipientAddress, transactionHash, supply) {
  var request = $.ajax({
    url: '/collections/' + collectionId + '/owner_transfer',
    type: 'POST',
    async: false,
    data: {recipient_address: recipientAddress, transaction_hash: transactionHash, supply: supply},
    dataType: "script",
    success: function (respVal) {
      console.log(respVal)
    }
  });
}

function updateBurn(collectionId, transactionHash, supply) {
  var request = $.ajax({
    url: '/collections/' + collectionId + '/burn',
    type: 'POST',
    async: false,
    data: {transaction_hash: transactionHash, supply: supply},
    dataType: "script",
    success: function (respVal) {
      console.log(respVal)
    }
  });
}

async function isValidUser(address, token) {
  const config = {
    headers: {
      'X-CSRF-TOKEN': token,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
  const resp = await axios.get(`/sessions/valid_user`, {params: {address: address, authenticity_token: token}}, config)
    .then((response) => {
      console.log("validate user", response)
      return response.data
    })
    .catch(err => {
      console.log("User Session Validate Error", err)
    })
  return resp;
}

function placeBid(collectionId, sign, quantity, bidDetails) {
  var request = $.ajax({
    url: `/collections/${collectionId}/bid`,
    type: "POST",
    async: false,
    data: {sign: sign, quantity: quantity, details: bidDetails},
    dataType: "script"
  });
  request.done(function (msg) {
    console.log("Bidding success.");
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Bidding failed. Please contact support");
  });
}

function signMetadataHash(collectionId, contractAddress) {
  var sign;
  var request = $.ajax({
    url: `/collections/${collectionId}/sign_metadata_hash`,
    type: "POST",
    async: false,
    data: {contract_address: contractAddress},
    dataType: "json"
  });
  request.done(function (msg) {
    console.log(msg);
    sign = {sign: msg['signature'], nonce: msg['nonce']}
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Bidding failed. Please contact support");
  });
  return sign;
}

function sign_metadata_with_creator(creator_address, tokenURI, collectionId, trade_address=nil) {
  var sign;
  var request = $.ajax({
    url: `/collections/${collectionId}/sign_metadata_with_creator`,
    type: "POST",
    async: false,
    data: {address: creator_address, tokenURI: tokenURI, trade_address: trade_address},
    dataType: "json"
  });
  request.done(function(msg) {
    console.log(msg);
    sign = {sign: msg['signature'], nonce: msg['nonce']}
  });
  request.fail(function(jqXHR, textStatus) {
    console.log("Bidding failed. Please contact support");
  });
  return sign;
}

function updateSignature(collectionId, sign) {
  var request = $.ajax({
    url: `/collections/${collectionId}/sign_fixed_price`,
    type: "POST",
    async: false,
    data: {sign: sign},
    dataType: "script"
  });
  request.done(function (msg) {
    console.log("Signature updated.");
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Signature update failed. Please contact support");
  });
}

function getNonceValue(collectionId) {
  var nonce;
  var request = $.ajax({
    url: `/collections/${collectionId}/get_nonce_value`,
    type: "POST",
    async: false,
    data: {},
    dataType: "json"
  });
  request.done(function (data) {
    nonce = data['nonce']
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Nonce failed. Please contact support");
  });
  return nonce
}

function save_NonceValue(collectionId, sign, nonce) {
  var request = $.ajax({
    url: `/collections/${collectionId}/save_nonce_value`,
    type: "POST",
    async: false,
    data: {sign: sign, nonce: nonce},
    dataType: "script"
  });
  request.done(function (msg) {
    console.log("Nonce updated.");
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Nonce update failed. Please contact support");
  });
}

function getContractSignNonce(collectionId, sign) {
  var nonce;
  var request = $.ajax({
    url: `/collections/${collectionId}/get_contract_sign_nonce`,
    type: "POST",
    async: false,
    data: {sign: sign},
    dataType: "json"
  });
  request.done(function (data) {
    nonce = data['nonce']
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Nonce failed. Please contact support");
  });
  return nonce
}

window.approveCollection = function approveCollection(collectionId){
  var request = $.ajax({
    url: `/collections/${collectionId}/approve`,
    type: "POST",
    async: false,
    dataType: "script"
  });
  request.done(function(msg) {
    console.log("Collection updated.");
  });
  request.fail(function(jqXHR, textStatus) {
    console.log("Collection update failed. Please contact support");
  });
}

window.getContractABIAndBytecode = function getContractABIAndBytecode(contractAddress, type, shared=true) {
  var res;
  var request = $.ajax({
    async: false,
    url: '/contract_abi',
    type: "GET",
    data: {contract_address: contractAddress, type: type, shared: shared},
    dataType: "json"
  });

  request.done(function (msg) {
    res = msg;
  });

  request.fail(function (jqXHR, textStatus) {
    console.log(textStatus);
  });
  return res;
}

function splitSign(sign, nonce) {
  let sig = ethers.utils.splitSignature(sign);
  return [sig.v,sig.r,sig.s, nonce];
}

window.getContract = async function getContract(contractAddress, type, shared = true) {
  console.log(contractAddress, type, shared)
  var res = getContractABIAndBytecode(contractAddress, type, shared);
  var contractObj = new ethers.Contract(contractAddress, res['compiled_contract_details']['abi'], provider);
  console.log(contractObj)
  return contractObj
}

window.createCollectible721 = async function createCollectible721(contractAddress, tokenURI, royaltyFee, collectionId, sharedCollection) {
  try {
    var account = await getaccounts();
    console.log(account, contractAddress, 'nft721', sharedCollection)

    let contract721 = await getContract(contractAddress, 'nft721', sharedCollection);
    let contract721WithSigner = contract721.connect(signer);
    window.contract721 = contract721WithSigner;

    var gasPrices = await gasPrice();
    royaltyFee = royaltyFee ? royaltyFee : 0;
    var txn;
    if (sharedCollection) {
      var sign = await signMetadataHash(collectionId, contractAddress);
      await saveContractNonceValue(collectionId, sign);
      console.log("signStruct:", signStruct);
      var signStruct = splitSign(sign['sign'], sign['nonce']);
      console.log("signStruct:", signStruct);
      txn = await window.contract721.createCollectible(tokenURI, royaltyFee, signStruct, {
        from: account,
        gasPrice: String(gasPrices)
      });
    } else {
      console.log(window.contract721)
      txn = await window.contract721.createCollectible(tokenURI, royaltyFee,{
        from: account,
        gasPrice: String(gasPrices)
      });
    }
    txn = await txn.wait();
    var tokenId = parseInt(txn.logs[1].topics[1]);
    console.log(tokenId)
    var tx_hash = txn.transactionHash;
    console.log(tokenId)
    await updateTokenId(tokenId, collectionId,tx_hash)
    return window.collectionMintSuccess(collectionId)
  } catch (err) {
    console.error(err);
    return window.collectionMintFailed(err['message'])
  }
}

window.createCollectible1155 = async function createCollectible1155(contractAddress, supply, tokenURI, royaltyFee, collectionId, sharedCollection) {
  try {
    var account = await getaccounts();
    console.log(contractAddress, 'nft1155', sharedCollection)
    let contract1155 = await getContract(contractAddress, 'nft1155', sharedCollection);
    let contract1155WithSigner = contract1155.connect(signer);
    window.contract1155 = contract1155WithSigner;
    console.log(account)
    royaltyFee = royaltyFee ? royaltyFee : 0;
    var gasPrices = await gasPrice();
    var txn;
    if (sharedCollection) {
      var sign = await signMetadataHash(collectionId, contractAddress);
      await saveContractNonceValue(collectionId, sign)
      var signStruct = splitSign(sign['sign'], sign['nonce']);
      console.log("signStruct:", signStruct);
      txn = await window.contract1155.mint(tokenURI, supply, royaltyFee, signStruct,{
        from: account,
        gasPrice: String(gasPrices)
      });
    } else {
      txn = await window.contract1155.mint(tokenURI, supply, royaltyFee,{
        from: account,
        gasPrice: String(gasPrices)
      });
    }
    txn = await txn.wait();
	  console.log(txn)
    var tokenId = parseInt(txn.logs[1].topics[1]);
    console.log(tokenId)
    var tx_hash = txn.transactionHash;
    await updateTokenId(tokenId, collectionId,tx_hash)
    return window.collectionMintSuccess(collectionId)
  } catch (err) {
    console.error(err);
    return window.collectionMintFailed(err['message'])
  }
}

window.deployContract = async function deployContract(abi, bytecode, name, symbol, contractType, collectionId) {
   try {
    const contractDeploy = await new ethers.ContractFactory(abi, bytecode, signer);
    let contract = await contractDeploy.deploy(name, symbol, tokenURIPrefix);
    await contract.deployTransaction.wait();
    var contractAddress;
    var account =  await getaccounts();

    console.log('Contract was deployed at the following address:');
    console.log(contract.address);
    contractAddress = contract.address;
    $('#nft_contract_address').val(contractAddress);
    createContract(name, symbol, contractAddress, contractType, collectionId);
    window.contractDeploySuccess(contractAddress, contractType)
  }catch (err){
    console.error(err);
    window.contractDeployFailed(err['message'])
  };
}

window.approveNFT = async function approveNFT(contractType, contractAddress, sharedCollection, sendBackTo = 'collection', existingToken=null) {
  try {
    console.log(contractAddress, contractType, sharedCollection)
    var account = await getaccounts();
    let contractNFT = await getContract(contractAddress, contractType, sharedCollection);
    const contract = contractNFT.connect(signer);
    window.contract = contract;
    var isApproved = await window.contract.isApprovedForAll(account, transferProxyContractAddress);
    if (!isApproved) {
      var receipt = await window.contract.setApprovalForAll(transferProxyContractAddress, true, {from: account});
    }
    if (sendBackTo == 'executeBid') {
      return window.approveBidSuccess()
    } else {
      return window.collectionApproveSuccess(contractType, existingToken);
    }
  } catch (err) {
    console.error(err);
    if (sendBackTo == 'executeBid') {
      return window.approveBidFailed(err['message'])
    } else {
      return window.collectionApproveFailed(err['message'])
    }
  }
}

window.approveResaleNFT = async function approveResaleNFT(contractType, contractAddress, sharedCollection) {
  try {
    console.log(contractAddress, contractType, sharedCollection)
    var account = await getaccounts();
    let contractNFT = await getContract(contractAddress, contractType, sharedCollection);
    const contract = contractNFT.connect(signer);
    var isApproved = await contract.isApprovedForAll(account, transferProxyContractAddress);
    if (!isApproved) {
      var receipt = await contract.setApprovalForAll(transferProxyContractAddress, true, {from: account});
    }
    return window.approveResaleSuccess(contractType);
  } catch (err) {
    console.error(err);
    return window.approveResaleFailed(err['message'])
  }
}

//TODO: OPTIMIZE
window.isApprovedNFT = async function isApprovedNFT(contractType, contractAddress) {
  try {
    var contract = await getContract(contractAddress, contractType);
    var account = window.ethereum.selectedAddress
    var isApproved = await contract.methods.isApprovedForAll(account, transferProxyContractAddress).call();
    return isApproved;
  } catch (err) {
    console.error(err);
  }
}

window.burnNFT = async function burnNFT(contractType, contractAddress, tokenId, supply = 1, collectionId, sharedCollection) {
  try {
    var contractNFT = await getContract(contractAddress, contractType, sharedCollection);
    const contract = contractNFT.connect(signer);
    var account = await getaccounts();

    if (contractType == 'nft721') {
      var receipt = await contract.burn(tokenId, {from: account});
    } else if (contractType == 'nft1155') {
      var receipt = await contract.burn(tokenId, supply, {from: account});
    }
    await updateBurn(collectionId, receipt.transactionHash, supply)
    return window.burnSuccess(receipt.transactionHash);
  } catch (err) {
    console.error(err);
    return window.burnFailed(err['message'])
  }
}

window.directTransferNFT = async function directTransferNFT(contractType, contractAddress, recipientAddress, tokenId, supply = 1, shared, collectionId) {
  try {
    console.log(contractType, contractAddress, recipientAddress, tokenId, supply, shared, collectionId)
    var contractNFT = await getContract(contractAddress, contractType, shared);//for all direct transfer it should interact with trade contract
    const contract = contractNFT.connect(signer);
    var account = await getaccounts();
    if (contractType == 'nft721') {
      var receipt = await contract["safeTransferFrom(address,address,uint256)"](account, recipientAddress, tokenId, {from: account});
    } else if (contractType == 'nft1155') {
      // TODO: Analyse and use proper one in future
      var tempData = "0x6d6168616d000000000000000000000000000000000000000000000000000000"
      var receipt = await contract["safeTransferFrom(address,address,uint256,uint256,bytes)"](account, recipientAddress, tokenId, supply, tempData, {from: account});
    }
    await updateOwnerTransfer(collectionId, recipientAddress, receipt.transactionHash, supply)
    return window.directTransferSuccess(receipt.transactionHash, collectionId);
  } catch (err) {
    console.error(err);
    return window.directTransferFailed(err['message']);
  }
}

window.approveERC20 = async function approveERC20(contractAddress, contractType, amount, decimals = 18, sendBackTo = 'Bid') {
  try {
    console.log(contractAddress, contractType, gon.collection_data['contract_shared'])
    amount = roundNumber(mulBy(amount, 10 ** decimals), 0);
    // var approvedAmount = await approvedTokenBalance(contractAddress);
    // var tokenBalance = await tokenBalance(contractAddress, decimals);
    // if((parseInt(amount)+parseInt(approvedAmount)) >= tokenBalance) {
    //   console.log("Insufficient amount to approve.")
    //   return;
    // }
    var compiledContractDetails = getContractABIAndBytecode(contractAddress, contractType, gon.collection_data['contract_shared']);
    var abi = compiledContractDetails['compiled_contract_details']['abi'];
    var contractNFT = await getContract(contractAddress, contractType);
    const contract = contractNFT.connect(signer);

    var account = await getaccounts();
    var balance = await contract.allowance(account, transferProxyContractAddress);
    amount = BigInt(parseInt(balance) + parseInt(amount)).toString()
    console.log(compiledContractDetails)
    console.log(account)
    console.log(contractAddress)
    var receipt = await contract.approve(transferProxyContractAddress, amount, {from: account});
    if (sendBackTo == 'Buy') {
      return window.buyApproveSuccess(receipt.transactionHash, contractAddress)
    } else {
      return window.bidApproveSuccess(receipt.transactionHash, contractAddress)
    }
  } catch (err) {
    console.error(err);
    if (sendBackTo == 'Buy') {
      return window.buyApproveFailed(err['message'])
    } else {
      return window.bidApproveFailed(err['message'])
    }
  }
}

window.approveSwap = async function approveSwap(requestorAddress, ownerAddress,requestorContractAddress, requestorTokenId, ownerContractAddress, ownerTokenId, requestor_quantity, owner_quantity, signature, asset_type, swapId, collectionId) {
  try {
    console.log(requestorAddress, ownerAddress,requestorContractAddress, requestorTokenId, ownerContractAddress, ownerTokenId, requestor_quantity, owner_quantity, signature)
    var compiledContractDetails = getContractABIAndBytecode(tradeContractAddress, 'trade');
    var abi = compiledContractDetails['compiled_contract_details']['abi'];
    var contractNFT = new ethers.Contract(tradeContractAddress, abi);
    const contract = contractNFT.connect(signer);
    var account = await getaccounts();
    var gasPrices = await gasPrice();
    var collectionId = gon.collection_data.collection_id
    var nonce_value = await getContractSignNonce(collectionId, signature);
    console.log(gasPrices)
    var swapStruct = [
      ownerAddress,
      requestorAddress,
      asset_type,
      requestorTokenId,
      ownerTokenId,
      requestorContractAddress,
      ownerContractAddress,
      owner_quantity,
      requestor_quantity
    ]
    console.log('swapStruct----> ', swapStruct);
    var receipt = await contract.swapToken(swapStruct ,splitSign(signature, nonce_value),{from: account, gasPrice: String(gasPrices)});
    await updateSwapStatus(collectionId, swapId,receipt.transactionHash)
    swapSuccess(collectionId)
  } catch (err) {
    console.error(err);
    swapFailed(err['message'])
  }
}

window.approvedTokenBalance = async function approvedTokenBalance(contractAddress) {
  var contract = await getContract(contractAddress, 'erc20', false);
  var account = window.ethereum.selectedAddress
  var balance = await contract.allowance(account, transferProxyContractAddress);
  return balance;
}

window.convertToken = async function convertToken(amount, sendBackTo = 'Bid', decimals = 18) {
  try {
    amount = roundNumber(mulBy(amount, 10 ** decimals), 0);
    var compiledContractDetails = getContractABIAndBytecode(tokenAddress, 'erc20');
    var abi = compiledContractDetails['compiled_contract_details']['abi'];

    var contract = await new window.web3.eth.Contract(abi, tokenAddress);
    var account = window.ethereum.selectedAddress
    var gasPrices = await gasPrice();
    console.log(gasPrices);
    var receipt = await contract.methods.deposit().send({from: account, value: amount,gas: 316883,gasPrice: String(gasPrices)});

    if (sendBackTo == 'Buy') {
      return window.buyConvertSuccess(receipt.transactionHash)
    } else {
      return window.bidConvertSuccess(receipt.transactionHash)
    }
  } catch (err) {
    console.error(err);
    if (sendBackTo == 'Buy') {
      return window.bidConvertFailed(err['message'])
    } else {
      return window.bidConvertFailed(err['message'])
    }

  }
}

window.updateBuyerServiceFee = async function updateBuyerServiceFee(buyerFeePermille) {
  try {
    var compiledContractDetails = getContractABIAndBytecode(tradeContractAddress, 'trade');
    var abi = compiledContractDetails['compiled_contract_details']['abi'];
    var contractNFT = await new ethers.Contract( tradeContractAddress, abi, provider);
    const contract = contractNFT.connect(signer);
    var account = await getaccounts();
    var gasPrices = await gasPrice();
    console.log(gasPrices)
    var receipt = await contract.setBuyerServiceFee(buyerFeePermille, {from: account, gasPrice: String(gasPrices)});
    console.log("buyer",String(receipt.status))
    if(String(receipt.status) === "true"){
      $("form#fee_form").submit();
      $("div.loading-gif.displayInMiddle").hide()
    }

  } catch (err) {
    return false
    console.error(err);
  }
}

window.updateSellerServiceFee = async function updateSellerServiceFee(sellerFeePermille) {
  try {
    var compiledContractDetails = getContractABIAndBytecode(tradeContractAddress, 'trade');
    var abi = compiledContractDetails['compiled_contract_details']['abi'];
    var contractNFT = await new ethers.Contract(abi, tradeContractAddress);
    const contract = contractNFT.connect(signer);
    var account = await getaccounts();
    var gasPrices = await gasPrice();
    console.log(gasPrices)
    var receipt = await contract.setSellerServiceFee(sellerFeePermille, {from: account, gasPrice: String(gasPrices)});
    console.log("seller",receipt)
    console.log(String(receipt.status))
    if(String(receipt.status) === "true"){
      $("form#fee_form").submit();
      $("div.loading-gif.displayInMiddle").hide();
    }
  } catch (err) {
    console.error(err);

  }
}

window.bidAsset = async function bidAsset(assetAddress, tokenId, qty = 1, amount, payingTokenAddress, decimals = 18, collectionId, bidPayAmt) {
  try {
    console.log(assetAddress, tokenId, qty, amount, payingTokenAddress, decimals, collectionId, bidPayAmt)
    var amountInDec = roundNumber(mulBy(amount, 10 ** decimals), 0);
    console.log(amountInDec)
    var nonce_value = await getNonceValue(collectionId);
    var messageHash = ethers.utils.solidityKeccak256(['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256'], [assetAddress, tokenId, payingTokenAddress, amountInDec, qty, nonce_value]);
    console.log([assetAddress, tokenId, payingTokenAddress, amountInDec, qty, nonce_value])
    messageHash = ethers.utils.arrayify(messageHash);
    console.log(messageHash)
    var account = await getaccounts();
    const signature = await signer.signMessage(messageHash);
    await placeBid(collectionId, signature, qty, {
      asset_address: assetAddress,
      token_id: tokenId,
      quantity: qty,
      amount: bidPayAmt,
      amount_with_fee: amount,
      payment_token_address: payingTokenAddress,
      payment_token_decimals: decimals
    });
    await save_NonceValue(collectionId, signature, nonce_value);
    return window.bidSignSuccess(collectionId)
  } catch (err) {
    console.error(err);
    return window.bidSignFailed(err['message'])
  }
}

window.signMessage = async function signMessage(msg) {
  try {
    var sign = signer.signMessage(msg);
    return sign;
  } catch (err) {
    console.log(err);
    return ""
  }
}

window.signSellOrder = async function signSellOrder(amount, decimals, paymentAssetAddress, tokenId, assetAddress, collectionId, sendBackTo='') {
  try {
    amount = roundNumber(mulBy(amount, 10 ** decimals), 0);
    console.log(assetAddress, tokenId, paymentAssetAddress, amount)
    var nonce_value = await getNonceValue(collectionId);
    var messageHash = ethers.utils.solidityKeccak256(['address', 'uint256', 'address', 'uint256', 'uint256'], [assetAddress, tokenId, paymentAssetAddress, amount, nonce_value]);
    messageHash = ethers.utils.arrayify(messageHash);
    var account = getCurrentAccount()
    const fixedPriceSignature = await signer.signMessage(messageHash, account);
    await updateSignature(collectionId, fixedPriceSignature)
    await save_NonceValue(collectionId, fixedPriceSignature, nonce_value)
    if (sendBackTo == 'update') {
      return window.updateSignFixedSuccess(collectionId)
    } else {
      return window.bidSignFixedSuccess(collectionId)
    }
  } catch (err) {
    console.error(err);
    if(sendBackTo == 'update'){
      return window.updateSignFixedFailed(err['message'])
    }else{
      return window.bidSignFixedFailed(err['message'])
    }
  }
}

window.signSwap = async function signSwap(requestor_contract_address, requestor_collection_token, owner_contract_address, owner_collection_token, requestor_quantity, owner_quantity, collectionId){
  try {
    console.log(requestor_contract_address, requestor_collection_token, owner_contract_address, owner_collection_token, requestor_quantity, owner_quantity,collectionId)
    var nonce_value = await getNonceValue(collectionId);
    // var messageHash = window.web3.utils.soliditySha3(owner_contract_address, requestor_collection_token, requestor_contract_address, owner_collection_token, requestor_quantity, nonce_value);
    // var account = window.ethereum.selectedAddress
    // const signSwap = await window.web3.eth.personal.sign(messageHash, account);

    var messageHash = ethers.utils.solidityKeccak256(['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256'], [owner_contract_address, requestor_collection_token, requestor_contract_address, owner_collection_token, requestor_quantity, nonce_value]);
    messageHash = ethers.utils.arrayify(messageHash);
    console.log(messageHash)
    signer = provider.getSigner();
    const signSwap = await signer.signMessage(messageHash,);

    await save_NonceValue(collectionId, signSwap, nonce_value)
    return window.updateSignSwapSuccess(signSwap)
  } catch (err) {
    console.error(err);
    return window.updateSignSwapFailed(err['message'])
  }
}


window.createSwap = async function createSwap(owner_collection_address, requestor_collection_id, requestor_quantity, owner_quantity, signature){
  var request = $.ajax({
    url: `/collections/${owner_collection_address}/swap_request`,
    type: "POST",
    async: false,
    data: {requestor_collection_id: requestor_collection_id, requestor_quantity: requestor_quantity, owner_quantity: owner_quantity, signature: signature},
    dataType: "script"
  });
  request.done(function (msg) {
    console.log("Swap Request success");
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Swap request failed");
  });
}

window.verifySwap = async function verifySwap(owner_collection_address, swap_id){
  var resp = false
  $.ajax({
    url: `/collections/${owner_collection_address}/verify_swap`,
    type: "POST",
    async: false,
    data: {swap_id: swap_id},
    success: function (respVal) {
      resp = respVal
    }
  });
  return resp;
}

window.updateSwapStatus = async function updateSwapStatus(collectionId, swapId,transactionHash){
  var request = $.ajax({
    url: `/collections/${collectionId}/approve_swap`,
    type: "POST",
    async: false,
    data: {swap_id: swapId, transaction_hash: transactionHash},
    dataType: "script"
  });
  request.done(function (msg) {
    console.log("Swap approve success");
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Swap approve failed");
  });
}

window.rejectSwap = async function rejectSwap(owner_collection_address, swapId){
  var request = $.ajax({
    url: `/collections/${owner_collection_address}/reject_swap`,
    type: "POST",
    async: false,
    data: {swap_id: swapId},
    dataType: "script"
  });
  request.done(function (msg) {
    console.log("Swap Request rejection success");
  });
  request.fail(function (jqXHR, textStatus) {
    console.log("Swap request rejection failed");
  });
}
// buyingAssetType = 1 # 721
// buyingAssetType = 0 # 1155
window.buyAsset = async function buyAsset(assetOwner, buyingAssetType, buyingAssetAddress, tokenId, unitPrice, buyingAssetQty,
                                          paymentAmt, paymentAssetAddress, decimals, sellerSign, collectionId) {
  try {
    paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** decimals), 0);
    unitPrice = roundNumber(mulBy(unitPrice, 10 ** decimals), 0);
    var compiledContractDetails = getContractABIAndBytecode(tradeContractAddress, 'trade');
    var abi = compiledContractDetails['compiled_contract_details']['abi'];

    var contractNFT = new ethers.Contract( tradeContractAddress, abi, provider);
    const contract = contractNFT.connect(signer);

    var nonce_value = await getContractSignNonce(collectionId, sellerSign);
    var account = await getaccounts();

    // supply, tokenURI, royalty needs to be passed but WILL NOT be used by the Contract
    var supply = 0;
    var tokenURI = "abcde";
    var royaltyFee = 0;

    var orderStruct = [
      assetOwner,
      account,
      paymentAssetAddress,
      buyingAssetAddress,
      buyingAssetType,
      unitPrice,
      paymentAmt,
      tokenId,
      supply,
      tokenURI,
      royaltyFee,
      buyingAssetQty
    ]
    var gasPrices = await gasPrice();
    console.log(gasPrices)
    var receipt = await contract.buyAsset(
      orderStruct,
      gon.collection_data["imported"],
      splitSign(sellerSign, nonce_value)
    ,{from: account, gasPrice: String(gasPrices)});
    receipt = await receipt.wait();
    await updateCollectionBuy(collectionId, buyingAssetQty, receipt.transactionHash)
    return window.buyPurchaseSuccess(collectionId)
  } catch (err) {
    console.error(err);
    return window.buyPurchaseFailed(err['message'])
  }
}
window.getTokenId = function getTokenId(receipt, buyingAssetType) {
  if(buyingAssetType == 2) {
    var tokenId = receipt.events[0].data.slice(0, 66)
  }else{
    var tokenId = receipt.events[0].topics[3]
  }
  return parseInt(tokenId);
}
window.MintAndBuyAsset = async function MintAndBuyAsset(assetOwner, buyingAssetType, buyingAssetAddress, tokenId, unitPrice, buyingAssetQty,
                                          paymentAmt, paymentAssetAddress, decimals, sellerSign, collectionId, tokenURI, royaltyFee, sharedCollection, supply, trade_address) {
  try {
    paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** decimals), 0);
    unitPrice = roundNumber(mulBy(unitPrice, 10 ** decimals), 0);
    var buyingAssetType = buyingAssetType + 2; // BuyAssetType -> 3: Lazy721 , 2: Lazy1155, 1:721, 0: 1155
    var compiledContractDetails = getContractABIAndBytecode(tradeContractAddress, 'trade');
    var abi = compiledContractDetails['compiled_contract_details']['abi'];
    var contractNFT = new ethers.Contract( tradeContractAddress, abi, provider);
    const contract = contractNFT.connect(signer);
    var nonce_value = await getContractSignNonce(collectionId, sellerSign);
    var account = await getaccounts();
    royaltyFee = royaltyFee ? royaltyFee : 0;
    //token ID calculating
    // window.contract721 = await getContract(buyingAssetAddress, 'nft721', sharedCollection);
    // tokenId = await window.contract721.methods.tokenCounter().call();
    // tokenId = parseInt(tokenId)
    var orderStruct = [
      assetOwner,
      account,
      paymentAssetAddress,
      buyingAssetAddress,
      buyingAssetType,
      unitPrice,
      paymentAmt,
      tokenId,
      supply,
      tokenURI,
      royaltyFee,
      buyingAssetQty
    ]
    // ownerSign -> selleraddress & URI
    var gasPrices = await gasPrice();
    var ownerSign = await sign_metadata_with_creator(assetOwner, tokenURI, collectionId, trade_address);
    await saveContractNonceValue(collectionId, ownerSign)
    console.log(ownerSign, orderStruct)
    var receipt = await contract.mintAndBuyAsset(
      orderStruct,
      splitSign(ownerSign['sign'], ownerSign['nonce']),
      splitSign(sellerSign, nonce_value),
      {from: account, gasLimit: 516883, gasPrice: String(gasPrices)});
    receipt = await receipt.wait();
    tokenId = getTokenId(receipt, buyingAssetType)
    await updateCollectionBuy(collectionId, buyingAssetQty, receipt.transactionHash, tokenId)
    return window.buyPurchaseSuccess(collectionId)
  } catch (err) {
    console.error(err);
    return window.buyMintAndPurchaseFailed(err['message'])
  }
}


window.MintAndAcceptBid = async function MintAndAcceptBid(buyer, buyingAssetType, buyingAssetAddress, tokenId, paymentAmt, buyingAssetQty, paymentAssetAddress, decimals, buyerSign, collectionId, bidId, tokenURI, royaltyFee, sharedCollection,supply, trade_address) {
  try {
    console.log(tokenURI, royaltyFee, sharedCollection)
    paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** decimals), 0);
    var unitPrice = 1;
    var buyingAssetType = buyingAssetType + 2; // BuyAssetType -> 3: Lazy721 , 2: Lazy1155, 1:721, 0: 1155
    var compiledContractDetails = getContractABIAndBytecode(tradeContractAddress, 'trade');
    var abi = compiledContractDetails['compiled_contract_details']['abi'];
    var contractNFT = new ethers.Contract(tradeContractAddress, abi, provider);
    const contract = contractNFT.connect(signer);
    var nonce_value = await getContractSignNonce(collectionId, buyerSign);
    var account = await getaccounts();
    //token ID calculating
    window.contract721 = await getContract(buyingAssetAddress, 'nft721', sharedCollection);
    // tokenId = await window.contract721.methods.tokenCounter().call();
    // tokenId = parseInt(tokenId)
    royaltyFee = royaltyFee ? royaltyFee : 0;
    var orderStruct = [
      account,
      buyer,
      paymentAssetAddress,
      buyingAssetAddress,
      buyingAssetType,
      unitPrice,
      paymentAmt,
      tokenId,
      supply,
      tokenURI,
      royaltyFee,
      buyingAssetQty
    ]
    var gasPrices = await gasPrice();
    // ownerSign -> selleraddress & URI

    var ownerSign = await sign_metadata_with_creator(account, tokenURI, collectionId, trade_address);
    await saveContractNonceValue(collectionId, ownerSign)
    console.log(ownerSign)
    var receipt = await contract.mintAndExecuteBid(
      orderStruct,
      splitSign(ownerSign['sign'], ownerSign['nonce']),
      splitSign(buyerSign, nonce_value),
      {from: account, gasLimit: 516883, gasPrice: String(gasPrices)});
    receipt = await receipt.wait();
    tokenId = getTokenId(receipt, buyingAssetType)
    await updateCollectionSell(collectionId, buyer, bidId, receipt.transactionHash, tokenId)
    return window.acceptBidSuccess(collectionId)
  } catch (err) {
    console.error(err);
    return window.acceptBidFailed(err['message'])
  }
}

window.executeBid = async function executeBid(buyer, buyingAssetType, buyingAssetAddress, tokenId, paymentAmt, buyingAssetQty, paymentAssetAddress, decimals, buyerSign, collectionId, bidId) {
  try {
    paymentAmt = roundNumber(mulBy(paymentAmt, 10 ** decimals), 0);
    var unitPrice = 1;
    var compiledContractDetails = getContractABIAndBytecode(tradeContractAddress, 'trade');
    var abi = compiledContractDetails['compiled_contract_details']['abi'];
    var contractNFT = new ethers.Contract(tradeContractAddress, abi, provider);
    const contract = contractNFT.connect(signer);
    var nonce_value = await getContractSignNonce(collectionId, buyerSign);
    var account = await getaccounts();
    // supply, tokenURI, royalty needs to be passed but WILL NOT be used by the Contract
    var supply = 0;
    var tokenURI = "abcde";
    var royaltyFee = 0;

    var orderStruct = [
      account,
      buyer,
      paymentAssetAddress,
      buyingAssetAddress,
      buyingAssetType,
      unitPrice,
      paymentAmt,
      tokenId,
      supply,
      tokenURI,
      royaltyFee,
      buyingAssetQty
    ]
    var gasPrices = await gasPrice();
    var receipt = await contract.executeBid(
      orderStruct,
      gon.collection_data["imported"],
      splitSign(buyerSign, nonce_value),
      {from: account, gasPrice: String(gasPrices)});
    await updateCollectionSell(collectionId, buyer, bidId, receipt.transactionHash)
    return window.acceptBidSuccess(collectionId)
  } catch (err) {
    console.error(err);
    return window.acceptBidFailed(err['message'])
  }
}

function getCurrentAccount() {
  return getaccounts();
}

window.ethBalance = async function ethBalance() {
  var account = await getaccounts();
  var bal = await signer.getBalance();
  var ethBal = roundNumber(ethers.utils.formatEther(bal), 4);
  console.log(ethBal)
  return ethBal
}

window.updateEthBalance = async function updateEthBalance() {
  var ethBal = await window.ethBalance()
  $('.curBalance').html(ethBal + 'ETH')
  $('.curEthBalance').text(ethBal)
}

window.tokenBalance = async function tokenBalance(contractAddress, decimals) {
  var abi = [{
    "constant":true,
    "inputs":[{"name":"","type":"address"}],
    "name":"balanceOf",
    "outputs":
    [{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
  var contract = new ethers.Contract( contractAddress, abi, provider);
  var account = await getaccounts();
  var balance = await contract.balanceOf(account);
  var bal = parseInt(balance);
  balance = roundNumber(divBy(bal, (10 ** decimals)), 4)
  return balance
}

window.getNetworkType = async function getNetworkType() {
  var type = await provider.getNetwork();
  return type["name"];
}

function showTermsCondition(account, ethBal, networkType) {
  var account = account || getaccounts();
  console.log("showTermsCondition: ", account)
  // $("#terms-and-condition").modal("show")
  $.magnificPopup.open({
    closeOnBgClick: false ,
		enableEscapeKey: false,
    items: {
      src: '#terms-and-condition'
    },
    type: 'inline'
  });
  $("#account").val(account)
  $("#eth_balance_tc").val(ethBal)
  $("#network_type").val(networkType)
}

async function load(shoulDestroySession = false) {
  if (window.ethereum) {
    await loadWeb3();
    var account = await getaccounts();
    var networkType = await getNetworkType();
    var ethBal = await ethBalance();
    const isValidUserResp = await isValidUser(account, '')
    if (isValidUserResp.user_exists) {
      await createUserSession(account, ethBal, shoulDestroySession)
      if (shoulDestroySession) {
        window.location.href = '/'
      } else {
        return true
      }
    } else {
      if (gon.session) {
        if (account) {
          await destroySession()
        }
        window.location.href = '/'
      } else {
        showTermsCondition(account, ethBal, networkType)
        return false
      }
    }
  }
}

window.disconnect = async function disconnect(address) {
  await destroySession()
  window.location.href = '/'
}

async function destroySession() {
  if (gon.session) {
    console.log("IN DESTROY: ", gon.session)
    await destroyUserSession(account)
  }
}

window.connect = async function connect(address) {
  if(typeof web3 === 'undefined' && mobileCheck()) {
    window.open(`https://metamask.app.link/dapp/` + location.hostname, '_blank').focus();
    return
  }else if (typeof web3 !== 'undefined') {
    const status = await load();
    if (status) {
      window.location.href = '/'
    }
  } else {
    toastr.error('Please install Metamask Extension to your browser.')
  }
}

window.proceedWithLoad = async function proceedWithLoad() {
  var account = $("#account").val()
  const ethBal = $("#eth_balance").text()
  const networkType = $("#network_type").val()
  if ($("#condition1").is(":checked") && $("#condition2").is(":checked") && $("#condition3").is(":checked")) {
    await createUserSession(account, ethBal, networkType)
    window.location.href = '/'
  } else {
    toastr.error('Please accept the conditions to proceed')
  }
}

window.loadUser = async function loadUser() {
  if (window.ethereum && gon.session) {
    load();
  }
}

async function loadAddress() {
  await loadWeb3();
}

$(function () {
  loadAddress();
});

if (window.ethereum){
  window.ethereum.on('accountsChanged', function (acc) {
    if (window.ethereum && gon.session) {
      load(true);
    } else {
      window.location.reload();
    }
  })
  window.ethereum.on('chainChanged', function (chainId) {
    if (window.ethereum && gon.session) {
      load(true);
    } else {
      window.location.reload();
    }
  })
}

function gasPrice(){
  var init_gasPrice = '400000000000';
  if ( gon.tokenSymbol == "WBNB"){
    init_gasPrice= '100000000000';
  }
  if(gon.tokenSymbol == "WETH" || gon.tokenSymbol == "WMATIC"){
    try {
      var request = $.ajax({
        url: `/gas_price`,
        async: false,
        type: "GET"
      });
      request.done(function (msg) {
        console.log("Get Fastest Value from the API");
        if (msg['gas_price'] != '')
        {
          init_gasPrice = msg['gas_price']['fastest'] * 10**8;
        }
      });
      request.fail(function (jqXHR, textStatus) {
        console.log("Failed to get fastest value");
       });
    } catch (err) {
      console.error(err);
    }
  }
  console.log(init_gasPrice)
  return toNum(init_gasPrice);
}

window.ethereum && window.ethereum.on('chainChanged', function (chainId) {
  if (gon.session) {
    load(true);
  }
})

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

