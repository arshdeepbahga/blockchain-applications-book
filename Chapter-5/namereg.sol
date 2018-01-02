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

contract NameRegistrar {

    struct RegistryEntry {
        address owner;
        address addr;
        bytes32 content;
    }

    mapping ( bytes32 => RegistryEntry ) public records;
    uint public numRecords;

    event Registered(bytes32 name, address account);
    event Deregistered(bytes32 name, address account);

    function NameRegistrar(){
        numRecords=0;
    }

    function register(bytes32 name) returns (bool success) {
        if (records[name].owner == 0) {
            RegistryEntry r = records[name];
            r.owner = msg.sender;
            numRecords++;
            Registered(name, msg.sender);
            success = true;
        }

        else success = false;
    }

    function unregister(bytes32 name) returns (bool success) {
        if (records[name].owner == msg.sender) {
            records[name].owner = 0;
            success = true;
            numRecords--;
            Deregistered(name, msg.sender);
        }
        
        else success = false;
    }

    function transferOwnership(bytes32 name, address newOwner) {
        if (records[name].owner == msg.sender) {
            records[name].owner = newOwner;
        }
    }

    function getOwner(bytes32 name) returns (address addr) {
        return records[name].owner;
    }

    function setAddr(bytes32 name, address addr) {
        if (records[name].owner == msg.sender) {
            records[name].addr = addr;
        }
    }

    function getAddr(bytes32 name) returns (address addr) {
        return records[name].addr;
    }

    function setContent(bytes32 name, bytes32 content) {
        if (records[name].owner == msg.sender) {
            records[name].content = content;
        }
    }

    function getContent(bytes32 name) returns (bytes32 content) {
        return records[name].content;
    }

}
