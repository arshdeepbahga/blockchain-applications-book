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

contract DocVerify {

    struct Document {
        //bytes32 hash;
        address owner;
        uint blockTimestamp;
    }

    address public creator;
    uint public numDocuments;
    mapping(bytes32 => Document) public documentHashMap;

    function DocVerify(){
        creator = msg.sender; 
        numDocuments=0;
    }
    
    
    function newDocument(bytes32 hash) returns (bool success){
        if (documentExists(hash)) {
            success = false;
        }else{
            Document d = documentHashMap[hash];
            //d.hash = hash;
            d.owner = msg.sender;
            d.blockTimestamp = block.timestamp;
            numDocuments++;
            success = true;
        }
        return success;
    }

    function documentExists(bytes32 hash) constant returns (bool exists){
        if (documentHashMap[hash].blockTimestamp>0) {
            exists = true;
        }else{
            exists= false;
        }
        return exists;
    }
    
    function getDocument(bytes32 hash) constant returns (uint blockTimestamp, address owner){
        blockTimestamp = documentHashMap[hash].blockTimestamp;
        owner = documentHashMap[hash].owner;
    }
    
    function destroy() {
        if (msg.sender == creator) { // without this funds could be locked in the contract forever!
            suicide(creator);
        }
    }
    
}
