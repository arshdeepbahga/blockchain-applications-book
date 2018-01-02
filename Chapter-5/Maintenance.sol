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

contract Maintenance {
	struct Machine {
		string machineName;
		uint purchaseDate;
		address owner;
		string manufacturer;
	}

	struct ServiceRequest {
        uint timestamp;
        string remarks;
        address requester;
    }

	address public creator;
	uint public numMachines;
	uint public numServiceRequests;


	mapping (uint => ServiceRequest) serviceRequests;
	mapping (uint => Machine) machines;
	bool public result;


	event ServiceRequested(address requester, uint timestamp, uint machineID, string remarks);

	function Maintenance() {
		creator = msg.sender;
		numMachines = 0;
		numServiceRequests = 0;
	}

	function registerMachine(uint machineID, string machineName, uint purchaseDate, string manufacturer) public {
		Machine m = machines[machineID];
		m.machineName = machineName;
		m.purchaseDate = purchaseDate;
		m.owner = msg.sender;
		m.manufacturer = manufacturer;
		numMachines++;
	}

	function getMachineDetails(uint machineID) returns(string machineName, uint purchaseDate, address owner, string manufacturer){
		machineName = machines[machineID].machineName;
		purchaseDate = machines[machineID].purchaseDate;
		owner = machines[machineID].owner;
		manufacturer = machines[machineID].manufacturer;
	}

	function getServiceRequest(uint machineID) returns(uint timestamp, string remarks, address requester){
		timestamp = serviceRequests[machineID].timestamp;
		remarks = serviceRequests[machineID].remarks;
		requester = serviceRequests[machineID].requester;
	}


	function requestService(uint timestamp, uint machineID, string remarks) public {
		ServiceRequest s = serviceRequests[machineID];
		s.timestamp = timestamp;
        s.requester = msg.sender;
        s.remarks = remarks;
        numServiceRequests++;
        ServiceRequested(msg.sender, timestamp, machineID, remarks);
	}


	function destroy() {
		if (msg.sender == creator) { // without this funds could be locked in the contract forever!
			suicide(creator);
		}
	}
}
