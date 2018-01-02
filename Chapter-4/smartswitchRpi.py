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
from ethjsonrpc import EthJsonRpc
import time
import datetime
import time
import serial
ser = serial.Serial('/dev/ttyACM0', 38400)

#Wait for sometime to initialize serial port
time.sleep(10)

# Connect to Blockchain network
c = EthJsonRpc('192.168.1.20', 8101)

# Device account address to watch
account_to_watch = "0xc421d5e214ddb07a41d28cf89ee37495aa5edba7"

# Get balance in the device account
balance = c.eth_getBalance(account_to_watch)
print "Starting Balance = " + str(balance)

# Switch is off initially
onStatus=False
ser.write("OFF") ## Turn off switch

while True:
    newbalance = c.eth_getBalance(account_to_watch)
    if onStatus==True:
        nowTime = datetime.datetime.now()
        timeElapsed = nowTime - onTime
        print "Switch ON, Elapsed Time: " + str(timeElapsed.seconds) + " seconds"
        if timeElapsed.seconds >= 3600:
            print "Switching OFF"
            onStatus=False
            ser.write("OFF") ## Turn off switch
        
    elif (newbalance > balance):
        print "New Balance = " + str(newbalance)
        balance=newbalance
        print "Switching ON"
        onStatus=True
        ser.write("ON") ## Turn on switch
        onTime = datetime.datetime.now()
                    
    time.sleep(2)        
