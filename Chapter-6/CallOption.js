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
  myContractInstance = CallOption.deployed();
  $("#cf_address").html(myContractInstance.address);
  $("#cb_address").html(account);
  $("#cb_address1").html(account);
  $("#cb_address2").html(account);
  $("#qrcode").html("<img src=
    \"https://chart.googleapis.com/chart?cht=qr&chs=350&chl="+
    myContractInstance.address+"\" height=\"350\"/>");
  refreshVars();
}

function setStatus(message) {
  $("#status").html(message);
};

function setStatus1(message) {
  $("#status1").html(message);
};

function setStatus2(message) {
  $("#status2").html(message);
};

function refreshVars(){
  myContractInstance.buyer.call().then(
      function(buyer) {
        $("#cf_buyer").html(buyer);
        return myContractInstance.seller.call();
      }).then(
      function(seller) {
        $("#cf_seller").html(seller);
        return myContractInstance.strikePrice.call();
      }).then(
      function(strikePrice) {
        $("#cf_strikePrice").html(strikePrice.toNumber());
        return myContractInstance.premium.call();
      }).then(
      function(premium) {
        $("#cf_premium").html(premium.toNumber());
        return myContractInstance.underlyingName.call();
      }).then(
      function(underlyingName) {
        $("#cf_underlyingName").html(underlyingName);
        return myContractInstance.underlying.call();
      }).then(
      function(underlying) {
        $("#cf_underlying").html(underlying.toNumber());
        return myContractInstance.startTime.call();
      }).then(
      function(startTime) {
        $("#cf_startTime").html(startTime.toNumber());
        return myContractInstance.timeToExpiry.call();
      }).then(
      function(timeToExpiry) {
        $("#cf_timeToExpiry").html(timeToExpiry.toNumber());
        return myContractInstance.isActive.call();
      }).then(
      function(isActive) {
        if(isActive){
          $("#cf_isActive").html("True");
        }else{
          $("#cf_isActive").html("False");
        }
        return myContractInstance.isComplete.call();
      }).then(
      function(isComplete) {
        if(isComplete){
          $("#cf_isComplete").html("True");
        }else{
          $("#cf_isComplete").html("False");
        }
        setStatus("");
        setStatus1("");
        setStatus2("");
        refreshBalance();
      });
}

function refreshBalance() {
  var balance = web3.fromWei(web3.eth.getBalance(web3.eth.coinbase), 
                            "ether").toFixed(5);
  $("#cb_balance").html(balance);
  $("#cb_balance1").html(balance);
  $("#cb_balance2").html(balance);
}


function initialize() {
  var buyer = $("#buyer").val();
  var strikePrice = parseFloat($("#strikePrice").val());
  var underlyingName = $("#underlyingName").val();
  var underlying = parseFloat($("#underlying").val());
  var premium = parseFloat($("#premium").val());
  var timeToExpiry = parseFloat($("#timeToExpiry").val());

  setStatus("Initiating transaction... (please wait)");

  myContractInstance.initialize(buyer, strikePrice, 
      underlyingName, underlying, premium, timeToExpiry,
       {from: accounts[0]}).then(
          function() {
            refreshVars();
          });
}

function validate() {  
  var amount = parseFloat($("#premiumAmount").val());
  console.log(amount);

  setStatus1("Initiating transaction... (please wait)");

   myContractInstance.validate({from: accounts[0], 
                              value: amount}).then(
      function() {
        refreshVars();
      });
}

function exercise() {
  
  var amount = parseFloat($("#callAmount").val());
  console.log(amount);

  setStatus2("Initiating transaction... (please wait)");

   myContractInstance.exercise({from: accounts[0], 
                              value: amount}).then(
          function() {
            refreshVars();
          });
}

window.onload = function() {
  $( "#tabs" ).tabs();
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! ");
      return;
    }

    accounts = accs;
    account = accounts[0];
    initializeContract();
  });
}
