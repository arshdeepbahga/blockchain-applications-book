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

contract InterestRateSwap is owned, mortal {
    bool public  isActive;
    address public      partyA;
    address public      partyB;
    TradingAccount  public    partyATradingAcct;
    TradingAccount  public    partyBTradingAcct;
    uint public  fixedRate;
    uint public floatingRateMargin;
    uint public notional;
    uint public schedule; // every X minutes
    RateProvider public rateFeed;
    string public feedName;
    uint public timeToExpiry;
    uint public startTime;
    uint public lastAmountPaid;

    function InterestRateSwap() {
        isActive = false;
    }

    // partyB initializes the contract 
    function initialize(
        address _partyATradingAcct,
        address _partyBTradingAcct,
        uint    _fixedRate,
        uint    _floatingRateMargin,
        uint    _notional,
        uint    _schedule,
        string  _feedName,
        address _rateProvider,
        uint    _timeToExpiry) {

        // Trading accounts
        partyATradingAcct = TradingAccount(_partyATradingAcct);
        partyA = partyATradingAcct.owner();
        partyBTradingAcct = TradingAccount(_partyBTradingAcct);
        partyB = partyBTradingAcct.owner();

        fixedRate = _fixedRate;
        floatingRateMargin = _floatingRateMargin;
        notional = _notional;
        schedule = _schedule;
        feedName = _feedName;
        rateFeed = RateProvider(_rateProvider);

        timeToExpiry = _timeToExpiry;
        startTime = now;
        lastAmountPaid = 0;
        // Authorize trading account of caller
        authorizeTradingAccounts();
    }

    // partyA validates the contract in order to activate it
    function validate() {
        if (isActive) {
            throw;
        }

        if (isExpired()) {
            throw;
        }

        // Need authorized trading accounts
        if (!(partyATradingAcct.isAuthorized(this) || 
            partyBTradingAcct.isAuthorized(this))) {
            throw;
        }

        // Authorize trading account of caller
        authorizeTradingAccounts();

        isActive = true;
    }

    function exercise() {
        // Can only be exercised if active
        if(!(isActive)){
            throw;
        }

        // Call can only be exercised if it is not expired
        if (isExpired()) {
            throw;
        }

        // Get current rate from the rate provider
        uint currentRate = getRate();
        uint floatingRate = currentRate + floatingRateMargin;

        //Calculate amount each party owes to the other
        uint amountAowesB = (notional * floatingRate)/100;
        uint amountBowesA = (notional * fixedRate)/100;

        // Settle the difference in the amount owed
        if (amountAowesB>amountBowesA){
            lastAmountPaid = amountAowesB-amountBowesA;
            partyATradingAcct.withdraw(lastAmountPaid);
            partyBTradingAcct.deposit.value(lastAmountPaid)();
        }else{
            lastAmountPaid = amountBowesA-amountAowesB;
            partyBTradingAcct.withdraw(lastAmountPaid);
            partyATradingAcct.deposit.value(lastAmountPaid)();
        }
    }

    // Authorize trading accounts 
    function authorizeTradingAccounts() {
        if (msg.sender == partyA) {
            partyATradingAcct.authorize(this, timeToExpiry);
        }
        if (msg.sender == partyB) {
            partyBTradingAcct.authorize(this, timeToExpiry);
        }
    }

    function isExpired() constant returns (bool) {
        if (now > startTime + timeToExpiry) {
            return true;
        } else {
            return false;
        }
    }

    function getRate() returns (uint) {
        return rateFeed.getPrice(feedName);
    }
}

