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

import "mortal";

contract chequebook is mortal {
    // Cumulative paid amount in wei to each beneficiary
    mapping (address => uint256) public sent;

    event Overdraft(address deadbeat);

    /// Function to Cash cheque
    /// Parameters: 
    /// beneficiary - beneficiary address
    /// amount - cumulative amount in wei
    /// sig_v - signature parameter v
    /// sig_r - signature parameter r
    /// sig_s - signature parameter s
    function cash(address beneficiary, uint256 amount,
        uint8 sig_v, bytes32 sig_r, bytes32 sig_s) {
        // Check if the cheque is old.
        // Only cheques that are more recent than the 
        // last cashed one are considered.
        if(amount <= sent[beneficiary]) return;
        
        // Check the digital signature of the cheque.
        bytes32 hash = sha3(address(this), beneficiary, amount);
        if(owner != ecrecover(hash, sig_v, sig_r, sig_s)) return;
        
        // Attempt sending the difference between 
        // the cumulative amount on the cheque
        // and the cumulative amount on the last 
        // cashed cheque to beneficiary.
        if (amount - sent[beneficiary] >= this.balance) {
        // update the cumulative amount before sending
            sent[beneficiary] = amount;
            if (!beneficiary.send(amount - sent[beneficiary])) {
                // Upon failure to execute send, revert everything
                throw;
            }
        } else {
            // Upon failure, punish owner for writing a bounced cheque.
            Overdraft(owner);
            // Compensate beneficiary.
            suicide(beneficiary);
        }
    }
}