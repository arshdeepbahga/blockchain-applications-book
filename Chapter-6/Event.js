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
  myContractInstance = Event.deployed();
  $("#cf_address").html(myContractInstance.address);
  $("#cb_address").html(account);
 
  myContractInstance.numRegistrants.call().then(
    function(numRegistrants) { 
      $("#cf_registrants").html(numRegistrants.toNumber());
      return myContractInstance.quota.call();
  }).then(
    function(quota) { 
      $("#cf_quota").html(quota.toNumber());
      return myContractInstance.price.call();
  }).then(
    function(price) { 
      ticketPrice = web3.fromWei(price, "ether").toFixed(5);
      $("#cf_price").html(ticketPrice);
      refreshBalance();
  });
}

function setStatus(message) {
  $("#status").html(message);
};

function showTotal() {
   var numTickets = $("#numTickets").val();
   var ticketAmount = numTickets*ticketPrice;
  $("#ticketsTotal").html(ticketAmount);
};

function refreshBalance() {
  $("#cb_balance").html(web3.fromWei(
    web3.eth.getBalance(web3.eth.coinbase), "ether").toFixed(5));
}


function buyTicket() {
  var numTickets = parseFloat($("#numTickets").val());
  var ticketAmount = numTickets*ticketPrice;
  var ticketAmountWei = web3.toWei(ticketAmount, "ether"); 
  var email = $("#email").val();
  var amountAlreadyPaid;
  var amountPaidNow;

  setStatus("Initiating transaction... (please wait)");

  myContractInstance.getRegistrantAmountPaid.call(account).then(
   function(result) {
   amountAlreadyPaid = result.toNumber();
   return myContractInstance.buyTicket(email, 
    numTickets, { from: web3.eth.coinbase, value: ticketAmountWei});
    }).then(
    function(result) {
      return myContractInstance.numRegistrants.call();
    }).then(
    function(numRegistrants) {
      $("#cf_registrants").html(numRegistrants.toNumber());
      return myContractInstance.getRegistrantAmountPaid.call(account);
    }).then(
    function(valuePaid) {
      amountPaidNow = valuePaid.toNumber() - amountAlreadyPaid; 
      if (amountPaidNow == ticketAmountWei) {
        setStatus("Purchase successful");
      } else {
        setStatus("Purchase failed");
      }
      refreshBalance();
    });
}

function cancelTicket() {
    setStatus("Initiating transaction... (please wait)");    
    myContractInstance.getRegistrantAmountPaid.call(account).then(
    function(result) {
      if (result.toNumber() == 0) {
        setStatus("Buyer is not registered - no refund!");
      } else {    
        myContractInstance.refundTicket(account, 
                          {from: accounts[0]}).then(
          function() {
            return myContractInstance.numRegistrants.call();
          }).then(
          function(numRegistrants) {
            $("#cf_registrants").html(numRegistrants.toNumber());
            return myContractInstance.getRegistrantAmountPaid.call(
                                                           account);
          }).then(
          function(valuePaid) {
            if (valuePaid.toNumber() == 0) {
              setStatus("Refund successful");
            } else {
              setStatus("Refund failed");
            }
            refreshBalance();
          }); 
      }
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
