/*
MIT License

Copyright (c) 2017 Arshdeep Bahga and Vijay Madisetti

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var accounts;
var account;
var balance;
var myContractInstance;

function initializeContract() {
  myContractInstance = Crowdfunding.deployed();
  $("#cf_address").html(myContractInstance.address);
  $("#cb_address").html(account);
  $("#qrcode").html("<img src=
    \"https://chart.googleapis.com/chart?cht=qr&chs=350&chl="+
    myContractInstance.address+"\" height=\"350\"/>");
 
  myContractInstance.numBackers.call().then(
    function(numBackers) { 
      console.log(numBackers.toNumber());
      $("#cf_backers").html(numBackers.toNumber());
      return myContractInstance.goal.call();
  }).then(
    function(goal) { 
      console.log(goal.toNumber());
      $("#cf_goal").html(web3.fromWei(goal, "ether").toFixed(5));
      return myContractInstance.campaignStatus.call();
  }).then(
    function(campaignStatus) { 
      console.log(campaignStatus);
      $("#cf_status").html(campaignStatus);
      return myContractInstance.deadline.call();
  }).then(
    function(deadline) { 
      console.log(deadline.toNumber());
      $("#cf_days").html(deadline.toNumber());
      refreshBalances();
  });
 
}

function setStatus(message) {
  $("#status").html(message);
};

function checkGoalReached() {
  myContractInstance.checkGoalReached({from: account}).then(
    function() {
    return myContractInstance.goal.call();
  }).then(
    function(goal) { 
      $("#cf_goal").html(web3.fromWei(goal, "ether").toFixed(5));
      return myContractInstance.campaignStatus.call();
  }).then(
    function(campaignStatus) { 
      console.log(campaignStatus);
      $("#cf_status").html(campaignStatus);
  });
}

function refreshBalances() {
  $("#cb_balance").html(
    web3.fromWei(web3.eth.getBalance(web3.eth.coinbase), 
                                  "ether").toFixed(5));

  myContractInstance.numBackers.call().then(
    function(numBackers) { 
      console.log(numBackers.toNumber());
      $("#cf_backers").html(numBackers.toNumber());
      return myContractInstance.amountRaised.call();
  }).then(
    function(amountRaised) { 
      $("#cf_balance").html(web3.fromWei(amountRaised, 
                          "ether").toFixed(5));
  });
};

function contribute() {
  var amount = web3.toWei(parseFloat($("#amount").val()), "ether");
  setStatus("Initiating transaction... (please wait)");

  myContractInstance.fund({from: account, value: amount}).then(
    function(result) {
    web3.eth.getTransactionReceiptMined(result).then(function(receipt) {
        setStatus("Transaction complete!");
        refreshData();
      }).catch(function(e) {
        console.log(e);
        setStatus(e);
      });
  });
  
};

window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts!");
      return;
    }

    accounts = accs;
    account = accounts[0];
    initializeContract();
  });

  web3.eth.getTransactionReceiptMined = function (txnHash, interval){
    var transactionReceiptAsync;
    interval |= 500;
    transactionReceiptAsync = function(txnHash, resolve, reject){
        try {
            var receipt = web3.eth.getTransactionReceipt(txnHash);
            if (receipt == null) {
                setTimeout(function () {
                    transactionReceiptAsync(txnHash, resolve, reject);
                }, interval);
            } else {
                resolve(receipt);
            }
        } catch(e) {
            reject(e);
        }
    };

    return new Promise(function (resolve, reject) {
        transactionReceiptAsync(txnHash, resolve, reject);
    });
  };
}
