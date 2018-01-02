'''
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
'''
#!flask/bin/python
from flask import Flask, jsonify, abort, 
        request, make_response, url_for

from ethjsonrpc import EthJsonRpc
import time
import datetime

c = EthJsonRpc('127.0.0.1', 8101)

contract_addr = "0xdd44F726FDd682c20857e9CD37F0dA8bf78518D7"
stationID = [123]
balance = c.eth_getBalance(contract_addr)
print "Starting Balance = " + str(balance)
    
      
app = Flask(__name__, static_url_path="")

#curl -i http://localhost:5000/api/stationstate/123
@app.route('/api/stationstate/<int:id>', methods=['GET'])
def getStationState(id):
    result = c.call(contract_addr, 'getStationState(uint256)', 
                    [id], ['bool'])
    return jsonify(result)

#curl -i http://localhost:5000/api/station/123
@app.route('/api/station/<int:id>', methods=['GET'])
def getStation(id):
    result = c.call(contract_addr, 'stations(uint256)', 
            [id], ['uint256','string','uint256','uint256','uint256'])
    return jsonify(result)

#curl -i http://localhost:5000/api/user/abc@gmail.com
@app.route('/api/user/<string:email>', methods=['GET'])
def getUser(email):
    result = c.call(contract_addr, 'getUser(string)', [email], 
            ['string','address','uint256','uint256'])
    return jsonify(result)


#curl -i -H "Content-Type: application/json" -X POST -d 
#'{"email": "abc@gmail.com", "ID": 123, "duration": 30}' 
#http://localhost:5000/api/activateStation
@app.route('/api/activateStation', methods=['POST'])
def activateStation():
    if not request.json:
        abort(400)
        
    print request.json    

    email = request.json['email']
    ID = request.json['ID']
    duration = request.json['duration']

    result = c.call_with_transaction(c.eth_coinbase(), 
                contract_addr, 'activateStation(string,uint256,uint256)', 
                [email,ID,duration], gas=300000)

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
