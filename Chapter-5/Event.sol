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

contract EventRegistration {
	struct Registrant {
        uint amount;
        uint numTickets;
        string email;
    }

	address public owner;
	uint public numTicketsSold;
	uint public quota;
	uint public price;
	mapping (address => Registrant) registrantsPaid;

	event Deposit(address _from, uint _amount); 
	event Refund(address _to, uint _amount); 

	modifier onlyOwner()
    {
        if (msg.sender != owner) throw;
        _
    }

    modifier soldOut()
    {
        if (numTicketsSold >= quota) throw;
        _
    }

	function EventRegistration(uint _quota, uint _price) {
		owner = msg.sender;
		numTicketsSold = 0;
		quota = _quota;
		price = _price;
	}

	function buyTicket(string email, uint numTickets) soldOut {
        // Check if amount paid is not less than the total cost of tickets
        uint totalAmount = price*numTickets;
        if(msg.value<totalAmount){
            throw;
        }

		if(registrantsPaid[msg.sender].amount>0){
			//Already registered
			registrantsPaid[msg.sender].amount += totalAmount;
			registrantsPaid[msg.sender].email = email;
			registrantsPaid[msg.sender].numTickets += numTickets;
		}else{
			Registrant r = registrantsPaid[msg.sender]; 
	        r.amount = totalAmount;
	        r.email = email;
	        r.numTickets=numTickets;
    	}

		numTicketsSold = numTicketsSold+numTickets;

        // Refund balance remaining to buyer
        if(msg.value>totalAmount){
            uint refundAmount = msg.value - totalAmount;
            if (!msg.sender.send(refundAmount))
                throw; 
        }

		Deposit(msg.sender, msg.value);

	}

	function refundTicket(address buyer) onlyOwner {
		if (registrantsPaid[buyer].amount >0) { 
			if (this.balance >= registrantsPaid[buyer].amount) { 
                registrantsPaid[buyer].amount = 0;
                numTicketsSold = numTicketsSold - 
                                registrantsPaid[buyer].numTickets;
				if(!buyer.send(registrantsPaid[buyer].amount)) throw;
				Refund(buyer, registrantsPaid[buyer].amount);
			}
		}
	}

    function withdrawFunds() onlyOwner{
        if (!owner.send(this.balance))
            throw; 
    } 

	function getRegistrantAmountPaid(address buyer) returns(uint){
		return registrantsPaid[buyer].amount;
	}

	function kill() onlyOwner{
		suicide(owner);
	}
}
