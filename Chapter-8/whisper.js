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

// Create a new identity
var identity = web3.shh.newIdentity();

// Check identity
var result = web3.shh.hasIdentity(identity);
console.log(result); // true

// Filter options
var options = {
  from: identity,
  topics: [web3.fromAscii("example")]
};

// Create a filter and watch for incoming whisper messages
var myfilter = web3.shh.filter(options).watch(
  function(err, msg) {
  if(err){
    console.log("Error:",  JSON.stringify(err));
  }else{
    console.log("Message:",  JSON.stringify(msg));
    console.log("Payload:",  web3.toAscii(msg.payload));
  }
});

// Create a new message 
var message = {
  from: identity,
  topics: [web3.fromAscii("example")],
  payload: web3.fromAscii("Test"),
  ttl: 100,
  workToProve: 1000 
};

// Post whisper message
web3.shh.post(message);

//-----Output-------
//Message: {"expiry":0,"from":"0x0487a3a8f738e8bab596ed33db2
//          fc36a90c42aa889982c6c1bc1760e78e7600e19ca69ae279b
//          fb1c5abb299d6ca159cdc25b689c2f56e9da14ac9fe67842fc11b1",
//          "hash":"0xf9f63c04928fffd2d6465565a838e1e4f7b0b92
//                 00accf55a2d3c4ec326bce82e",
//          "payload":"0x54657374","sent":1478863242,"to":"0x0",
//          "topics":[],"ttl":100,"workProved":0}
//Payload: Test

