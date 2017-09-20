// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform, $ionicPopup) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    $ionicPopup.confirm({
                        title: "Internet Disconnected",
                        content: "The internet is disconnected on your device."
                    })
                    .then(function(result) {
                        if(!result) {
                            //ionic.Platform.exitApp();
                        }
                    });
                }
            }
  });
})


.controller('SoundCtrl', function($scope,$ionicPlatform,$state, $ionicLoading, $ionicPopup,$timeout) {
  console.log = function() {};
  $scope.flags = [];
  $scope.loaderProg = $ionicLoading;
  $scope.ionicPopup = $ionicPopup;
  $scope.timeout = $timeout;
  $scope.index = 0;
  $scope.highlightStack = [];
  $scope.promptX = function()
  {
    if($scope.flagCheck)
      clearInterval($scope.flagCheck);
    if($scope.myPopup)
      $scope.myPopup.close();
    $scope.myPopup = $scope.ionicPopup.prompt({
      template: '<input type="password">',
      title: "No text on this page",
      subTitle: 'Do you want to go to the next page?',
      buttons: [
        { text: 'Stay On This Page' },
        {
          text: '<b>Next Page</b>',
          type: 'button-positive',
          onTap: function(e) {
            responsiveVoice.speak("Blank Page", "UK English Male", $scope.voiceParameters);
            $scope.nextPage();
          }
        },
      ]
    });
    $scope.myPopup.then(function(res) {
      /*(if(res) {
        $scope.nextPage();
      }*/

    });
    /*$scope.timeout(function() {
      $scope.myPopup.close(); //close the popup after 3 seconds for some reason
      $scope.nextPage();
    }, 3000);*/
    $timeout(function() {

    }, 3000);
  };

  this.pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber - 1;
var checkInternet = async function(){
  if(window.Connection) {
    if(navigator.connection.type == Connection.NONE) {
      $ionicPopup.confirm({
        title: "Internet Disconnected",
        content: "The internet is disconnected on your device."
      })
        .then(function(result) {
          if(!result) {
            //ionic.Platform.exitApp();
          }
        });
    }
  }
};

  $scope.voiceStartCallback  = function() {

    if($scope.flagCheck)
      clearInterval($scope.flagCheck);
    if($scope.focusON)
      $scope.focusPage();
  };
/*
 The responsive-voice narrator has stopped talking.
 */
  $scope.voiceEndCallback = function() {
    console.log("is talking = "+$scope.isTalking);
    responsiveVoice.cancel();
    $scope.nextPhrase();

  };
  /*
 The responsive-voice narrator has stopped talking.
 */
  $scope.voiceEndCallbackBlank = function() {
    console.log("is talking = "+$scope.isTalking);
    responsiveVoice.cancel();
    $scope.nextPage();

  };
  /*
 The responsive-voice narrator has encountered an error.
 */
  $scope.voiceErrorCallback= function() {
    console.log("ERROR!");
    responsiveVoice.cancel();
    responsiveVoice.speak("Skipping this.", "UK English Male", $scope.voiceParameters);

  };
  /*
   The responsive-voice narrator voice PARAMETERS (assigning callback functions).
   */
  $scope.voiceParameters = {
    onstart: $scope.voiceStartCallback,
    onend: $scope.voiceEndCallback,
    onerror: $scope.voiceErrorCallback,
    rate: 1.0
  };
  $scope.voiceParametersBlank = {
    onstart: $scope.voiceStartCallback,
    onend: $scope.voiceEndCallbackBlank,
    onerror: $scope.voiceErrorCallback,
    rate: 1.0
  };
  /*
  This function is used to link multiple groups of text lying on the same line
  into one speech stream. This is so that the narrator speaks the entire line as a whole.
  This is needed, as some PDFs groups text of text per word or shorter.

  - isForward: a boolean telling the program whether or not to move back a line
  or simply just continue to the next line.
   */
  var linkLines = function(isForward, isPrevPage)
  {
    try {
      var pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber - 1;
      var page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
      var sents = page.textLayer.textContent.items;
      if(!isForward)
      {
        if($scope.highlightStack)

          while($scope.highlightStack.length > 0)
          {
            var indexToClear = $scope.highlightStack.pop();
            $scope.resetStyle(page.textLayer.textDivs, indexToClear);
            $scope.index--;
          }
      }
      else
      {
        if($scope.highlightStack)
          while($scope.highlightStack.length > 0)
          {
            var indexToClear = $scope.highlightStack.pop();
            $scope.resetStyle(page.textLayer.textDivs, indexToClear);
          }
      }
      var sayAll = "";
      /*
      if(isPrevPage) {
        $scope.index = sents.length - 1;
        isForward = false;
      }
       */

      if($scope.index < 0){
        /**
         * GO TO PREVIOUS PAGE
         */
        console.log("(IS TALKING) scoe.onNextPa();");
        $scope.index = 0;
        $scope.prevPage();
      }
      else if($scope.index >= sents.length){
        /**
         * GO TO NEXT PAGE
         */
        console.log("(IS TALKING) scoe.onNextPa();");
        $scope.index = 0;
        $scope.nextPage();
      }

      var targetPosition = sents[$scope.index].transform[5];
      var lightCount = 0;
      responsiveVoice.cancel();
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
      var sayBackwards = "";
      while((($scope.index < sents.length && $scope.index >=0)&&(Math.abs(sents[$scope.index].transform[5] - targetPosition) < sents[$scope.index].height * 3))
      || (($scope.index < sents.length && $scope.index >=0)&&(sayBackwards.match(/\S+/g)||[]).length < 10))
      {
        console.log($(page.textLayer.textDivs[$scope.index]));
        //$(page.textLayer.textDivs[$scope.index]).css("border-width", "3");
        $(page.textLayer.textDivs[$scope.index]).css("border-top-width", "0");
        $(page.textLayer.textDivs[$scope.index]).css("background-color", "rgba(255,255,0,0.4)");

        $(page.textLayer.textDivs[$scope.index]).css("border-right-width", "0");
        $(page.textLayer.textDivs[$scope.index]).css("border-left-width", "0");

        $(page.textLayer.textDivs[$scope.index]).css("border-color", "rgba(255,0,0,1)");
        $(page.textLayer.textDivs[$scope.index]).css("border-style", "solid");
        $scope.highlightStack.push($scope.index);
        console.log(sents[$scope.index]);

        if(isForward) {
          sayBackwards += sents[$scope.index].str.toLowerCase();
          sayAll += sents[$scope.index++].str.toLowerCase();

        }
        else{
          sayBackwards += sents[$scope.index].str.toLowerCase();
          $scope.index--;

        }

      }
      $ionicLoading.hide();
      if(!isForward)
      {
        for(var i =$scope.highlightStack.length-1; i>=0 ;i--)
          sayAll += sents[$scope.highlightStack[i]].str.toLowerCase();
      }
      var whatToSay = sayAll.replace(/[^a-zA-Z0-9\s\+\%\$\.\?!,—]/g, '');
      console.log("saying: "+whatToSay);
      if(whatToSay==='') {
        $scope.nextPhrase();
      }
      else {
        if(!isPrevPage) {
          $scope.focusON = true;
        }
        else{
          $scope.focusON = false;
        }
        responsiveVoice.speak(whatToSay, "UK English Male", $scope.voiceParameters);

      }
    }catch (err)
    {
      console.log(err);
      //$scope.voiceErrorCallback();
    }
  };
  $scope.finishRenderX  = function() {
    console.log("TEXT LAYER:");
    console.log($scope.textLayer);
    if ($scope.textLayer.textDivs.length > 0) {
      console.log("TEXT LAYER: T");
      $scope.isTalking = true;
      $scope.talkCont(false);
    }
    else {
      console.log("TEXT LAYER: F");
     // angular.element(document.getElementById('controllerForAngular')).scope().promptX();
      responsiveVoice.speak("Blank Page", "UK English Male", $scope.voiceParametersBlank());
      $scope.nextPage();
    }
  };
  $scope.talkCont = function(isPrevPage)
  {
    checkInternet();
    if($scope.flagCheck)
      clearInterval($scope.flagCheck);
    // stop speaking current sentence
    responsiveVoice.cancel();
    //if($scope.index==0)
    //  $scope.useless();


    var pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber - 1;
    var page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
    if(this.pageIndex !== pageIndex)
    {
      this.pageIndex = pageIndex;
    }
    try {
      if (typeof page === "undefined"||page === null) {
        console.log("page is undefined");
        setTimeout(function () {
          $scope.waitForPageToLoad(false);
        }, 250);
        return;
      }
      if (typeof page.textLayer === "undefined" || page.textLayer.textDivs.length === 0 || page.textLayer === null) {
        console.log("textDivs is undefined");
        /*setTimeout(function () {
          $scope.waitForPageToLoad();
        }, 250);*/

        //$scope.talkCont();
        setTimeout(function () {
          $scope.nextPage();
          //$scope.finishRenderX();
        }, 250);
        return;
      }
    }catch (err){console.log(err);
      setTimeout(function () {
        $scope.waitForPageToLoad(false);
      }, 250);
    }


    console.log("playing sound");
    var button = $( "#play");
    if($scope.isTalking)
    {
      button.toggleClass( 'fa fa-play', false );
      button.toggleClass( 'fa fa-pause', true );
    }
    else {
      button.toggleClass( 'fa fa-pause', false );
      button.toggleClass( 'fa fa-play', true );

    }

    responsiveVoice.cancel();

    var sents = page.textLayer.textContent.items;



    if($scope.isTalking) {




      if($scope.index < (sents.length) && $scope.index >= (0) )
      {
        console.log("below is textLayer data:");
        console.log(page.textLayer);
        if($scope.atEnd)
        {
          $scope.index = sents.length - 1;
          $scope.atEnd = false;
        }
        console.log($(page.textLayer.textDivs[$scope.index]).css("background-color"));

        console.log($scope.index);
       // console.log("saying: "+sents[$scope.index].str);
        linkLines(true, isPrevPage);
      }
      else if($scope.index < 0){
        /**
         * GO TO PREVIOUS PAGE
         */
        console.log("(IS TALKING) scoe.onNextPa();");
        $scope.index = 0;
        $scope.prevPage();
      }
      else if($scope.index >= sents.length){
        /**
         * GO TO NEXT PAGE
         */
        console.log("(IS TALKING) scoe.onNextPa();");
        $scope.index =0;
        $scope.nextPage();
      }

    }


  };
  $scope.resume = function()
  {
    $scope.isTalking = true;
    $scope.talkCont(false);
  };

  $scope.pauseIt = function()
  {
    var button = $( "#play");

    button.toggleClass( 'fa fa-pause', false );
    button.toggleClass( 'fa fa-play', true );

    $scope.isTalking = false;
    if(responsiveVoice.isPlaying()) {
      responsiveVoice.cancel();

    }
    else {
      responsiveVoice.cancel();
    }



  };

  $scope.useless = function () {
    responsiveVoice.cancel();
    var tt = $('#viewer');
    //var tt = $('button');
      //
    tt.on({
      "click": function( event, ui ) {
        var pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber - 1;
        var page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
        var sents = page.textLayer.textContent.items;
        $scope.resetStyle(page.textLayer.textDivs, $scope.index);
        console.log("ois09f3wjs0fj");
        console.log(ui);
        console.log(event);
        console.log(event.target.outerText);
        var curPos = $(event.target).parent().children().index(event.target);
        console.log(curPos);
        var i = curPos;
        console.log("SUCCESS @" + i);
        var sents = page.textLayer.textDivs;
        if(!(i>=0 && i < sents.length))
          return;

        $scope.index = i;
        $scope.isTalking = true;
        var sents = page.textLayer.textDivs;
        for (var k = 0; k < sents.length; k++)
        {
          $scope.resetStyle(sents, k);
        }


        console.log("playing sound");
        var button = $( "#play");
        if($scope.isTalking)
        {
          button.toggleClass( 'fa fa-play', false );
          button.toggleClass( 'fa fa-pause', true );
        }
        else {
          button.toggleClass( 'fa fa-pause', false );
          button.toggleClass( 'fa fa-play', true );

        }

        responsiveVoice.cancel();
        pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber - 1;
        page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
        sents = page.textLayer.textContent.items;



        if($scope.index < (sents.length) && $scope.index >= (0) )
        {
          console.log("below is textLayer data:");
          console.log(page.textLayer);
          console.log($(page.textLayer.textDivs[$scope.index]).css("background-color"));

          console.log($scope.index);
          try {
            var sayAll = "";

            if($scope.index < 0){
              /**
               * GO TO PREVIOUS PAGE
               */
              console.log("(IS TALKING) scoe.onNextPa();");
              $scope.index = 0;
              $scope.prevPage();
            }
            else if($scope.index >= sents.length){
              /**
               * GO TO NEXT PAGE
               */
              console.log("(IS TALKING) scoe.onNextPa();");
              $scope.index =0;
              $scope.nextPage();
            }
            var targetPosition = sents[$scope.index].transform[5];
            var lightCount =0;
            responsiveVoice.cancel();
            $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
            while((($scope.index < sents.length && $scope.index >=0)&&(Math.abs(sents[$scope.index].transform[5] - targetPosition) < sents[$scope.index].height * 3))
            || (($scope.index < sents.length && $scope.index >=0)&&(sayAll.match(/\S+/g)||[]).length < 10))
            {
              console.log($(page.textLayer.textDivs[$scope.index]));

              //$(page.textLayer.textDivs[$scope.index]).css("border-width", "3");
              $(page.textLayer.textDivs[$scope.index]).css("border-top-width", "0");
              $(page.textLayer.textDivs[$scope.index]).css("background-color", "rgba(255,255,0,0.4)");
              $(page.textLayer.textDivs[$scope.index]).css("border-right-width", "0");
              $(page.textLayer.textDivs[$scope.index]).css("border-left-width", "0");

              $(page.textLayer.textDivs[$scope.index]).css("border-color", "rgba(255,0,0,1)");
              $(page.textLayer.textDivs[$scope.index]).css("border-style", "solid");
              $scope.highlightStack.push($scope.index);
              console.log(sents[$scope.index]);
              sayAll += sents[$scope.index++].str.toLowerCase();

            }
            $ionicLoading.hide();
            var whatToSay = sayAll.replace(/[^a-zA-Z0-9\s\+\%\$\.\?!,—]/g, '');
            console.log("saying: "+whatToSay);
            if(whatToSay==='') {
              $scope.nextPhrase();
            }
            else
              responsiveVoice.speak(whatToSay, "UK English Male", $scope.voiceParameters);
          }catch (err)
          {
            console.log(err);
            $scope.voiceErrorCallback();
          }
        }
        else if($scope.index < 0){
          /**
           * GO TO PREVIOUS PAGE
           */
          console.log("(IS TALKING) scoe.onNextPa();");
          $scope.index = 0;
          $scope.prevPage();
        }
        else if($scope.index >= sents.length){
          /**
           * GO TO NEXT PAGE
           */
          console.log("(IS TALKING) scoe.onNextPa();");
          $scope.index =0;
          $scope.nextPage();
        }
      },
      "mouseout": function() {
      }
    });

  };

  $("#viewer").click(function() {
    $scope.useless();
  });
  $scope.videoPlay = function()
  {
    $scope.prevIndex = $scope.index;
    var pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber - 1;
    var page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
    if(this.pageIndex !== pageIndex)
    {
      //$scope.index = 0;
      this.pageIndex = pageIndex;
    }
    var button = $( "#play");
    if (button.hasClass( "fa fa-pause") || $scope.isTalking == true) {
      button.toggleClass( 'fa fa-pause', false );
      button.toggleClass( 'fa fa-play', true );
      $scope.pauseIt();

    } else {
      button.toggleClass( 'fa fa-play', false );
      button.toggleClass( 'fa fa-pause', true );
      if(responsiveVoice.isPlaying()) {
        $scope.resume();

      }
      else {
        $scope.resume();
      }



    }

  };
  $scope.focusPage = async function()
  {
    /*
    var pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber;
    var pagesCount = window.PDFViewerApplication.pdfViewer.pagesCount;
    var page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
    if(pageIndex <= pagesCount) {
      window.PDFViewerApplication.pdfViewer.scrollPageIntoView(pageIndex);
      window.PDFViewerApplication.forceRendering();
    }*/
  };

  $scope.nextPage = function()
  {
    if($scope.flagCheck)
      clearInterval($scope.flagCheck);
    responsiveVoice.cancel();
    $scope.index=0;
    var pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber +1;
    var pagesCount = window.PDFViewerApplication.pdfViewer.pagesCount;
    var page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
    if(pageIndex <= pagesCount) {

      try{
        window.PDFViewerApplication.zoomIn();
        window.PDFViewerApplication.zoomOut();

        // window.PDFViewerApplication.forceRendering();
        //window.PDFViewerApplication.currentPageNumber = pageIndex ;
        $("#pageNumber").val(pageIndex);
      }catch (err)
      {
        console.log(err);
      }
      window.PDFViewerApplication.pdfViewer.scrollPageIntoView(pageIndex);
    }
    $scope.waitForPageToLoad(false);

  };
  $scope.prevPageRW = function()
  {
    $scope.isTalking = false;
    if($scope.flagCheck)
      clearInterval($scope.flagCheck);
    responsiveVoice.cancel();
    var pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber -2;
    var pagesCount = window.PDFViewerApplication.pdfViewer.pagesCount;
    var page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
    if(pageIndex > 0) {
      window.PDFViewerApplication.pdfViewer.scrollPageIntoView(pageIndex);
      //window.PDFViewerApplication.forceRendering();
    }
    $scope.waitForPageToLoad(true);
  };

  $scope.prevPage = function()
  {
    if($scope.flagCheck)
      clearInterval($scope.flagCheck);
    responsiveVoice.cancel();
    $scope.index=0;
    var pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber -1;
    var pagesCount = window.PDFViewerApplication.pdfViewer.pagesCount;
    var page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
    if(pageIndex <= pagesCount) {

      try{
        window.PDFViewerApplication.zoomIn();
        window.PDFViewerApplication.zoomOut();

       // window.PDFViewerApplication.forceRendering();
        //window.PDFViewerApplication.currentPageNumber = pageIndex ;
        $("#pageNumber").val(pageIndex);
      }catch (err)
      {
        console.log(err);
      }
      window.PDFViewerApplication.pdfViewer.scrollPageIntoView(pageIndex);
    }
    $scope.waitForPageToLoad(true);

  };
$scope.magicMoment = function()
{
  $scope.videoPlay();
};


$scope.waitForPageToLoad = function(isPrevPage)
    {
      if($scope.flagCheck)
        clearInterval($scope.flagCheck);
      $scope.flagCheck = setInterval(function() {
        console.log("waiting for page to load...");
        var pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber - 1;
        var page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
        if ((typeof page.textLayer !== "undefined" && page.textLayer !== null
          &&typeof page.textLayer.textContent !== "undefined"&&page.textLayer.textContent !== null)) {
          clearInterval($scope.flagCheck);
          //theCallback(); // the function to run once all flags are true
          $scope.useless();
          $scope.index = 0;
          var sents = page.textLayer.textContent.items;
          if(($scope.prevIndex -1)>=0 && ($scope.prevIndex -1)<sents.length) {

            $scope.resetStyle(page.textLayer.textDivs, $scope.prevIndex - 1);
          }
          if(($scope.prevIndex +1)>=0 && ($scope.prevIndex +1)<sents.length) {
            $scope.resetStyle(page.textLayer.textDivs, $scope.prevIndex + 1);
          }
          $scope.isTalking = true;

          $scope.talkCont(isPrevPage);
        }
        else {
          window.PDFViewerApplication.forceRendering();
        }
      }, 1000);
    };
  $scope.nextPhrase =  function(){
    $scope.prevIndex = $scope.index;
    $scope.talkCont(false);
    return;

  };

  $scope.resetStyle= function(array, index)
  {
    $(array[index]).css("background-color", "rgba(0,0,0,0)");
    $(array[index]).css("border-width", "0");
    $(array[index]).css("border-color", "rgba(0,0,0,0)");
  };

  $scope.prevPhrase =  function(){

    linkLines(false, false);
    $scope.prevIndex = $scope.index;
    /*
    var pageIndex = window.PDFViewerApplication.pdfViewer.currentPageNumber - 1;
    var page = window.PDFViewerApplication.pdfViewer._pages[pageIndex];
    if(this.pageIndex !== pageIndex)
    {
      this.pageIndex = pageIndex;
    }
    if (typeof page === "undefined")
    {
      console.log("page is undefined");
      return;
    }
     $scope.resetStyle(page.textLayer.textDivs,$scope.prevIndex);
    var sents = page.textLayer.textContent.items;
    if(($scope.prevIndex -1)>=0 && ($scope.prevIndex -1)<sents.length) {
      $scope.resetStyle(page.textLayer.textDivs,$scope.prevIndex - 1);
    }
    if(($scope.prevIndex +1)>=0 && ($scope.prevIndex +1)<sents.length) {
      $scope.resetStyle(page.textLayer.textDivs,$scope.prevIndex + 1);
    }
    $scope.isTalking = true;
    $scope.index-=2;
    $scope.talkCont();
    */
    return;

  };
  $("#zoomInPop").click(function(){
    window.PDFViewerApplication.zoomIn();
  });
  $("#zoomOutPop").click(function(){
    window.PDFViewerApplication.zoomOut();
  });
  window.PDFViewerApplication.open('vm-smalltables.pdf', 0);
  $scope.Analytics = async function(ScreenName)
  {



    function _waitForAnalytics(){
      if(typeof window.analytics !== 'undefined'){
        console.log("ANLYTICS RUNNING");

        // turn on debug mode
        // https://github.com/danwilson/google-analytics-plugin#javascript-usage


        // start tracker
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/

        window.analytics.startTrackerWithId('UA-102157499-2');

        // set user id
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-id

        window.analytics.setUserId($scope.userID );

        // track a view
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/screens
        // Hint: Currently no support for appName, appId, appVersion, appInstallerId
        //       If you need support for it, please create an issue on github:
        //       https://github.com/driftyco/ng-cordova/issues

        window.analytics.trackView(ScreenName);

        // set custom dimensions
        // https://developers.google.com/analytics/devguides/platform/customdimsmets



        // track event
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/events

        window.analytics.trackEvent('Videos', 'Video Load Time', 'Gone With the Wind', 100);

        // add transaction
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#addTrans

        window.analytics.addTransaction(1234, 'Acme Clothing', 11.99, 5, 1.29, 'EUR');

        // add transaction item
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#addItem

        window.analytics.addTransactionItem(
          1234, 'Fluffy Pink Bunnies', 'DD23444', 'Party Toys', 11.99, 1, 'GBP'
        );

        // allow IDFA collection to enable demographics and interest reports
        // https://developers.google.com/analytics/devguides/collection/ios/v3/optional-features#idfa

        window.analytics.setAllowIDFACollection(true);
      }
      else{

        setTimeout(function(){
          //console.log("analytics not there yet");
          _waitForAnalytics();
        },250);
      }
    };
    _waitForAnalytics();

  };
  $scope.Analytics("Started Listen PDF v2");
});
