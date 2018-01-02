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

contract Voting {
    // Declare a complex type to reresent a single voter.
    struct Voter {        
        bool voted;  // if true, that person already voted
        uint vote;   // index of the voted proposal
        bool rightToVote; // if true, that person has right to vote
    }

    // Declare a complex type to reresent a single proposal.
    struct Proposal
    {
        bytes32 name;   // short name 
        uint voteCount; // number of accumulated votes
    }

    address public chairperson;
    uint public votingStart;
    uint public votingTime;
    uint public numProposals;
    mapping(address => Voter) public voters;
    mapping (uint => Proposal) public proposals;

    function Voting(bytes32[] proposalNames, uint _votingTime) {
        chairperson = msg.sender;
        voters[chairperson].rightToVote = true;
        votingStart = now;
        votingTime = _votingTime;
        numProposals=proposalNames.length;

        // For each of the provided proposal names, create a new
        // proposal object and add it to the end of the array.
        for (uint i = 0; i < proposalNames.length; i++) {
            Proposal p = proposals[i]; 
            p.name = proposalNames[i];
            p.voteCount = 0;
        }
    }

    function giveRightToVote(address voter) {
        if (msg.sender != chairperson || voters[voter].voted) {
            // `throw` terminates and reverts all changes to the state
            throw;
        }
        voters[voter].rightToVote = true;
    }

    function vote(uint proposal) {
        if (now > votingStart + votingTime) {
            // Revert the call if the voting period is over
            throw;
        }
        
        Voter sender = voters[msg.sender];

        if (sender.voted)
            throw;
        sender.voted = true;
        sender.vote = proposal;

        proposals[proposal].voteCount += 1;
    }

    function winningProposal() constant
            returns (uint winningProposal, bytes32 proposalName)
    {
        if (now <= votingStart + votingTime)
            throw; // voting did not yet end

        uint winningVoteCount = 0;
        for (uint p = 0; p < numProposals; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal = p;
                proposalName = proposals[p].name;
            }
        }
    }
}
