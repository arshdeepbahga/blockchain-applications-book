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
import RPi.GPIO as GPIO ## Import GPIO library

## Use board pin numbering
GPIO.setmode(GPIO.BOARD) 

## Setup GPIO Pin 7 to OUT
GPIO.setup(7, GPIO.OUT) 

# Connect to Blockchain network
c = EthJsonRpc('192.168.1.20', 8101)

# Device account address to watch
account_to_watch = "0x0cafd203ca406bb39985d0f70d55b44b78d756eb"

# Get balance in the device account
balance = c.eth_getBalance(account_to_watch)
print "Starting Balance = " + str(balance)

# Switch is off initially
onStatus=False
GPIO.output(7,False) ## Turn off GPIO pin 7

while True:
    newbalance = c.eth_getBalance(account_to_watch)
    if onStatus==True:
        nowTime = datetime.datetime.now()
        timeElapsed = nowTime - onTime
        #print "Switch ON, Elapsed Time: " + str(timeElapsed.seconds)
        if timeElapsed.seconds >= 60:
            print "Switching OFF"
            onStatus=False
            GPIO.output(7,False) ## Turn off GPIO pin 7
        
    elif (newbalance > balance):
        #print "New Balance = " + str(newbalance)
        balance=newbalance
        #print "Switching ON"
        onStatus=True
        GPIO.output(7,True) ## Turn on GPIO pin 7
        onTime = datetime.datetime.now()
                    
    time.sleep(2)        
