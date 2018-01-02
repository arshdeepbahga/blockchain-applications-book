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

//Copy entire contract source here
> var contractSource = "contract Crowdfunding { ... }"; 

//Compile the contract
> var contractCompiled = eth.compile.solidity(contractSource);

> var deadline = 1485856567; //timestamp
> var goal = 5000000000000000000; //in Wei

//Create the contract object
> var myContract = 
  web3.eth.contract(contractCompiled.Crowdfunding.info.abiDefinition);

//Deploy the contract
> var myContractInstance = myContract.new(
    deadline,
    goal,
    {
        from:web3.eth.accounts[1], 
        data:contractCompiled.Crowdfunding.code, 
        gas: 1000000
    }, function(e, contract){
    if(!e) {
      if(!contract.address) {
        console.log("Contract transaction send: TransactionHash: " + 
                  contract.transactionHash + " waiting to be mined...");
      } else {
        console.log("Contract mined! Address: " + contract.address);
      }
    }
});

//Contract transaction send: TransactionHash: 
//0x69a69e3681e95e677843ad1bc6844a891c771cafb007f86bce6f8ab7417bccb4 
//waiting to be mined...

//Contract mined! Address: 0xc79d0f151f6c7f51772a4d9f488c90f5177fee4e

//View receipt of the transaction to deploy the contract
> eth.getTransactionReceipt('0x69a69e3681e95e677843ad1bc6844a
                          891c771cafb007f86bce6f8ab7417bccb4')
{
  blockHash: "0x017ad52708f72616fe32243ebfa6196
              1559d993988abe380601a04fae4c763ee",
  blockNumber: 1975,
  contractAddress: "0xc79d0f151f6c7f51772a4d9f488c90f5177fee4e",
  cumulativeGasUsed: 467112,
  from: "0xa5d73d67d7a79be62e2c77dd877b536775c446dd",
  gasUsed: 467112,
  logs: [],
  root: "3f843a0d94b3e14153412a39b87eaf80efb9
          68dac22b4efd5b1e51d5f91ed0f1",
  to: null,
  transactionHash: "0x69a69e3681e95e677843ad1bc6844
                    a891c771cafb007f86bce6f8ab7417bccb4",
  transactionIndex: 0
}