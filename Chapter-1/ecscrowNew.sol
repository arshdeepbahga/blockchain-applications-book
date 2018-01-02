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
  uint public timeToExpiry;
  uint public timeToReturn;
  uint public startTime;
  uint public receivedTime;
  uint public deposit;
  string public status;
  

  //Buyer sets up the escrow contract and pays the deposit
  function Escrow(address _seller, uint _timeToExpiry, 
                uint _timeToReturn) {
    buyer = msg.sender;
    seller = _seller;
    deposit = msg.value;
    timeToExpiry = _timeToExpiry;
    timeToReturn = _timeToReturn;
    startTime = now;
    status = "Escrow Setup";
  }


  //Seller updates item shipment information
  function itemShipped(string _status) {
    if (msg.sender == seller){
      status = _status;
    }
    else{
      throw;
    }
  }


  //Buyer releases partial deposit to seller
  function itemReceived(string _status) {
    if (msg.sender == buyer){
      status = _status;
      receivedTime = now;

      //Pay 20% to seller
      if (!seller.send(deposit/5)){
            throw;
        }
    }
    else{
      throw;
    }
  }


  //Buyer releases balance deposit to seller
  function releaseBalanceToSeller() {
    if (msg.sender == buyer){

      //Finish the contract and send all funds to seller
      suicide(seller);  
    }
    else{
      throw;
    }
  }


  //Buyer returns the item
  function returnItemToSeller(string _status) {
    if (msg.sender != buyer){
      throw;
    }

    if (now > receivedTime + timeToReturn){
      throw;
    }

    status = _status;
  }


  //Seller releases balance to buyer
  function releaseBalanceToBuyer() {
    if (msg.sender != seller){
      throw;
    }

    // Finish the contract and send remaining funds to buyer
    //20% restocking penalty previously paid to seller
    suicide(buyer);
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
