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

contract SolarCharge {
	struct User {
		string name;
	    address userAccount;
        uint amountPaid;
        uint solcoins;
    }

    mapping (bytes32 => User) public users;

    struct Station {
        uint rate;
        string location;
        uint coinBalance;
        uint lastActivated;
        uint lastDuration;
    }

    mapping (uint => Station) public stations;

	address public owner;
	uint public numUsers;
	uint public numStations;
	uint public coinRate; // coins per ether

	function SolarCharger() {
		owner = msg.sender;
		numUsers = 0;
		numStations = 0;
		coinRate = 1000000000000000000;
	}

	function registerUser(string _email, string _name) public {
		bytes32 email = stringToBytes(_email);

		if(users[email].userAccount>0){
			throw;
		}
		
		User u = users[email]; 
        u.userAccount = msg.sender;
        u.name = _name;
        u.amountPaid = 0;
        u.solcoins =0;
		numUsers += 1;
	}

	function buyCoins(string _email) public {
		bytes32 email = stringToBytes(_email);

		if(users[email].userAccount!=msg.sender){
			throw;
		}
        users[email].amountPaid += msg.value;
        users[email].solcoins += msg.value*coinRate;
	}

	function addStation(uint ID, uint _rate, string _location) public {
		if(msg.sender!=owner){
			throw;
		}
		if(stations[ID].rate!=0){
			throw;
		}

		Station s = stations[ID]; 
        s.coinBalance = 0;
        s.lastActivated = 0;
        s.lastDuration = 0;
        s.location = _location;
        s.rate = _rate;
        numStations += 1;
	}

	function activateStation(string _email, uint ID, uint duration) public {
		bytes32 email = stringToBytes(_email);

		// Station does not exist
		if(stations[ID].rate==0){
			throw;
		}

		// Station is busy
		if(now<(stations[ID].lastActivated+stations[ID].lastDuration)){
			throw;
		}

		uint coinsRequired = stations[ID].rate*duration;

		// User has insufficient coins
		if (users[email].solcoins<coinsRequired){
			throw;
		}

        users[email].solcoins -= coinsRequired;
        stations[ID].coinBalance += coinsRequired;
        stations[ID].lastActivated = now;
        stations[ID].lastDuration = duration;
	}

	function getStationState(uint ID) constant returns (bool){
		if(now<(stations[ID].lastActivated+stations[ID].lastDuration)){
			return true;
		}else{
			return false;
		}            	
	}

	function getUser(string _email) constant returns (string name, 
        address userAccount, uint amountPaid, uint solcoins){
		bytes32 email = stringToBytes(_email);
		name = users[email].name;
		userAccount = users[email].userAccount;
        amountPaid = users[email].amountPaid;
        solcoins = users[email].solcoins;
	}

	function getStation(uint ID) constant returns (uint rate, 
            string location, uint coinBalance, 
            uint lastActivated, uint lastDuration){
		rate = stations[ID].rate;
        location = stations[ID].location;
        coinBalance = stations[ID].coinBalance;
        lastActivated = stations[ID].lastActivated;
        lastDuration = stations[ID].lastDuration;
	}

	// Converts 'string' to 'bytes32'
	function stringToBytes(string s) returns (bytes32) {
	  bytes memory b = bytes(s);
	  uint r = 0;
	  for (uint i = 0; i < 32; i++) {
	      if (i < b.length) {
	          r = r | uint(b[i]);
	      }
	      if (i < 31) r = r * 256;
	  }
	  return bytes32(r);
	}

	function destroy() {
		if (msg.sender == owner) {
			suicide(owner);
		}
	}
}
