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

// Initialize
function initializeContract() {
  myContractInstance = RevenueShare.deployed();
  $("#c_address").html(myContractInstance.address);
  $("#cb_address").html(account);
  $("#a_address").html(accounts[1]);
  $("#b_address").html(accounts[2]);

  myContractInstance.setShareholders(accounts[1], 
      accounts[2], {from: account}).then(function() {
    refreshBalances();
  }).catch(function(e) {
    console.log(e);
  });

}

function setStatus(message) {
  $("#status").html(message);
};

function refreshBalances() {
  $("#c_balance").html(web3.fromWei(
        web3.eth.getBalance(myContractInstance.address), 
                            "ether").toFixed(5));
  $("#a_balance").html(web3.fromWei(
        web3.eth.getBalance(accounts[1]), "ether").toFixed(5));
  $("#b_balance").html(web3.fromWei(
        web3.eth.getBalance(accounts[2]), "ether").toFixed(5));
  $("#cb_balance").html(web3.fromWei(
        web3.eth.getBalance(web3.eth.coinbase), "ether").toFixed(5));
};

function send() {

  var amount = web3.toWei(parseFloat($("#amount").val()), "ether");

  setStatus("Initiating transaction... (please wait)");

  web3.eth.sendTransaction({from: web3.eth.coinbase, 
      to: myContractInstance.address, value: amount}, 
          function(error, result) {
    if(error) {
      console.log(error);
      setStatus(error);
    }
    else {
      web3.eth.getTransactionReceiptMined(result).then(function(receipt){
        setStatus("Transaction complete!");
        refreshBalances();
      }).catch(function(e) {
        console.log(e);
        setStatus(e);
      });
    }
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

  web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
    var transactionReceiptAsync;
    interval |= 500;
    transactionReceiptAsync = function(txnHash, resolve, reject) {
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
