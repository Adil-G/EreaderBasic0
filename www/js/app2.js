// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'pdf'])

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
  /*
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'pdf_viewer/web/viewer.html',
        controller: 'SoundCtrl'
      })
    $urlRouterProvider.otherwise('/login');
  })
*/
  .controller('SoundCtrl', function($scope,$ionicPlatform,$state) {
    /*$state.state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: function () {
        return "pdf_viewer/web/viewer.html";
      }
    });*/
    //console.log($state);
  })
  .controller('AppCtrl', function($scope) {


    var pageNum = 1;
    var pageRendering = false;
    var pageNumPending = null;
    var scale = 0.8;

    var canvas = document.getElementById('the-canvas');
    var ctx = canvas.getContext('2d');
    var canvasOverlay = document.getElementById('layer2');
    var ctxOverlay = canvas.getContext('2d');
    $scope.zoom = 1.0;
    $scope.getText2 = function(page)
    {
      var countPromises = [];
      countPromises.push(page.then(function(page) { // add page promise
        var textContent = page.getTextContent();
        return textContent.then(function(text){ // return content promise
          return text.items.map(function (s) { return s.str; }).join(''); // value page text

        });
      }));
      return Promise.all(countPromises).then(function (texts) {

        return texts.join('');
      });
    }
    $scope.text = "initialized";
    var scale = 1; //Set this to whatever you want. This is basically the "zoom" factor for the PDF.
    var INIT_PAGE = 1;
    /**
     * Converts a base64 string into a Uint8Array
     */
    function base64ToUint8Array(base64) {
      var raw = atob(base64); //This is a native function that decodes a base64-encoded string.
      var uint8Array = new Uint8Array(new ArrayBuffer(raw.length));
      for(var i = 0; i < raw.length; i++) {
        uint8Array[i] = raw.charCodeAt(i);
      }
      return uint8Array;
    }
    function loadPdf(pdfData) {
      PDFJS.disableWorker = true; //Not using web workers. Not disabling results in an error. This line is
                                  //missing in the example code for rendering a $scope.pdf.
      PDFJS.getDocument({data: pdfData}).then(function (pdfDoc_) {
        $scope.pdf = pdfDoc_;
        document.getElementById('page_count').textContent =   $scope.pdf.numPages;
        // Initial/first page rendering
        renderPage(pageNum);
      });;
      //$scope.pdf.then(renderPdf);

    }
    function renderPdf(pdf) {
      pdf.getPage(INIT_PAGE).then(renderPage2);
    }

    function voiceStartCallback() {
      $scope.index++;
    }

    function voiceEndCallback() {
      if($scope.index < 1)
      {
        $scope.talkCont();

      }else {
        $scope.talkCont();
      }

    }


    var parameters = {
      onstart: voiceStartCallback,
      onend: voiceEndCallback
    }

    function linedraw(ax,ay,bx,by)
    {
      if(ay>by)
      {
        bx=ax+bx;
        ax=bx-ax;
        bx=bx-ax;
        by=ay+by;
        ay=by-ay;
        by=by-ay;
      }
      var calc=Math.atan((ay-by)/(bx-ax));
      calc=calc*180/Math.PI;
      var length=Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
      document.body.innerHTML += "<div style='z-index: 15;height:" + length + "px;width:1px;background-color:black;position:absolute;top:" + (ay) + "px;left:" + (ax) + "px;transform:rotate(" + calc + "deg);-ms-transform:rotate(" + calc + "deg);transform-origin:0% 0%;-moz-transform:rotate(" + calc + "deg);-moz-transform-origin:0% 0%;-webkit-transform:rotate(" + calc  + "deg);-webkit-transform-origin:0% 0%;-o-transform:rotate(" + calc + "deg);-o-transform-origin:0% 0%;'></div>"
    }
    function rectdraw(ax,ay,bx,by)
    {
      linedraw(ax,ay, bx, ay);
      linedraw(ax,ay, ax, by);
      linedraw(bx,ay, bx, by);
      linedraw(ax,by, bx, by);
    }
    $scope.talkCont = function()
    {
      /*if ($scope.text === undefined || $scope.text === null) {
        $scope.text = $scope.text;
      }*/
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
      var sents = $scope.text.match(/[^\.!\?]+[\.!\?]+["']?|$/g);



      if($scope.isTalking && $scope.index < sents.length) {




        if($scope.index < (sents.length -1) )
        {
          //ctx.putImageData($scope.imgData,0,0);

          /*  var currIndex = $scope.index;
            $scope.onCurrPage();
            $scope.index = currIndex;*/

          if($scope.index < (sents.length -1) )
          {
            $('#slider').slider( "option", "max",sents.length);
            $("#slider").slider("option", "value", $scope.index);
            responsiveVoice.speak(sents[$scope.index], "UK English Male", parameters
              //,{onstart: $scope.talkCont(++$scope.index)}
            );
          }
        }
        else {
          console.log("(IS TALKING) scoe.onNextPa();");
          $scope.onNextPage();
        }

      }
      else if($scope.isTalking)
      {
        console.log("scoe.onNextPa();");
        //$scope.onNextPage();
      }
      else {
        console.log("(NOT TALKING) scoe.onNextPa();");
      }


    };
    $scope.ff = function()
    {
      var sents = $scope.text.match(/[^\.!\?]+[\.!\?]+["']?|$/g);
      if($scope.index < (sents.length - 1))
      {
        $scope.index++;
        $scope.talkCont();

      }
      else {
        $scope.onNextPage();
      }
    }
    $scope.rw = function()
    {
      if($scope.index>0)
      {
        $scope.index -= 2;
        $scope.talkCont();

      }
      else {
        $scope.onPrevPage();
      }
    }
    $scope.talk = function()
    {
      $("#slider").slider("option", "value", 0);
      $scope.isTalking = true;
      //responsiveVoice.speak($scope.text, "UK English Male");
      $scope.talkCont();
    }
    $scope.resume = function()
    {
      $scope.isTalking = true;
      //responsiveVoice.speak($scope.text, "UK English Male");
      $scope.talkCont();
    }
    $scope.shutUp = function()
    {
      var button = $( "#play");

      button.toggleClass( 'fa fa-pause', false );
      button.toggleClass( 'fa fa-play', true );
      $("#slider").slider("option", "value", 0);
      $scope.isTalking = false;
      if(responsiveVoice.isPlaying()) {
        responsiveVoice.cancel();

      }
      else {
        responsiveVoice.cancel();
      }

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
    $scope.restart = function()
    {
      var button = $( "#play");
      button.toggleClass( 'fa fa-play', false );
      button.toggleClass( 'fa fa-pause', true );
      //  var sents = $scope.text.match(/[^\.!\?]+[\.!\?]+["']?|$/g);
      //$('#slider').slider( "option", "max",sents.length);
      $("#slider").slider("option", "value", 0);

      responsiveVoice.cancel();

      $scope.isTalking = false;
      $scope.shutUp();
      $scope.talk();
    }
    $scope.videoPlay = function()
    {
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
    }

    $scope.add = function() {
      console.log("getting file");
      var f = document.getElementById('myFile').files[0],
        r = new FileReader();

      r.onloadend = function(e) {
        var pdfData = e.target.result;
        PDFJS.workerSrc = 'lib/pdfjs-dist/build/pdf.worker.js';
        loadPdf(pdfData);
      }

      r.readAsBinaryString(f);
    }
    $("#slider").slider(
      {
        min: 0,
        max: 100,
        step: 1,
        change: showValue

      });
    /*$("#update").click(function () {
        $("#slider").slider("option", "value", $("#seekTo").val());

    });*/
    function showValue(event, ui) {
      console.log("09fiew09sdf");
      console.log(event);

      $scope.index = ui.value;
      try{
        if($scope.isTalking)
        {
          if(event.handleObj.type=="mouseup")
            $scope.talkCont();
        }
      }catch(err)
      {

      }
      //$scope.talkCont();
    }
    var inputs = document.querySelectorAll( '.inputfile' );
    Array.prototype.forEach.call( inputs, function( input )
    {
      var label	 = input.nextElementSibling,
        labelVal = label.innerHTML;

      input.addEventListener( 'change', function( e )
      {
        console.log("getting file 2");
        var fileName = '';
        if( this.files && this.files.length > 1 )
          fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
        else
          fileName = e.target.value.split( '\\' ).pop();

        if( fileName )
          label.querySelector( 'span' ).innerHTML = fileName;
        else
          label.innerHTML = labelVal;

        console.log("getting file");
        var f = this.files[0],
          r = new FileReader();

        r.onloadend = function(e) {
          var pdfData = e.target.result;
          PDFJS.workerSrc = 'lib/pdfjs-dist/build/pdf.worker.js';
          loadPdf(pdfData);
        }

        r.readAsBinaryString(f);
      });
    });
    $('#myFile').on("change", $scope.add );
    function isEmpty(str) {
      return (!str || 0 === str.length);
    }
    function renderPageRW(num) {
      pageRendering = true;
      // Using promise to fetch the page
      $scope.pdf.getPage(num).then(function(page) {
        var widthXX = $(window).width()/1.6;
        var totalHeight = 0;
        $("ion-pane > *").each(function(){
          totalHeight += $(this).height();
        });
        var heightYY = $(window).height() - ( totalHeight - $(window).height());
        var heightYY = 0.9 * $(window).height()- Math.abs( ($(window).height() -totalHeight) ) - (1* $( "#pdf-ui-header" ).height()+$( "#pdf-ui-footer" ).height()+$( "#title-bar" ).height());

        var width = heightYY;
        width = widthXX;
        var rat2 = 3;
        var rat1 = 2;
        var ratio  = width / rat1;
        var calculated_height = ratio * rat2;
        var viewport = page.getViewport(calculated_height / page.getViewport($scope.zoom).width);
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // Render PDF page into canvas context
        //ctxOverlay.setTransform(1, 0, 0, 1, 0, 0);
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        var renderTask = page.render(renderContext);
        // Wait for rendering to finish
        renderTask.promise.then(function () {
          pageRendering = false;
          if (pageNumPending !== null) {
            // New page rendering is pending
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        });

        page.getTextContent().then(function(textContent) {
          var items = textContent.items;
          var full_page_text  = "";
          $scope.info = [];
          var sentenceStructure = {
            "str": [],
            "loc": [],
            "len": 0
          };
          var strAll = "";
          for(var lineNumber = 0; lineNumber < items.length; lineNumber++)
          {
            if(isEmpty(items[lineNumber].str))
              continue;
            /*console.log(
              {
                "text": items[lineNumber].str,
                "t": items[lineNumber].transform,
                "loc":
                {
                  "x": items[lineNumber].transform[4],
                  "y": items[lineNumber].transform[5],
                  "width": items[lineNumber].width,
                  "height": items[lineNumber].height
                },
                "all": items[lineNumber]
              }
            );*/
            var loc = {
              "x": items[lineNumber].transform[4],
              "y": items[lineNumber].transform[5],
              "width": items[lineNumber].width,
              "height": items[lineNumber].height
            };

            var line = items[lineNumber].str;
            full_page_text += line;

            var wall = line.match(/[^\.!\?]+[\.!\?]+["']?|$/g);
            if(wall.length < 2)
            {

              strAll += line + " ";
              sentenceStructure.str.push(line);
              sentenceStructure.loc.push(loc);
              sentenceStructure.len++;
            }
            else {
              for(var ind = 0; ind < (wall.length - 1); ind++)
              {
                var sent1 = wall[ind];

                strAll += sent1 + " ";
                sentenceStructure.str.push(sent1);
                sentenceStructure.loc.push(loc);
                sentenceStructure.len++;

                var obj = new Object(sentenceStructure);

                $scope.info.push(obj);
                strAll = "";
                sentenceStructure = {
                  "str": [],
                  "loc": [],
                  "len": 0
                };
              }
              strAll +=  wall[(wall.length - 1)];
              sentenceStructure.str.push(line);
              sentenceStructure.loc.push(loc);
              sentenceStructure.len++;
            }
          }

          $scope.text = full_page_text;
          $scope.text = full_page_text;

          var imageData = canvas.getContext('2d').createImageData(canvas.width, canvas.height);
          imageData.data.set(ctx.getImageData(0,0,canvas.width,canvas.height));
          $scope.imgData=imageData;

          $scope.strDataURI = canvas.toDataURL();
          ctx.save();
          $scope.restart();
          var sents = $scope.text.match(/[^\.!\?]+[\.!\?]+["']?|$/g);
          $("#slider").slider("option", "value", sents.length - 1);
          $scope.talkCont();
        });
      });
      // Update page counters
      document.getElementById('page_num').textContent = pageNum;

    }
    function renderPage(num) {
      $scope.index=0;
      pageRendering = true;
      // Using promise to fetch the page
      $scope.pdf.getPage(num).then(function(page) {
        var widthXX = $(window).width()/1.6;
        var totalHeight = 0;
        $("ion-pane > *").each(function(){
          totalHeight += $(this).height();
        });
        var heightYY = $(window).height() - ( totalHeight - $(window).height());
        var heightYY = 0.9 * $(window).height()- Math.abs( ($(window).height() -totalHeight) ) - (1* $( "#pdf-ui-header" ).height()+$( "#pdf-ui-footer" ).height()+$( "#title-bar" ).height());

        var width = heightYY;
        width = widthXX;
        var rat2 = 3;
        var rat1 = 2;
        var ratio  = width / rat1;
        var calculated_height = ratio * rat2;
        var viewport = page.getViewport(calculated_height / page.getViewport($scope.zoom).width);
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // Render PDF page into canvas context
        //ctxOverlay.setTransform(1, 0, 0, 1, 0, 0);
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        var renderTask = page.render(renderContext);
        // Wait for rendering to finish
        renderTask.promise.then(function () {
          pageRendering = false;
          if (pageNumPending !== null) {
            // New page rendering is pending
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        });

        page.getTextContent().then(function(textContent) {
          var items = textContent.items;
          var full_page_text  = "";
          $scope.info = [];
          var sentenceStructure = {
            "str": [],
            "loc": [],
            "len": 0
          };
          var strAll = "";
          for(var lineNumber = 0; lineNumber < items.length; lineNumber++)
          {
            if(isEmpty(items[lineNumber].str))
              continue;
            /*console.log(
              {
                "text": items[lineNumber].str,
                "t": items[lineNumber].transform,
                "loc":
                {
                  "x": items[lineNumber].transform[4],
                  "y": items[lineNumber].transform[5],
                  "width": items[lineNumber].width,
                  "height": items[lineNumber].height
                },
                "all": items[lineNumber]
              }
            );*/
            var loc = {
              "x": items[lineNumber].transform[4],
              "y": items[lineNumber].transform[5],
              "width": items[lineNumber].width,
              "height": items[lineNumber].height
            };

            var line = items[lineNumber].str;
            full_page_text += line;

            var wall = line.match(/[^\.!\?]+[\.!\?]+["']?|$/g);
            if(wall.length < 2)
            {

              strAll += line + " ";
              sentenceStructure.str.push(line);
              sentenceStructure.loc.push(loc);
              sentenceStructure.len++;
            }
            else {
              for(var ind = 0; ind < (wall.length - 1); ind++)
              {
                var sent1 = wall[ind];

                strAll += sent1 + " ";
                sentenceStructure.str.push(sent1);
                sentenceStructure.loc.push(loc);
                sentenceStructure.len++;

                var obj = new Object(sentenceStructure);

                $scope.info.push(obj);
                strAll = "";
                sentenceStructure = {
                  "str": [],
                  "loc": [],
                  "len": 0
                };
              }
              strAll +=  wall[(wall.length - 1)];
              sentenceStructure.str.push(line);
              sentenceStructure.loc.push(loc);
              sentenceStructure.len++;
            }
          }

          $scope.text = full_page_text;
          $scope.text = full_page_text;

          var imageData = canvas.getContext('2d').createImageData(canvas.width, canvas.height);
          imageData.data.set(ctx.getImageData(0,0,canvas.width,canvas.height));
          $scope.imgData=imageData;

          $scope.strDataURI = canvas.toDataURL();
          ctx.save();
          $scope.restart();
        });
      });
      // Update page counters
      document.getElementById('page_num').textContent = pageNum;

    }
    function renderPage3(num) {
      pageRendering = true;
      // Using promise to fetch the page
      $scope.pdf.getPage(num).then(function(page) {
        var widthXX = $(window).width()/1.6;
        var totalHeight = 0;
        $("ion-pane > *").each(function(){
          totalHeight += $(this).height();
        });
        var heightYY = $(window).height() - ( totalHeight - $(window).height());
        var heightYY = 0.9 * $(window).height()- Math.abs( ($(window).height() -totalHeight) ) - (1* $( "#pdf-ui-header" ).height()+$( "#pdf-ui-footer" ).height()+$( "#title-bar" ).height());

        var width = heightYY;
        width = widthXX;
        var rat2 = 3;
        var rat1 = 2;
        var ratio  = width / rat1;
        var calculated_height = ratio * rat2;
        var viewport = page.getViewport(calculated_height / page.getViewport($scope.zoom).width);
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // Render PDF page into canvas context
        //ctxOverlay.setTransform(1, 0, 0, 1, 0, 0);
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        var renderTask = page.render(renderContext);
        // Wait for rendering to finish
        renderTask.promise.then(function () {
          pageRendering = false;
          if (pageNumPending !== null) {
            // New page rendering is pending
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        });

      });
      // Update page counters
      document.getElementById('page_num').textContent = pageNum;
      $("#slider").slider("option", "value", $scope.index );
    }
    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    function queueRenderPage(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage(num);
      }
    }
    function queueRenderPageRW(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPageRW(num);
      }
    }
    function queueRenderPage3(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage3(num);
      }
    }
    /**
     * Displays previous page.
     */
    $scope.onPrevPage = function() {
      $("#slider").slider("option", "value", 0);
      if (pageNum <= 1) {
        return;
      }
      pageNum--;
      queueRenderPage(pageNum);
      //$scope.restart();
    };
    $scope.onPrevPage3 = function() {
      if (pageNum <= 1) {
        return;
      }
      pageNum--;
      queueRenderPageRW(pageNum);
      //$scope.restart();
    };
    document.getElementById('prev').addEventListener('click', $scope.onPrevPage);
    $scope.onCurrPage =  function() {
      queueRenderPage(pageNum);
      //$scope.restart();
    };
    /**
     * Displays next page.
     */
    $scope.onNextPage = function() {
      $("#slider").slider("option", "value", 0);
      if (pageNum >= $scope.pdf.numPages) {
        return;
      }
      pageNum++;
      queueRenderPage(pageNum);
      //$scope.restart();
    }
    document.getElementById('next').addEventListener('click', $scope.onNextPage);
    function onZoomIn()
    {
      $scope.zoom -= 0.1;
      queueRenderPage3(pageNum);
    }
    document.getElementById('zIn').addEventListener('click', onZoomIn);
    function onZoomOut()
    {
      $scope.zoom += 0.1;
      queueRenderPage3(pageNum);
    }
    document.getElementById('zOut').addEventListener('click', onZoomOut);
    function onZoomNorm()
    {
      $scope.zoom = 1.0;
      queueRenderPage3(pageNum);
    }
    document.getElementById('zNorm').addEventListener('click', onZoomNorm);

    $scope.Analytics = function(ScreenName)
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
    $scope.Analytics("History");
  });
