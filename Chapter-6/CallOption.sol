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

contract owned {
  address public owner;
  function owned() {
    owner = msg.sender;
  }
  modifier onlyowner() {
    if (msg.sender == owner) _
  }
}

contract mortal is owned {
  function kill() onlyowner {
    if (msg.sender == owner) suicide(owner);
  }
}

contract CallOption is owned, mortal {
    bool public  isActive;
    bool public  isComplete;
    address public buyer;
    address public seller;
    uint public  strikePrice;
    uint public premium;
    string public underlyingName;
    uint public underlying;
    uint public timeToExpiry;
    uint public startTime;

    function CallOption() {
        isActive = false;
        isComplete = false;
        seller = msg.sender;
    }

    // Seller initializes the contract 
    function initialize(
        address _buyer,
        uint    _strikePrice,
        string  _underlyingName,
        uint    _underlying,
        uint    _premium,
        uint    _timeToExpiry) {

        // Can only be initialized by seller
        if(msg.sender != seller){
            throw;
        }

        buyer = _buyer;
        strikePrice = _strikePrice;
        premium = _premium;
        underlyingName = _underlyingName;
        underlying = _underlying;
        timeToExpiry = _timeToExpiry;
        startTime = now;
    }

    // Buyer validates the contract in order to activate it
    function validate() {
        if (isActive) {
            throw;
        }

        if (isExpired()) {
            throw;
        }

        if(msg.sender != buyer){
            throw;
        }

        if(msg.value<premium){
            throw;
        }

        // Pay premium to seller and refund balance if any to buyer
        if(msg.value==premium){
            if (!seller.send(premium)) throw;
        }else if(msg.value>premium){
            if (!seller.send(premium)) throw;
            if (!buyer.send(msg.value - premium)) throw;
        }

        isActive = true;
    }

    function exercise() returns (bool) {
        // Can only be exercised by buyer
        if(msg.sender != buyer){
            throw;
        }

        // Can only be exercised is active
        if(!isActive){
            throw;
        }

        // Call can only be exercised if it is not expired
        if (isExpired()) {
            throw;
        }

        uint amount = strikePrice * underlying;

        if(msg.value < amount){
            throw;
        }

        // Pay the amount to seller to exercise the option
        // and refund the balance, if any, to buyer
        if(msg.value==amount){
            if (!seller.send(amount)) throw;
        }else if(msg.value>premium){
            if (!seller.send(amount)) throw;
            if (!buyer.send(msg.value - amount)) throw;
        }

        isActive = false;
        isComplete = true;
    }

    function isExpired() constant returns (bool) {
        if (now > startTime + timeToExpiry) {
            return true;
        } else {
            return false;
        }
    }
}