(function() {
  'use strict';
  var createTestView;

  createTestView = function(elemHtml, bef, aft) {
    var test;
    test = {
      elem: null,
      scope: null
    };
    beforeEach(inject(function($rootScope, $compile) {
      test.elem = angular.element(elemHtml);
      $('body,html').css('height', '100%');
      $('body').append(test.elem);
      test.scope = $rootScope.$new(true);
      test.scope.inviewSpy = jasmine.createSpy('inviewSpy');
      test.spyCalls = 0;
      test.scrollAndWaitInView = function(scroll, done, callback) {
        var check, interval, _ref;
        test.spyCalls = test.scope.inviewSpy.calls.count();
                if ((_ref = typeof scroll === "function" ? scroll() : void 0) != null) {
          _ref;
        } else {
          $(window).scrollTop(scroll);
        };
        check = function() {
          if (test.scope.inviewSpy.calls.count() > test.spyCalls) {
            if (typeof interval !== "undefined" && interval !== null) {
              clearInterval(interval);
            }
            if (typeof callback === "function") {
              callback();
            }
            if (typeof done === "function") {
              done();
            }
            true;
          }
          return false;
        };
        if (!check()) {
          return interval = setInterval(check, 50);
        }
      };
      $compile(test.elem)(test.scope);
      test.scope.$digest();
      return typeof bef === "function" ? bef() : void 0;
    }));
    afterEach(function() {
      var _ref, _ref1;
      if ((_ref = test.scope) != null) {
        _ref.$destroy();
      }
      test.scope = null;
      if ((_ref1 = test.elem) != null) {
        _ref1.remove();
      }
      test.elem = null;
      return typeof aft === "function" ? aft() : void 0;
    });
    return test;
  };

  describe('Directive: inView', function() {
    beforeEach(module('angular-inview'));
    describe('local variables', function() {
      var test;
      test = createTestView("<div id=\"zero\" in-view=\"inviewSpy($event, $inview, $inviewpart)\" style=\"height:0\"></div>");
      return it('should define local variables `$event`, `$inview` and `$inviewpart`', function(done) {
        return test.scrollAndWaitInView(0, done, function() {
          expect(test.scope.inviewSpy.calls.count()).toEqual(1);
          expect(test.scope.inviewSpy.calls.mostRecent().args[0].inViewTarget).toBe(test.elem[0]);
          expect(test.scope.inviewSpy.calls.mostRecent().args[1]).toBe(true);
          return expect(test.scope.inviewSpy.calls.mostRecent().args[2]).toBe('both');
        });
      });
    });
    describe('scrolling behaviour', function() {
      var test;
      test = createTestView("<div id=\"zero\" in-view=\"inviewSpy(0, $inview, $inviewpart)\" style=\"height:0\"></div>\n<div id=\"one\" in-view=\"inviewSpy(1, $inview, $inviewpart)\" style=\"height:100%\">one</div>\n<div id=\"two\" in-view=\"inviewSpy(2, $inview, $inviewpart)\" style=\"height:100%\">two</div>\n<div id=\"three\" in-view=\"inviewSpy(3, $inview, $inviewpart)\" style=\"height:100%\">three</div>");
      it('should initially execute the expression for all in-view elements', function(done) {
        return test.scrollAndWaitInView(0, done, function() {
          expect(test.scope.inviewSpy.calls.count()).toEqual(2);
          expect(test.scope.inviewSpy).toHaveBeenCalledWith(0, true, 'both');
          return expect(test.scope.inviewSpy).toHaveBeenCalledWith(1, true, 'top');
        });
      });
      return it('should change the inview status on scrolling', function(done) {
        return test.scrollAndWaitInView(0, null, function() {
          return test.scrollAndWaitInView(window.innerHeight / 2, null, function() {
            expect(test.scope.inviewSpy.calls.count() - test.spyCalls).toEqual(3);
            expect(test.scope.inviewSpy).toHaveBeenCalledWith(0, false, void 0);
            expect(test.scope.inviewSpy).toHaveBeenCalledWith(1, true, 'bottom');
            expect(test.scope.inviewSpy).toHaveBeenCalledWith(2, true, 'top');
            return test.scrollAndWaitInView(window.innerHeight * 2, done, function() {
              expect(test.scope.inviewSpy.calls.count() - test.spyCalls).toEqual(3);
              expect(test.scope.inviewSpy).toHaveBeenCalledWith(1, false, void 0);
              expect(test.scope.inviewSpy).toHaveBeenCalledWith(2, true, 'bottom');
              return expect(test.scope.inviewSpy).toHaveBeenCalledWith(3, true, 'top');
            });
          });
        });
      });
    });
    describe('options', function() {
      var test;
      test = createTestView("<div id=\"zero\" in-view=\"inviewSpy(0, $inview, $inviewpart)\" style=\"height:100%\" in-view-options=\"{ debounce: 100 }\"></div>\n<div id=\"one\" in-view=\"inviewSpy(1, $inview, $inviewpart)\" style=\"height:100%\" in-view-options=\"{ debounce: 0, offset: -100 }\">one</div>");
      it('should debounce in-view calls when `debounce` option is specified', function(done) {
        return test.scrollAndWaitInView(100, null, function() {
          expect(test.scope.inviewSpy).not.toHaveBeenCalledWith(0, true, 'bottom');
          return setTimeout((function() {
            expect(test.scope.inviewSpy).toHaveBeenCalledWith(0, true, 'bottom');
            return done();
          }), 150);
        });
      });
      return it('should offset a view when `offset` option is specified', function(done) {
        return test.scrollAndWaitInView(0, done, function() {
          return expect(test.scope.inviewSpy).toHaveBeenCalledWith(1, true, 'top');
        });
      });
    });
    return describe('element positioning behaviours', function() {
      var test;
      test = createTestView("<div id=\"one\" in-view=\"inviewSpy(0, $inview, $inviewpart)\" style=\"height:100%\">zero</div>\n<div id=\"one\" in-view=\"inviewSpy(1, $inview, $inviewpart)\" style=\"height:100%\" ng-show=\"showSpacer\">one</div>\n<div id=\"two\" in-view=\"inviewSpy(2, $inview, $inviewpart)\" style=\"height:10%\">two</div>\n<div id=\"one\" in-view=\"inviewSpy(3, $inview, $inviewpart)\" style=\"height:100%\">three</div>");
      return it('should resend identical notification if inview item changed its position between debounces', function(done) {
        return test.scrollAndWaitInView(0, null, function() {
          return test.scrollAndWaitInView(window.innerHeight, null, function() {
            expect(test.scope.inviewSpy).toHaveBeenCalledWith(2, true, 'both');
            test.scope.inviewSpy = jasmine.createSpy('inviewSpy');
            test.scope.showSpacer = true;
            test.scope.$digest();
            return test.scrollAndWaitInView(window.innerHeight * 2, done, function() {
              return expect(test.scope.inviewSpy).toHaveBeenCalledWith(2, true, 'both');
            });
          });
        });
      });
    });
  });

  describe('Directive: inViewContainer', function() {
    var test;
    beforeEach(module('angular-inview'));
    test = createTestView("<div id=\"container1\" in-view-container style=\"height:100%\">\n	<div id=\"c1zero\" in-view=\"inviewSpy(10, $inview, $inviewpart)\" style=\"height:0\"></div>\n	<div id=\"c1one\" in-view=\"inviewSpy(11, $inview, $inviewpart)\" style=\"height:100%\">one</div>\n	<div id=\"c1two\" in-view=\"inviewSpy(12, $inview, $inviewpart)\" style=\"height:100%\">two</div>\n	<div id=\"container2\" in-view-container style=\"height:100%;overflow:scroll;\">\n		<div id=\"c2zero\" in-view=\"inviewSpy(20, $inview, $inviewpart)\" style=\"height:0\"></div>\n		<div id=\"c2one\" in-view=\"inviewSpy(21, $inview, $inviewpart)\" style=\"height:100%\">one</div>\n		<div id=\"c2two\" in-view=\"inviewSpy(22, $inview, $inviewpart)\" style=\"height:100%\">two</div>\n	</div>\n	<div id=\"c1three\" in-view=\"inviewSpy(13, $inview, $inviewpart)\" style=\"height:100%\">three</div>\n</div>", function() {
      return test.elem2 = test.elem.find('#container2');
    });
    it('should fire inview with windows scroll', function(done) {
      return test.scrollAndWaitInView(0, null, function() {
        return test.scrollAndWaitInView(window.innerHeight * 2, done, function() {
          expect(test.scope.inviewSpy.calls.count()).toEqual(6);
          expect(test.scope.inviewSpy).toHaveBeenCalledWith(20, true, 'both');
          return expect(test.scope.inviewSpy).toHaveBeenCalledWith(21, true, 'top');
        });
      });
    });
    return it('should trigger inview with container scroll for all nested children', function(done) {
      return test.scrollAndWaitInView(0, null, function() {
        return test.scrollAndWaitInView((function() {
          $(window).scrollTop(window.innerHeight * 2);
          return test.elem2.scrollTop(window.innerHeight);
        }), done, function() {
          expect(test.scope.inviewSpy.calls.count()).toEqual(6);
          expect(test.scope.inviewSpy).toHaveBeenCalledWith(21, true, 'bottom');
          return expect(test.scope.inviewSpy).toHaveBeenCalledWith(22, true, 'top');
        });
      });
    });
  });

  describe('Directive: inViewContainer in fixed containers', function() {
    var test;
    beforeEach(module('angular-inview'));
    test = createTestView("<div id=\"container\" in-view-container style=\"position:fixed;height:200px;overflow:scroll;\">\n	<div id=\"fzero\" in-view=\"inviewSpy(0, $inview, $inviewpart)\" style=\"height:0\"></div>\n	<div id=\"fone\" in-view=\"inviewSpy(1, $inview, $inviewpart)\" style=\"height:100%\">one</div>\n	<div id=\"ftwo\" in-view=\"inviewSpy(2, $inview, $inviewpart)\" style=\"height:100%\">two</div>\n</div>");
    return it('should properly handle fixed positioned containers', function(done) {
      return test.scrollAndWaitInView(0, null, function() {
        var containerHeight;
        containerHeight = 200;
        expect(test.scope.inviewSpy.calls.count()).toEqual(2);
        expect(test.scope.inviewSpy).toHaveBeenCalledWith(0, true, 'both');
        expect(test.scope.inviewSpy).toHaveBeenCalledWith(1, true, 'both');
        return test.scrollAndWaitInView((function() {
          return test.elem.scrollTop(containerHeight);
        }), done, function() {
          expect(test.scope.inviewSpy.calls.count()).toEqual(2 + 3);
          expect(test.scope.inviewSpy).toHaveBeenCalledWith(0, false, void 0);
          expect(test.scope.inviewSpy).toHaveBeenCalledWith(1, true, 'bottom');
          return expect(test.scope.inviewSpy).toHaveBeenCalledWith(2, true, 'both');
        });
      });
    });
  });

}).call(this);
