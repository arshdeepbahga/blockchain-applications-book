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

contract RateProvider {
    mapping(bytes32 => uint) public  rates;
    mapping(bytes32 => uint) public  timestamps;

    function RateProvider() {
        rates['XIBOR']  = 50;
        rates['VIBOR']  = 80;

        timestamps['XIBOR']  = block.timestamp;
        timestamps['YIBOR']  = block.timestamp;
    }

    // Returns the rate of a symbol
    function getPrice(string _symbol) constant returns(uint) {
        bytes32 symbol = stringToBytes(_symbol);
        return rates[symbol];
    }

    // Returns the timestamp of the latest rate for a symbol.
    function getTimestamp(string _symbol) constant returns (uint) {
        bytes32 symbol = stringToBytes(_symbol);
        return timestamps[symbol];
    }

    // Update rate for a given symbol.
    function updateRate(string _symbol, uint _rate) returns(bool) {
        bytes32 symbol = stringToBytes(_symbol);

        rates[symbol] = _rate;
        timestamps[symbol] = block.timestamp;
        return true;
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
}