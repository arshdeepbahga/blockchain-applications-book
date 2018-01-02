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
var switchRate = 10;
var myContractInstance;

var options = {
  from: '0x0',
  to: '0x0',
  target: 'OFF' // or 'ON'
}

function initializeContract() {
  myContractInstance = SmartSwitch.deployed();
  $("#cf_address").html(myContractInstance.address);
  $("#cb_address").html(account);
  $("#cf_userAddress").html(account);
  options.from = account;
  options.to = myContractInstance.address;

  myContractInstance.numUsers.call().then(
    function(numUsers) {
      $("#cf_numUsers").html(numUsers.toNumber());
      return myContractInstance.rate.call();
    }).then(
    function(rate) {
      switchRate = rate.toNumber();
      $("#cf_rate").html(rate.toNumber());
      return myContractInstance.users.call(account);
    }).then(
    function(user) {
      console.log(user);
      $("#cf_userAmountPaid").html(user[0].toNumber());
      $("#cf_usersAuthorizedTill").html(user[1].toNumber());
      return myContractInstance.isUserAuthorized.call(account);
    }).then(
    function(result) {
      console.log(result);
      if (result == true) {
        $("#cf_authStatus").html('Active');
        $('#toggle-event').removeAttr('disabled');
      } else {
        $("#cf_authStatus").html('Inactive');
        $('#toggle-event').attr('disabled');
      }
      refreshBalance();
    });
}

function setStatus(message) {
  $("#status").html(message);
};

function showTotal() {
  var numDays = $("#numDays").val();
  var subscriptionTotal = numDays * switchRate * 86400;
  var subscriptionTotalEth = web3.fromWei(subscriptionTotal, "ether");
  $("#subscriptionTotal").html(subscriptionTotalEth);
};

function refreshBalance() {
  $("#cb_balance").html(web3.fromWei(
        web3.eth.getBalance(web3.eth.coinbase), "ether").toFixed(5));
}


function buySubscription() {
  var numDays = parseFloat($("#numDays").val());
  var subscriptionTotal = numDays * switchRate * 86400;

  setStatus("Initiating transaction... (please wait)");

  myContractInstance.buySubscription({
    from: web3.eth.coinbase,
    value: subscriptionTotal
  }).then(
    function() {
      return myContractInstance.numUsers.call();
    }).then(
    function(numUsers) {
      $("#cf_numUsers").html(numUsers.toNumber());
      return myContractInstance.users.call(account);
    }).then(
    function(user) {
      console.log(user);
      setStatus('');
      $("#cf_userAmountPaid").html(user[0].toNumber());
      $("#cf_usersAuthorizedTill").html(user[1].toNumber());
      return myContractInstance.isUserAuthorized.call(account);
    }).then(
    function(result) {
      console.log(result);
      if (result == true) {
        $("#cf_authStatus").html('Active');
        $('#toggle-event').removeAttr('disabled');
      } else {
        $("#cf_authStatus").html('Inactive');
        $('#toggle-event').attr('disabled');
      }

      refreshBalance();
    });
}

function sendMessage(options) {
  var data = {
    from: options.from,
    target: options.target
  };

  var message = {
    topics: [web3.fromAscii(options.to)],
    payload: web3.fromAscii(JSON.stringify(data)),
    ttl: 50,
    workToProve: 100
  };

  console.log(message);
  web3.shh.post(message);
}

function turnON() {
  options.target = 'ON';
  $('#switchStatus').html('Switch ON');
  sendMessage(options);
}

function turnOFF() {
  options.target = 'OFF';
  $('#switchStatus').html('Switch OFF');
  sendMessage(options);
}

window.onload = function() {
  $('#toggle-event').change(function() {
    if ($(this).prop('checked') == true) {
      turnON();
    } else {
      turnOFF();
    }
  });

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