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

//Contract source converted to a string
var contractSource = "contract RevenueShare { ... } ";

//Compile contract
var contractCompiled = eth.compile.solidity(contractSource);

//List of addresses of shareholders for initializing contract
var addresses = ["0xa5D73d67D7a79Be62e2c77DD877B536775C446DD",
               "0xDa7d00412Ae0FD1A590AdC3718B007872D40F090", 
               "0x3a15b505277b2F869ffcB1E9d1E76bD180189E0D"];

//Create contract
var myContract = 
  web3.eth.contract(contractCompiled.RevenueShare.info.abiDefinition);

//Deploy contract 
var myContractInstance = myContract.new(
    addresses,
    {
        from:web3.eth.accounts[0], 
        data:contractCompiled.RevenueShare.code, 
        gas: 1000000
    }, function(e, contract){
    if(!e) {
      if(!contract.address) {
        console.log("Contract transaction send: 
          TransactionHash: " + contract.transactionHash + 
                        " waiting to be mined...");
      } else {
        console.log("Contract mined! Address: " + contract.address);
      }
    }
});

//Contract transaction send: TransactionHash: 
//0xbdc9d77e7350ac7aa13f2fc834c07f92ea247126d
14b6881988b699a3a4e19e0 waiting to be mined...
//Contract mined! Address: 0x15e476ada310dff63fc2c332e051c08a20d157aa