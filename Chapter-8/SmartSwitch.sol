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
  struct User {
        uint amountPaid;
        uint authorizedTill;
    }

  address public owner;
  uint public numUsers;
  uint public rate;
  mapping (address => User) public users;

  function SmartSwitch() {
    owner = msg.sender;
    numUsers = 0;
    rate = 1000000000000; //in Wei per second
  }

  function buySubscription() public {
    uint duration = (msg.value/rate); //in seconds
    if(users[msg.sender].amountPaid>0){
      //Already registered, extend the authorization
      users[msg.sender].amountPaid += msg.value;
      users[msg.sender].authorizedTill += duration; 
    }else{
      User u = users[msg.sender]; 
          u.amountPaid = msg.value;
          u.authorizedTill = now+duration;
          numUsers = numUsers+1;
      }  
  }

  function isUserAuthorized(address userAddr) returns(bool){
    if(users[userAddr].authorizedTill>now){
      return true;
    }
    else{
      return false;
    }
  }

  function destroy() {
    if (msg.sender == owner) 
      suicide(owner);
  }
}