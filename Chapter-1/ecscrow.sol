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

contract Escrow {
  address public buyer;
  address public seller;
  uint public deposit;
  uint public timeToExpiry;
  uint public startTime;


  //Buyer sets up the escrow contract and pays the deposit
  function Escrow(address _seller, uint _timeToExpiry) {
    buyer = msg.sender;
    seller = _seller;
    deposit = msg.value;
    timeToExpiry = _timeToExpiry;
    startTime = now;
  }


  //Buyer releases deposit to seller
  function releaseToSeller() {
    if (msg.sender == buyer){
      suicide(seller); //Finish the contract and send all funds to seller 
    }
    else{
      throw;
    }
  }


  //Buyer can withdraw deposit if escrow is expired
  function withdraw() {
    if (!isExpired()) {
      throw;
    }

    if (msg.sender == buyer){
      suicide(buyer); // Finish the contract and send all funds to buyer
    }
    else{
      throw;
    }
  }


  // Seller can cancel escrow and return all funds to buyer
  function cancel() {
    if (msg.sender == seller){
      suicide(buyer); 
    }
    else{
      throw;
    }
  }

  function isExpired() constant returns (bool) {
    if (now > startTime + timeToExpiry){
      return true;
    }
    else{
      return false;
    }
  }
}
