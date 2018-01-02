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
var myContractInstance;

function initializeContract() {
  myContractInstance = Maintenance.deployed();
  $("#cf_address").html(myContractInstance.address);
  $("#cb_address").html(account);
 
  myContractInstance.numMachines.call().then(
    function(numMachines) { 
      $("#cf_machines").html(numMachines.toNumber());
      return myContractInstance.numServiceRequests.call();
  }).then(
    function(numServiceRequests) { 
      $("#cf_servicerequests").html(numServiceRequests.toNumber());
      getServiceRequests();
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
  $("#cb_balance").html(web3.fromWei(web3.eth.getBalance(
        web3.eth.coinbase), "ether").toFixed(5));
}

function registerMachine(){
  var machineID=987655; 
  var machineName="CNC"; 
  var purchaseDate = "1472721009";
  var manufacturer = "XYZ Corp";

  myContractInstance.registerMachine(machineID, machineName, 
      purchaseDate, manufacturer, { from: web3.eth.coinbase}).then(
    function(result) { 
      return myContractInstance.getMachineDetails.call(machineID);
    }
  ).then(
          function(result) {
            console.log(result);
            if (result[1].toNumber() >0) {
              console.log("Machine registered");
            } else {
              console.log("Registration failed");
            }
          });
}

function getMachineDetails(machineID){
      return myContractInstance.getMachineDetails.call(machineID).then(
          function(result) {
            console.log(result);
            $('#cf_machineID').html(machineID);
            $('#cf_machineName').html(result[0]);
            $('#cf_purchaseDate').html(result[1].toNumber());
            $('#cf_owner').html(result[2]);
            $('#cf_manufacturer').html(result[3]);
          });
}

function requestService(){
  var machineID=987655; 
  var timestamp = "1472721012";
  var remarks = "Valve issue";

  myContractInstance.requestService(timestamp, machineID, 
                remarks, { from: web3.eth.coinbase}).then(
    function(result) { 
      return myContractInstance.getServiceRequest.call(machineID);
    }
  ).then(
          function(result) {
            console.log(result);
            if (result[0].toNumber() >0) {
              setStatus("Service request successful");
            } else {
              setStatus("Service request failed");
            }
          });
}

function getServiceRequests(){
  var serviceRequested = myContractInstance.ServiceRequested(
                        {fromBlock: 0, toBlock: 'latest'});
  serviceRequested.watch(function(error, result) {
  });

  var events = myContractInstance.allEvents({fromBlock: 0, 
              toBlock: 'latest', event: 'ServiceRequested'});

  events.get(function(error, result) {
    var htmlString='<table class="table"><tr><th>Timestamp</th>\
                    <th>Machine-ID</th><th>Remarks</th></tr>';
    for(var i=0; i<result.length; i++){
       htmlString += '<tr>' + 
                     '<td>'+ result[i].args.timestamp.toNumber()+'</td>'+
                     '<td><a href="#" onclick=getMachineDetails('+ 
                     result[i].args.machineID.toNumber()+');>'+ 
                     result[i].args.machineID.toNumber()+ '</a></td>'+
                     '<td>'+ result[i].args.remarks+'</td>'+
                     '</tr>'
    }

    htmlString +='</table>';

    $("#serviceTable").html(htmlString);
  });
}

window.onload = function() {
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
