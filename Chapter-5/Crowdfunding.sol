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

contract CrowdFunding {
    struct Backer {
        address addr;
        uint amount;
    }

    address public owner;
    uint public numBackers;
    uint public deadline;
    string public campaignStatus;
    bool ended;
    uint public goal;
    uint public amountRaised;
    mapping (uint => Backer) backers;

    event Deposit(address _from, uint _amount); 
    event Refund(address _to, uint _amount); 

    modifier onlyOwner()
    {
        if (msg.sender != owner) throw;
        _
    }

    function CrowdFunding(uint _deadline, uint _goal) {
        owner = msg.sender;
        deadline = _deadline;
        goal = _goal;
        campaignStatus = "Funding";
        numBackers = 0;
        amountRaised = 0;
        ended = false;
    }

    function fund() {        
        Backer b = backers[numBackers++]; 
        b.addr = msg.sender;
        b.amount = msg.value;
        amountRaised += b.amount;
        Deposit(msg.sender, msg.value);
    }

    function checkGoalReached () onlyOwner returns (bool ended){
        if (ended)
            throw; // this function has already been called

        if(block.timestamp<deadline)
            throw;

        if (amountRaised >= goal) { 
            campaignStatus = "Campaign Succeeded";
            ended = true;
            if (!owner.send(this.balance))
                throw; // If anything fails, 
                       // this will revert the changes above
        }else{
            uint i = 0;
            campaignStatus = "Campaign Failed";
            ended = true;
            while (i <= numBackers){
                backers[i].amount = 0;
                if (!backers[i].addr.send(backers[i].amount))
                    throw; // If anything fails, 
                           // this will revert the changes above
                Refund(backers[i].addr, backers[i].amount);
                i++;
            }
        }
    }

    function destroy() {
        if (msg.sender == owner) {
            suicide(owner);
        }
    }

    function () {
        // This function gets executed if a
        // transaction with invalid data is sent to
        // the contract or just ether without data.
        // We revert the send so that no-one
        // accidentally loses money when using the
        // contract.
        throw;
    }
}