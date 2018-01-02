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

contract TradingAccount  {
    struct AuthPeriod {
        uint        duration; // in minutes      
        uint        startTime;
    }

    mapping(address => AuthPeriod)  public authorized;
    address[]  public addresses;
    address public owner;

    function TradingAccount() {
        owner = msg.sender;
    }

    function deposit() returns (bool) {
        if (isOwner(msg.sender) || isAuthorized(msg.sender)) {
            return true; // Accept the deposit
        } else {
            throw;
        }

        return false;
    }

    function withdraw(uint amount) returns (bool) {
        if (amount > this.balance) {
            throw;
        }

        if (isOwner(msg.sender) || isAuthorized(msg.sender)) {
            if(!msg.sender.send(amount)){throw;}
            return true;
        }

        return false;
    }

    function authorize(address accountAddr, 
                    uint duration) returns (bool) {
        if (duration == 0) {
            return false;
        }

        AuthPeriod period = authorized[accountAddr];
        if (period.duration == 0) {
            // Add this account to the list of authorized accounts
            authorized[accountAddr] = AuthPeriod(duration,
                                     block.timestamp);
            addresses.push(accountAddr);
        } else if (timeRemaining(accountAddr) < duration) {
            // Extend the authorized duration for this account
            authorized[accountAddr] = AuthPeriod(duration, 
                                        block.timestamp);
        }

        return true;
    }

    function isAuthorized(address accountAddr) returns (bool) {
        // Check if address is authorized and 
        // authorization hasn't expired
        if (authorized[accountAddr].duration > 0 && 
            timeRemaining(accountAddr) >= 0){
            return true;
        }else{
            return false;
        }
    }

    function isOwner(address accountAddr) returns (bool) {
        // Check if address is authorized and 
        // authorization hasn't expired
        if (accountAddr==owner){
            return true;
        }else{
            return false;
        }
    }

    function timeRemaining(address accountAddr) private returns (uint) {
        uint timeElapsed = (block.timestamp - 
                            authorized[accountAddr].startTime) / 60;
        return authorized[accountAddr].duration - timeElapsed;
    }

    function kill() {
        if (msg.sender == owner) suicide(owner);
    }
}