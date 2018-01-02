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

contract SmartSwitch {  

    address public owner;
    mapping (address => uint) public usersPaid;
    uint public numUsers;

    event Deposit(address _from, uint _amount); 
    event Refund(address _to, uint _amount); 

    modifier onlyOwner()
    {
        if (msg.sender != owner) throw;
        _
    }

    function SmartSwitch() {
        owner = msg.sender;        
        numUsers = 0;
    }

    function payToSwitch() {
        usersPaid[msg.sender] = msg.value;
        numUsers++;
        Deposit(msg.sender, msg.value);
    }

    function refundUser(address recipient, uint amount) onlyOwner {
        if (usersPaid[recipient] == amount) { 
            if (this.balance >= amount) { 
                if (!recipient.send(amount))
                    throw; 
                Refund(recipient, amount);
                usersPaid[recipient] = 0;
                numUsers--;
            }
        }
    } 

    function withdrawFunds() onlyOwner{
        if (!owner.send(this.balance))
            throw; 
      }

    function kill() onlyOwner{
            suicide(owner);
    }
}
