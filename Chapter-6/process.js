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

var postURL = 'http://192.168.1.79:5000';

function scanBarcode() {
  cordova.plugins.barcodeScanner.scan(
    function(result) {
      if (result.cancelled == false) {
        sessionStorage.setItem('qrcode', result.text);
        var stationID = result.text;
        $.ajax({
          url: postURL + '/api/station/' + stationID,
          method: 'GET',
          crossDomain: true,
          dataType: 'json',
          contentType: "application/json; charset=utf-8",
          success: function(data) {
            sessionStorage.setItem('stationdata', JSON.stringify(data));
            var stationdata = JSON.parse(
                              sessionStorage.getItem('stationdata'));
            sessionStorage.setItem('rate', stationdata[0]);
            sessionStorage.setItem('location', stationdata[1]);

            console.log(data);
            location.href = 'contract.html';
          },
          error: function() {
            console.log("Error");
          }
        });
      }
    },
    function(error) {
      $('#blemessage').html('QR code scanning failed: ' + error);
    }, {
      "preferFrontCamera": false,
      "showFlipCameraButton": true,
      "prompt": "Place a QR inside the scan area",
      "formats": "QR_CODE",
      "orientation": "portrait"
    }
  );
}

function transactionConfirm() {

  location.href = 'confirm.html';
}

function transactPage() {
  var minutes = parseFloat($('#minutes').val());
  var rate = sessionStorage.getItem('rate');
  var amount = minutes * rate;
  sessionStorage.setItem('amount', amount);
  sessionStorage.setItem('minutes', minutes);

  location.href = 'transact.html';
}

function onDeviceReady() {
  window.StatusBar.backgroundColorByHexString("#ff5722");
}

function transactionConfirm() {
  var email = sessionStorage.getItem('useremail');
  var ID = parseFloat(sessionStorage.getItem('qrcode'));
  var duration = parseFloat(sessionStorage.getItem('minutes')) * 60;
  var datadir = {
    email: email,
    ID: ID,
    duration: duration
  };
  console.log(datadir);
  $.ajax({
    url: postURL + '/api/activateStation',
    method: 'POST',
    crossDomain: true,
    dataType: 'json',
    contentType: "application/json; charset=utf-8",
    success: function(data) {
      sessionStorage.setItem('txdict', JSON.stringify(datadir));
      sessionStorage.setItem('txdata', JSON.stringify(data));
      location.href = 'confirm.html';
    },
    error: function() {
      console.log("Failed");
    },
    data: JSON.stringify(datadir)
  });
}

function isAvailable() {
  window.plugins.googleplus.isAvailable(function(avail) {
    alert(avail)
  });
}

function login() {
  $('#loginmessage').html("Logging in...");
  window.plugins.googleplus.login({},
    function(obj) {
      $('#loginmessage').html(obj.email + ' - ' + obj.displayName);
      sessionStorage.setItem('userimg', obj.imageUrl);
      sessionStorage.setItem('username', obj.displayName);
      sessionStorage.setItem('useremail', obj.email);
      var emailid = obj.email;
      $.ajax({
        url: postURL + '/api/user/' + emailid,
        method: 'GET',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function(data) {
          sessionStorage.setItem('userdata', JSON.stringify(data));
          //console.log(data);
          $('#loginmessage').html("Success");
          location.href = 'home.html';
        },
        error: function() {
          $('#loginmessage').html("Error");
        }
      });
    },
    function(msg) {
      $('#loginmessage').html(msg);
    }
  );
}

function trySilentLogin() {
  window.plugins.googleplus.trySilentLogin({},
    function(obj) {
      //console.log(obj.email);
    },
    function(msg) {
      //console.log(msg);
    }
  );
}

function logout() {
  window.plugins.googleplus.logout(
    function(msg) {
      //console.log(msg);
    },
    function(msg) {
      //console.log(msg);
    }
  );
}

$(document).ready(function() {
  document.addEventListener('deviceready', onDeviceReady, false);

  $("#btnbarcode").on('click', function(e) {
    e.preventDefault();
    scanBarcode();
  });

  $("#btnpay").on('click', function(e) {
    e.preventDefault();
    transactPage();
  });

  $("#btnconfirm").on('click', function(e) {
    e.preventDefault();
    transactionConfirm();
  });

  $("#loginwithgoogle").on('click', function(e) {
    e.preventDefault();
    login();
  });

  $("#logout").on('click', function(e) {
    e.preventDefault();
    logout();
  });
});


$(document).on('pagebeforecreate', '[data-role="page"]', function() {
  setTimeout(function() {
    $.mobile.loading('show');
  }, 1);
});

$(document).on('pageshow', '[data-role="page"]', function() {
  setTimeout(function() {
    $.mobile.loading('hide');
  }, 1);
});