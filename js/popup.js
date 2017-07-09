// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
  var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
    '?v=1.0&q=' + encodeURIComponent(searchTerm);
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response || !response.responseData || !response.responseData.results ||
        response.responseData.results.length === 0) {
      errorCallback('No response from Google Image search!');
      return;
    }
    var firstResult = response.responseData.results[0];
    // Take the thumbnail instead of the full image to get an approximately
    // consistent image size.
    var imageUrl = firstResult.tbUrl;
    var width = parseInt(firstResult.tbWidth);
    var height = parseInt(firstResult.tbHeight);
    console.assert(
        typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
        'Unexpected respose from the Google Image Search API!');
    callback(imageUrl, width, height);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    renderStatus('Performing Google Image search for ' + url);

    getImageUrl(url, function(imageUrl, width, height) {

      renderStatus('Search term: ' + url + '\n' +
          'Google image search result: ' + imageUrl);
      var imageResult = document.getElementById('image-result');
      // Explicitly set the width/height to minimize the number of reflows. For
      // a single image, this does not matter, but if you're going to embed
      // multiple external images in your page, then the absence of width/height
      // attributes causes the popup to resize multiple times.
      imageResult.width = width;
      imageResult.height = height;
      imageResult.src = imageUrl;
      imageResult.hidden = false;

    }, function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
  });
});

function handleClick(){

  var selectedReaction;
  var counter;

if (document.getElementById("like").checked) {
  selectedReaction = document.getElementById("like").value;
  handleCounter("like");

}
else if (document.getElementById('love').checked) {
  selectedReaction = document.getElementById('love').value;
  handleCounter("love");

}
else if (document.getElementById('haha').checked) {
  selectedReaction = document.getElementById('haha').value;
  handleCounter("haha");
}

else if (document.getElementById('wow').checked) {
  selectedReaction = document.getElementById('wow').value;
  handleCounter("wow");
}

else if (document.getElementById('sad').checked) {
  selectedReaction = document.getElementById('sad').value;
  handleCounter("sad");
}

else if (document.getElementById('angry').checked) {
  selectedReaction = document.getElementById('angry').value;
  handleCounter("angry");
}
var url = document.location.href;
chrome.storage.sync.set({url: selectedReaction}, function() {
          // Notify that we saved.
          alert('Reaction saved');
          console.log(selectedReaction + " reaction for: " + url + " saved");
        });
document.getElementById("output").innerHTML = "you reacted to " + url + " as " + selectedReaction;
//document.write(selectedReaction);
}

function initData(){
  /*When Firebase will be integrated*/
  /*
  var countLikes = getFromFirebase();
  var countLove = getFromFirebase();
  var countHaha = getFromFirebase();
  var countWow= getFromFirebase();
  var countSad = getFromFirebase();
  var countAngry = getFromFirebase();
  */
  console.log("in initData");

  /*for now*/
  var countLikes = 0;
  var countLove = 0;
  var countHaha = 0;
  var countWow= 0;
  var countSad = 0;
  var countAngry = 0;
  var url = document.location.href;
  
  var reactionsRadioIds = ["like", "love", "haha", "wow", "sad", "angry"];
  var previousReaction;
  

  chrome.storage.sync.get(url,
  function(data){
    if(chrome.runtime.lastError)
    {
        /* error */
        console.log("no previous reaction saved for: " + url);
        return;
    }
    else {
    previousReaction = data.url;
    console.log(" previous reaction for: " + url + " was " + previousReaction);
    }
  });

  for(var i = 0; i < reactionsRadioIds.length; i++){
    
    if(previousReaction == reactionsRadioIds[i]){
      var id = reactionsRadioIds[i]+"Counter";
      document.getElementById(id).innerHTML = 1;
      console.log("previous reaction: " + previousReaction + " set");
      document.getElementById(previousReaction).checked = true;
    }
    else{
      var id = reactionsRadioIds[i]+"Counter";
      document.getElementById(id).innerHTML = 0;
    
    
    }
  }

  // document.getElementById('likeCounter').innerHTML = countLikes;
  // document.getElementById('loveCounter').innerHTML = countLove;
  // document.getElementById('hahaCounter').innerHTML = countHaha;
  // document.getElementById('wowCounter').innerHTML = countWow;
  // document.getElementById('sadCounter').innerHTML = countSad;
  // document.getElementById('angryCounter').innerHTML = countAngry;

}

function handleCounter(reactionId){
  console.log("in handleCounter for: " + reactionId);
  var reactionsRadioIds = ["like", "love", "haha", "wow", "sad", "angry"];
  for(var i = 0; i < reactionsRadioIds.length; i++){
    
    if(reactionId == reactionsRadioIds[i]){
      var id = reactionsRadioIds[i]+"Counter";
      document.getElementById(id).innerHTML = 1;
      console.log("counter of " + id+ " increased.");
    }
    else{
      var id = reactionsRadioIds[i]+"Counter";
      document.getElementById(id).innerHTML = 0;
    
    console.log("counter of " + id+ " decreased.");
  }
  }
}
