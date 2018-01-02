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

var accounts;
var account;
var myContractInstance;
var photoContainerHTML;
var photosCount ;

function initializeContract() {
  myContractInstance = StockPhotos.deployed();
  $("#cf_address").html(myContractInstance.address);
  $("#cb_address").html(account);

  myContractInstance.numPhotos.call().then(
    function(numPhotos) { 
      $("#cf_numPhotos").html(numPhotos.toNumber());
      photosCount = numPhotos.toNumber();
      refreshBalance();
  });
}

function setStatus(message) {
  $("#status").html(message);
};

function refreshBalance() {
  $("#cb_balance").html(web3.fromWei(
    web3.eth.getBalance(web3.eth.coinbase), "ether").toFixed(5));
}

function uploadPhoto() {
  setStatus("Uploading photo");    
    var file = document.getElementById('fileUpload').files[0];
    
    $.ajax({
        url: "http://localhost:8500/bzzr:/",
        type: "POST",
        data: file,
        processData: false,
        success: function (result) {
          uploadThumbnail(result);
        },
        error: function (result) {
            console.log(result);
        }
    });
}

function uploadThumbnail(photoID) {
  var thumbFile = document.getElementById('thumbnailUpload').files[0];

  $.ajax({
        url: "http://localhost:8500/bzzr:/",
        type: "POST",
        data: thumbFile,
        processData: false,
        success: function (result) {
          setStatus("Uploaded Photo. Hash: "+result);  
          var htmlStr = "<img src=\"http://localhost:8500/bzzr:/"+
                  result+"?content_type=image/jpeg\" width=\"300px\">";  
          $("#uploadedPhoto").html(htmlStr);
          newPhoto(photoID, result);
        },
        error: function (result) {
            console.log(result);
        }
    });
}

function newPhoto(photoID, thumbnailID) {
  var title = $("#title").val();
  var tags = $("#tags").val();
  var price = parseFloat($("#price").val());

  myContractInstance.newPhoto(photoID.toString(), 
          thumbnailID.toString(), title.toString(), tags.toString(), 
          price, {from: web3.eth.accounts[0], gas: 2000000}).then(
    function(result) {
      console.log(result);
      return myContractInstance.numPhotos.call();
    }).then(
    function(numPhotos) {
      console.log(numPhotos);
      $("#cf_numPhotos").html(numPhotos.toNumber());
      photosCount = numPhotos.toNumber();
      return myContractInstance.photoExists.call(thumbnailID);
    }).then(
    function(exists) {
      console.log(exists);
      if (exists) {
        setStatus("Photo submitted");
      } else {
        setStatus("Error in submitting photo");
      }
      refreshBalance();
    });
}

function getPhotoWithIndex(index){
  myContractInstance.getPhotoWithIndex.call(index).then(
    function(result) { 
      console.log(result);
       photoContainerHTML += "<img src=\"http://localhost:8500/bzzr:/"+
          result[0]+"?content_type=image/jpeg\" width=\"350px\" \
                  style=\"float: left; margin: 0 20px 20px 0;\">";

        photoContainerHTML += "<h2>"+result[2]+"</h2>";
        photoContainerHTML += "<p>Tags: "+result[3]+"</p>";
        photoContainerHTML += "<p>Author address: "+result[1]+"</p>";
        photoContainerHTML += "<p>Upload timestamp: "+result[4]+"</p>";
        photoContainerHTML += "<p>Downloads: "+result[6]+"</p>";
        photoContainerHTML += "<p>Price: "+result[5]+" Wei</p>";

        photoContainerHTML += "<button class=\"btn btn-primary btn-lg\" \
              onclick=\"buyPhoto('"+result[0]+"','"+result[5]+"');\">\
              BUY</button>";

        photoContainerHTML += "<br><br><br><br>";
        console.log(photoContainerHTML);
        $("#photosContainer").html(photoContainerHTML);
  });
}

function buyPhoto(thumbnailID, price){
  console.log(thumbnailID);
  console.log(price);

  myContractInstance.buyPhoto(thumbnailID, 
      {from: web3.eth.accounts[0], gas: 2000000, 
      value: parseFloat(price)}).then(
    function(result) {
      return myContractInstance.getPhotoWithID.call(thumbnailID);
    }).then(
    function(result) {
      var photoURL = "http://localhost:8500/bzzr:/"+
                    result+"?content_type=image/jpeg";
      console.log(photoURL);
      $("#downloadContainer").attr("href", photoURL);
      document.getElementById('downloadContainer').click();

    });
}

function getPhotos() {  
  photoContainerHTML="";

  for(i=0;i<photosCount;i++){
    getPhotoWithIndex(i);
  }
}

window.onload = function() {
  $( "#tabs" ).tabs();
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! ");
      return;
    }

    accounts = accs;
    account = accounts[0];
    initializeContract();
  });
}
