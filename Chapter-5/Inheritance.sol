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
  address public _owner;

  function owned() {
    _owner = msg.sender;
  }

  modifier onlyowner() {
    if (msg.sender == _owner) _
  }
}

contract mortal is owned {
  function kill() onlyowner {
    if (msg.sender == _owner) suicide(_owner);
  }
}

contract Test is mortal {
    mapping (address => uint) amountPaid;

    function deposit() {
        amountPaid[msg.sender] = msg.value;
    }

    function refund(address user) onlyowner{
        if (amountPaid[user] > 0) { 
            if(!user.send(amountPaid[user])){
                throw; // reverts the transfer
            }
            
            amountPaid[user]=0;
        }
    }
}
