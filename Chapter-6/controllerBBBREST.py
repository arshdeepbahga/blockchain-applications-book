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
import Adafruit_BBIO.GPIO as GPIO
import time
import requests
import json

stationID='123'
url='http://192.168.1.79:5000/api/stationstate/'+stationID

GPIO.setup("P8_10", GPIO.OUT) #GPIO - 68

onStatus=False

while True:
    r = requests.get(url)
    r = str(r.text)
    result = json.loads(r)

    if (onStatus==False):
        if(result[0]==True):
            print "Switch ON"
            onStatus=True
            GPIO.output("P8_10", GPIO.LOW)
    elif (onStatus==True):
        if(result[0]==False):
            print "Switch OFF"
            onStatus=False
            GPIO.output("P8_10", GPIO.HIGH)

    time.sleep(2)
