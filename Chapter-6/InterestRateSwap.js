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
  myContractInstance = InterestRateSwap.deployed();
  $("#cf_address").html(myContractInstance.address);
  $("#cb_address").html(accounts[0]);
  $("#cb_address1").html(accounts[1]);
  $("#cb_address2").html(accounts[0]);
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
  myContractInstance.partyA.call().then(
      function(partyA) {
        $("#cf_partyA").html(partyA);
        return myContractInstance.partyB.call();
      }).then(
      function(partyB) {
        $("#cf_partyB").html(partyB);
        return myContractInstance.notional.call();
      }).then(
      function(notional) {
        $("#cf_notional").html(notional.toNumber());
        return myContractInstance.fixedRate.call();
      }).then(
      function(fixedRate) {
        $("#cf_fixedRate").html(fixedRate.toNumber());
        return myContractInstance.floatingRateMargin.call();
      }).then(
      function(floatingRateMargin) {
        $("#cf_floatingRateMargin").html(floatingRateMargin.toNumber());
        return myContractInstance.lastAmountPaid.call();
      }).then(
      function(lastAmountPaid) {
        $("#cf_lastAmountPaid").html(lastAmountPaid.toNumber());
        return myContractInstance.schedule.call();
      }).then(
      function(schedule) {
        $("#cf_schedule").html(schedule.toNumber());
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
        return myContractInstance.isExpired.call();
      }).then(
      function(isExpired) {
        if(isExpired){
          $("#cf_isExpired").html("True");
        }else{
          $("#cf_isExpired").html("False");
        }
        setStatus("");
        setStatus1("");
        setStatus2("");
        refreshBalance();
      });
}

function refreshBalance() {
  var balance = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]), 
                            "ether").toFixed(5);
  $("#cb_balance").html(balance);
  $("#cb_balance2").html(balance);
  var balance1 = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), 
                              "ether").toFixed(5);
  $("#cb_balance1").html(balance1);
}

function initialize() {
  var partyATradingAcct = $("#partyATradingAcct").val();
  var partyBTradingAcct = $("#partyBTradingAcct").val();
  var fixedRate = parseFloat($("#fixedRate").val());
  var floatingRateMargin = parseFloat($("#floatingRateMargin").val());
  var notional = parseFloat($("#notional").val());
  var schedule = parseFloat($("#schedule").val());
  var rateFeed = $("#rateFeed").val();
  var feedName = $("#feedName").val();
  var timeToExpiry = parseFloat($("#timeToExpiry").val());

  setStatus("Initiating transaction... (please wait)");

  myContractInstance.initialize(partyATradingAcct, partyBTradingAcct, 
          fixedRate, floatingRateMargin, notional, schedule, feedName, 
          rateFeed, timeToExpiry, 
          {from: web3.eth.accounts[0], gas: 2000000}).then(
          function() {
            refreshVars();
          });
}

function validate() {
  setStatus1("Initiating transaction... (please wait)");
   myContractInstance.validate({from: web3.eth.accounts[1], 
                              gas: 2000000}).then(
          function() {
            refreshVars();
          });
}

function exercise() {
  setStatus2("Initiating transaction... (please wait)");
   myContractInstance.exercise({from: web3.eth.accounts[0], 
                              gas: 2000000}).then(
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
      alert("Couldn't get any accounts!");
      return;
    }
    accounts = accs;
    account = accounts[0];
    initializeContract();
  });
}
