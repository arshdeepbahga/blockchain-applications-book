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

var mraa    = require('mraa'); //npm install mraa
var Web3    = require('web3'); //npm install web3
var gethURL = 'http://127.0.0.1:8101';
var provider = new Web3.providers.HttpProvider(gethURL);
var web3 = new Web3(provider);
var switchStatus='OFF';
var turnedON=false;
var relayPin    = new mraa.Gpio(67);

// Contract ABI
var abi = [{"constant":true,"inputs":[],"name":"numUsers",
"outputs":[{"name":"","type":"uint256"}],"type":"function"},
{"constant":false,"inputs":[],"name":"buySubscription","outputs":[],
"type":"function"},{"constant":true,"inputs":[],"name":"rate",
"outputs":[{"name":"","type":"uint256"}],"type":"function"},
{"constant":false,"inputs":[],"name":"destroy","outputs":[],
"type":"function"},{"constant":false,"inputs":[{"name":"userAddr",
"type":"address"}],"name":"isUserAuthorized","outputs":[{"name":"",
"type":"bool"}],"type":"function"},{"constant":true,"inputs":[],
"name":"owner","outputs":[{"name":"","type":"address"}],
"type":"function"},{"constant":true,"inputs":[{"name":"",
"type":"address"}],"name":"users","outputs":[{"name":"amountPaid",
"type":"uint256"},{"name":"authorizedTill","type":"uint256"}],
"type":"function"},{"inputs":[{"name":"_rate","type":"uint256"}],
"type":"constructor"}];

// Contract address
var contractAddress = '0xdd416c543d2792e7754fc0ddc787ddae778c2d72';

// Create contract object
var MyContract = web3.eth.contract(abi);

// Instantiate contract for an address
var myContractInstance = MyContract.at(contractAddress);

function turnON(){
    console.log("Switching ON");
    switchStatus='ON';
    relayPin.write(0); 
}

function turnOFF(){
    console.log("Switching OFF");
    switchStatus='OFF';
    relayPin.write(1); 
}

function setup() {
    console.log("web3 version:", web3.version.api);
    console.log('MRAA Version: ' + mraa.getVersion());
    relayPin.dir(mraa.DIR_OUT);
    turnOFF();  

    web3.shh.filter({
        "topics": [ web3.fromAscii(contractAddress) ]
    }).watch(function(err, message){
        console.log(message)
        var data = {};
        try {
            data = JSON.parse(web3.toAscii(message.payload));
        } catch(error) {
            return;
        }

        //Call contract to if user is authorized
        var result = myContractInstance.isUserAuthorized.call(data.from);

        if(result==true){
            //Toggle switch based on data.target
            if(data.target=='ON'){
                turnON();
            }else if(data.target=='OFF'){
                turnOFF();
            }
        }
    });

}

function loop(){
    if(switchStatus=='ON' && turnedON==false){
        console.log("Switch is now ON");
        turnedON=true;
    }else if(switchStatus=='OFF' && turnedON==true){
        console.log("Switch is now OFF");
        turnedON=false;
    }
}

// Run setup
setup();

// Run loop
setInterval(loop, 2000);    
