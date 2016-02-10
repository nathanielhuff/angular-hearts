// script.js

(function (window, angular, undefined) {

  // constants
  var ANIMATIONS = [
    'bounce',
    'flash',
    'pulse',
    'rubberBand',
    'shake',
    'swing',
    'tada',
    'wobble',
    'jello',
    'bounceIn',
    'bounceInDown',
    'bounceInLeft',
    'bounceInRight',
    'bounceInUp',
    'bounceOut',
    'bounceOutDown',
    'bounceOutLeft',
    'bounceOutRight',
    'bounceOutUp',
    'fadeIn',
    'fadeInDown',
    'fadeInDownBig',
    'fadeInLeft',
    'fadeInLeftBig',
    'fadeInRight',
    'fadeInRightBig',
    'fadeInUp',
    'fadeInUpBig',
    'fadeOut',
    'fadeOutDown',
    'fadeOutDownBig',
    'fadeOutLeft',
    'fadeOutLeftBig',
    'fadeOutRight',
    'fadeOutRightBig',
    'fadeOutUp',
    'fadeOutUpBig',
    'flipInX',
    'flipInY',
    'flipOutX',
    'flipOutY',
    'lightSpeedIn',
    'lightSpeedOut',
    'rotateIn',
    'rotateInDownLeft',
    'rotateInDownRight',
    'rotateInUpLeft',
    'rotateInUpRight',
    'rotateOut',
    'rotateOutDownLeft',
    'rotateOutDownRight',
    'rotateOutUpLeft',
    'rotateOutUpRight',
    'hinge',
    'rollIn',
    'rollOut',
    'zoomIn',
    'zoomInDown',
    'zoomInLeft',
    'zoomInRight',
    'zoomInUp',
    'zoomOut',
    'zoomOutDown',
    'zoomOutLeft',
    'zoomOutRight',
    'zoomOutUp',
    'slideInDown',
    'slideInLeft',
    'slideInRight',
    'slideInUp',
    'slideOutDown',
    'slideOutLeft',
    'slideOutRight',
    'slideOutUp'
  ];

  var ANIMATION_END_EVENTS = [
  	'webkitAnimationEnd',
    'mozAnimationEnd',
    'MSAnimationEnd',
    'oanimationend',
    'animationend'
  ].join(' ');

  // instantiation

	var appName = 'hearts';

  angular
  	.module(appName, ['ngAnimate']);

  // services

  function UtilityService () {
    return {
      rand: function (min,max) {
        return Math.floor(Math.random() * (max - min)) + min;
      },
      deviate: function (v,r) {
        return Math.floor(Math.random() * ((v+r)-(v-r))) + (v-r);
      }
    }
  }

  angular
    .module(appName)
    .service('UtilityService', UtilityService);

  // directives

  // controllers

  function HeartsController($document, $rootScope, $scope, $timeout, $interval, UtilityService) {
    var _this = this;

    var NUM_HEARTS_SM = 20;
    var NUM_HEARTS_MD = 25;
    var NUM_HEARTS_LG = 30;
  	var LOAD_SPACING_INTERVAL = 100;

    var CONTAINER_CLASS = '.hearts-bg';
    var HEART_ASPECT = (645 / 585);
    var PADDING = 0.05;
    var COLORS = [
      '#CA111A',
      '#EB5067',
      '#F07186',
      '#F48C9E',
      '#FABFC7'
    ];

    _this.hearts = null;
    _this.numHeartsLoaded = 0;

    function init () {
      var n = 0;
      do {
        _this.hearts = makeHearts();
        n++;
      } while (!_this.hearts);

      // Show the first heart to set off a chain reaction
      ++_this.numHeartsLoaded;
      $scope.$apply();

      $interval(function () {
      	++_this.numHeartsLoaded;
      }, LOAD_SPACING_INTERVAL);

      console.log('Number of times heart creation attempted: ', n);
    }

    function getColor (property) {
      var o = {};
      o[property] = COLORS[UtilityService.rand(0, (COLORS.length - 1))];
      return o;
    }

    function getSizePosition () {
      var rect = $document[0].querySelector(CONTAINER_CLASS).getBoundingClientRect();

      var h = UtilityService.deviate(25,10);
      var w = HEART_ASPECT * h;

      var paddingY = (PADDING * rect.height);
      var paddingX = (PADDING * rect.width);

      var top, left;

      do {
        left = (UtilityService.rand(0,100) / 100) * rect.width;
      } while ( (left < paddingX) || ((left + paddingX + w) > rect.width) );

      do {
        top = (UtilityService.rand(0,100) / 100) * rect.height;
      } while ( (top < paddingY) || ((top + paddingY + h) > rect.height) );

      return {
        data: {
          height: h,
          width: w,
          top: top,
          left: left
        },
        style: {
          height: h + 'px',
          width: w + 'px',
          top: top + 'px',
          left: left + 'px'
        }
      };
    }

    function checkOverlap (a, b) {
      var xOverlap = ( (b.left < (a.left + a.width)) && (a.left < (b.left + b.width)) );
      var yOverlap = ( (b.top < (a.top + a.height)) && (a.top < (b.top + b.height)) );
      return (xOverlap && yOverlap);
    }

    /*
      body dimensions < (900 * 600) use min #
      greater than 900 * 600 use 25
      greater than 1800 * 1200 use 30
    */
    function checkDimensions () {
      var bodyRect = $document[0].body.getBoundingClientRect();
      var dimensions = bodyRect.width * bodyRect.height;

      if (!dimensions) {
        return NUM_HEARTS_SM;
      }

      if (dimensions < (900 * 600)) {
        return NUM_HEARTS_SM;
      } else if ( (dimensions >= (900*600)) && (dimensions < (1800 * 1200)) ) {
        return NUM_HEARTS_MD;
      } else if (dimensions >= (1800 * 1200)) {
        return NUM_HEARTS_LG;
      } else {
        return NUM_HEARTS_SM;
      }
    }

    // TODO : make this smarter by recreating problem heart element
    // instead of recreating the entire array
    function makeHearts () {
      var hearts = [];
      var n = checkDimensions();

      for (var i=0, ii=n; i<ii; ++i) {
        hearts.push({
          color: getColor('fill'),
          sizePosition: getSizePosition()
        });
      }

      for(var i=0,ii=hearts.length; i<ii; ++i) {
        for(var j=0,jj=hearts.length; j<jj; ++j) {
          if (j > i) {
            var check = checkOverlap(hearts[i].sizePosition.data, hearts[j].sizePosition.data);
            if (check) {
              return false;
            }
          }
        }
      }

      return hearts;
    }

    $document.ready(init);
  }

  angular
    .module(appName)
    .controller('HeartsController', HeartsController);

  // animations

  function heartAnimation (UtilityService) {

    function randomAnimation (element, done) {
      var className = 'animated ' + ANIMATIONS[UtilityService.rand(0, ANIMATIONS.length)];
      element.addClass(className);
      element.one(ANIMATION_END_EVENTS, function () {
        element.removeClass(className);
        done();
      });
    }

    return {
      enter: randomAnimation,
      leave: randomAnimation
    };
  }

  angular
    .module(appName)
    .animation('.heart', heartAnimation);

} )(window, window.angular);
