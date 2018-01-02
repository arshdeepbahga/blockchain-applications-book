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
var ticketPrice;
var myContractInstance;

function initializeContract() {
  myContractInstance = SolarCharger.deployed();
  $("#cf_address").html(myContractInstance.address);
  $("#cb_address").html(account);
  refreshVars();
}

function setStatus(message) {
  $("#status").html(message);
};

function refreshBalance() {
  $("#cb_balance").html(web3.fromWei(
      web3.eth.getBalance(web3.eth.coinbase), "ether").toFixed(5));
}

function refreshVars(){
  myContractInstance.numUsers.call().then(
    function(numUsers) { 
      $("#cf_users").html(numUsers.toNumber());
      return myContractInstance.numStations.call();
  }).then(
    function(numStations) { 
      $("#cf_stations").html(numStations.toNumber());
      return myContractInstance.coinRate.call();
  }).then(
    function(coinRate) { 
      $("#cf_rate").html(coinRate.toNumber());
      refreshBalance();
  });
}

function registerUser() {
  var name = $("#name").val();
  var email = $("#email").val();
  setStatus("Initiating transaction... (please wait)");

  myContractInstance.registerUser(email, name,
     { from: web3.eth.coinbase, gas: 2000000}).then(
    function(result) {
      setStatus("Done!");
      refreshVars();
    });
}

function buyCoins() {
  var amount = parseFloat($("#amount").val());
  var email = $("#email1").val();

  setStatus("Initiating transaction... (please wait)");

  myContractInstance.buyCoins(email, 
    { from: web3.eth.coinbase, value: amount, gas: 2000000}).then(
    function(result) {
      setStatus("Done!");
      refreshVars();
    });
}

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
}
