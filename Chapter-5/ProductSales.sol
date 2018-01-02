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

contract ProductSales {  

	struct Product {
		uint ID;
		string name;
    uint inventory;
    uint price;
  }

  struct Buyer {
		string name;
		string email;
    string mailingAddress;
    uint totalOrders;
    bool isActive;
  }

  struct Order {
  	uint orderID;
		uint productID;
		uint quantity;
		address buyer;
  }

  address public owner;
  mapping (address => Buyer) public buyers;
  mapping (uint => Product) public products;
  mapping (uint => Order) public orders;

  uint public numProducts;
  uint public numBuyers;
  uint public numOrders;

  event NewProduct(uint _ID, string _name, uint _inventory, uint _price);
  event NewBuyer(string _name, string _email, string _mailingAddress);
  event NewOrder(uint _OrderID, uint _ID, uint _quantity, address _from);

  modifier onlyOwner(){
    if (msg.sender != owner) throw;
    _
  }

  function ProductSales() {
    owner = msg.sender;    
    numBuyers = 0;
    numProducts = 0;
  }

  function addProduct(uint _ID, string _name, uint _inventory, 
            uint _price) onlyOwner{
    Product p = products[_ID]; 
    p.ID = _ID;
    p.name = _name;
    p.inventory = _inventory;
    p.price = _price;
    numProducts++;
    NewProduct(_ID, _name, _inventory, _price);
  }

  function updateProduct(uint _ID, string _name, uint _inventory, 
              uint _price) onlyOwner{
    products[_ID].name = _name;
    products[_ID].inventory = _inventory;
    products[_ID].price = _price;
  }

  function registerBuyer(string _name, string _email, 
              string _mailingAddress) {
    Buyer b = buyers[msg.sender]; 
    b.name = _name;
    b.email = _email;
    b.mailingAddress = _mailingAddress;
    b.totalOrders = 0;
    b.isActive = true;
    numBuyers++;
    NewBuyer(_name, _email, _mailingAddress);
  }

  function buyProduct(uint _ID, uint _quantity) 
            returns(uint newOrderID){
  	// Check if there is sufficient inventory of the product
  	if(products[_ID].inventory < _quantity){
  		throw;
  	}
  	
  	// Check if amount paid is not less than the order amount
  	uint orderAmount = products[_ID].price*_quantity;
  	if(msg.value<orderAmount){
  		throw;
  	}

  	// Check if buyer is registered
  	if(buyers[msg.sender].isActive != true){
  		throw;
  	}

  	// Update total orders of the buyer
  	buyers[msg.sender].totalOrders += 1;

  	// Generate new order ID
  	newOrderID = uint(msg.sender) + block.timestamp;

  	// Create a new order
    Order o = orders[newOrderID]; 
    o.orderID = newOrderID;
    o.productID = _ID;
    o.quantity = _quantity;
    o.buyer = msg.sender;

    //Update total number of orders
    numOrders++;

    // Update product inventory
    products[_ID].inventory = products[_ID].inventory - 1;

    // Refund balance remaining to buyer
    if(msg.value>orderAmount){
	  	uint refundAmount = msg.value - orderAmount;
	  	if (!msg.sender.send(refundAmount))
	      throw; 
  	}

    NewOrder(newOrderID, _ID, _quantity, msg.sender);
  }

  function withdrawFunds() onlyOwner{
    if (!owner.send(this.balance))
      throw; 
  }   

  function kill() onlyOwner{
      suicide(owner);
  }
}
