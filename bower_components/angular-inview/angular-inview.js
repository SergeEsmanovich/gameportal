(function() {
  'use strict';
  var addWindowInViewItem, bindWindowEvents, checkInView, debounce, getBoundingClientRect, getViewportHeight, removeWindowInViewItem, trackInViewContainer, triggerInViewCallback, unbindWindowEvents, untrackInViewContainer, windowCheckInView, windowEventsHandler, _containersControllers, _windowEventsHandlerBinded, _windowInViewItems,
    __slice = [].slice;

  angular.module('angular-inview', []).directive('inView', [
    '$parse', function($parse) {
      return {
        restrict: 'A',
        require: '?^inViewContainer',
        link: function(scope, element, attrs, containerController) {
          var inViewFunc, item, options, performCheck, _ref, _ref1;
          if (!attrs.inView) {
            return;
          }
          inViewFunc = $parse(attrs.inView);
          item = {
            element: element,
            wasInView: false,
            offset: 0,
            customDebouncedCheck: null,
            callback: function($event, $inview, $inviewpart) {
              if ($event == null) {
                $event = {};
              }
              return scope.$apply((function(_this) {
                return function() {
                  $event.inViewTarget = element[0];
                  return inViewFunc(scope, {
                    '$event': $event,
                    '$inview': $inview,
                    '$inviewpart': $inviewpart
                  });
                };
              })(this));
            }
          };
          if ((attrs.inViewOptions != null) && (options = scope.$eval(attrs.inViewOptions))) {
            item.offset = options.offset || [options.offsetTop || 0, options.offsetBottom || 0];
            if (options.debounce) {
              item.customDebouncedCheck = debounce((function(event) {
                return checkInView([item], element[0], event);
              }), options.debounce);
            }
          }
          performCheck = (_ref = (_ref1 = item.customDebouncedCheck) != null ? _ref1 : containerController != null ? containerController.checkInView : void 0) != null ? _ref : windowCheckInView;
          if (containerController != null) {
            containerController.addItem(item);
          } else {
            addWindowInViewItem(item);
          }
          setTimeout(performCheck);
          return scope.$on('$destroy', function() {
            if (containerController != null) {
              containerController.removeItem(item);
            }
            return removeWindowInViewItem(item);
          });
        }
      };
    }
  ]).directive('inViewContainer', function() {
    return {
      restrict: 'AC',
      controller: [
        '$element', function($element) {
          this.items = [];
          this.addItem = function(item) {
            return this.items.push(item);
          };
          this.removeItem = function(item) {
            var i;
            return this.items = (function() {
              var _i, _len, _ref, _results;
              _ref = this.items;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                i = _ref[_i];
                if (i !== item) {
                  _results.push(i);
                }
              }
              return _results;
            }).call(this);
          };
          this.checkInView = (function(_this) {
            return function(event) {
              var i, _i, _len, _ref;
              _ref = _this.items;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                i = _ref[_i];
                if (i.customDebouncedCheck != null) {
                  i.customDebouncedCheck();
                }
              }
              return checkInView((function() {
                var _j, _len1, _ref1, _results;
                _ref1 = this.items;
                _results = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  i = _ref1[_j];
                  if (i.customDebouncedCheck == null) {
                    _results.push(i);
                  }
                }
                return _results;
              }).call(_this), $element[0], event);
            };
          })(this);
          return this;
        }
      ],
      link: function(scope, element, attrs, controller) {
        element.bind('scroll', controller.checkInView);
        trackInViewContainer(controller);
        return scope.$on('$destroy', function() {
          element.unbind('scroll', controller.checkInView);
          return untrackInViewContainer(controller);
        });
      }
    };
  });

  _windowInViewItems = [];

  addWindowInViewItem = function(item) {
    _windowInViewItems.push(item);
    return bindWindowEvents();
  };

  removeWindowInViewItem = function(item) {
    var i;
    _windowInViewItems = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = _windowInViewItems.length; _i < _len; _i++) {
        i = _windowInViewItems[_i];
        if (i !== item) {
          _results.push(i);
        }
      }
      return _results;
    })();
    return unbindWindowEvents();
  };

  _containersControllers = [];

  trackInViewContainer = function(controller) {
    _containersControllers.push(controller);
    return bindWindowEvents();
  };

  untrackInViewContainer = function(container) {
    var c;
    _containersControllers = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = _containersControllers.length; _i < _len; _i++) {
        c = _containersControllers[_i];
        if (c !== container) {
          _results.push(c);
        }
      }
      return _results;
    })();
    return unbindWindowEvents();
  };

  _windowEventsHandlerBinded = false;

  windowEventsHandler = function(event) {
    var c, _i, _len;
    for (_i = 0, _len = _containersControllers.length; _i < _len; _i++) {
      c = _containersControllers[_i];
      c.checkInView(event);
    }
    if (_windowInViewItems.length) {
      return windowCheckInView(event);
    }
  };

  bindWindowEvents = function() {
    if (_windowEventsHandlerBinded) {
      return;
    }
    _windowEventsHandlerBinded = true;
    return angular.element(window).bind('checkInView click ready scroll resize', windowEventsHandler);
  };

  unbindWindowEvents = function() {
    if (!_windowEventsHandlerBinded) {
      return;
    }
    if (_windowInViewItems.length || _containersControllers.length) {
      return;
    }
    _windowEventsHandlerBinded = false;
    return angular.element(window).unbind('checkInView click ready scroll resize', windowEventsHandler);
  };

  triggerInViewCallback = function(event, item, inview, isTopVisible, isBottomVisible) {
    var elOffsetTop, inviewpart;
    if (inview) {
      elOffsetTop = getBoundingClientRect(item.element[0]).top + window.pageYOffset;
      inviewpart = (isTopVisible && 'top') || (isBottomVisible && 'bottom') || 'both';
      if (!(item.wasInView && item.wasInView === inviewpart && elOffsetTop === item.lastOffsetTop)) {
        item.lastOffsetTop = elOffsetTop;
        item.wasInView = inviewpart;
        return item.callback(event, true, inviewpart);
      }
    } else if (item.wasInView) {
      item.wasInView = false;
      return item.callback(event, false);
    }
  };

  checkInView = function(items, container, event) {
    var bounds, boundsBottom, boundsTop, element, item, viewport, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;
    viewport = {
      top: 0,
      bottom: getViewportHeight()
    };
    if (container && container !== window) {
      bounds = getBoundingClientRect(container);
      if (bounds.top > viewport.bottom || bounds.bottom < viewport.top) {
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          triggerInViewCallback(event, item, false);
        }
        return;
      }
      if (bounds.top > viewport.top) {
        viewport.top = bounds.top;
      }
      if (bounds.bottom < viewport.bottom) {
        viewport.bottom = bounds.bottom;
      }
    }
    _results = [];
    for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
      item = items[_j];
      element = item.element[0];
      bounds = getBoundingClientRect(element);
      boundsTop = bounds.top + parseInt((_ref = (_ref1 = item.offset) != null ? _ref1[0] : void 0) != null ? _ref : item.offset);
      boundsBottom = bounds.bottom + parseInt((_ref2 = (_ref3 = item.offset) != null ? _ref3[1] : void 0) != null ? _ref2 : item.offset);
      if (boundsTop < viewport.bottom && boundsBottom >= viewport.top) {
        _results.push(triggerInViewCallback(event, item, true, boundsBottom > viewport.bottom, boundsTop < viewport.top));
      } else {
        _results.push(triggerInViewCallback(event, item, false));
      }
    }
    return _results;
  };

  getViewportHeight = function() {
    var height, mode, _ref;
    height = window.innerHeight;
    if (height) {
      return height;
    }
    mode = document.compatMode;
    if (mode || !(typeof $ !== "undefined" && $ !== null ? (_ref = $.support) != null ? _ref.boxModel : void 0 : void 0)) {
      height = mode === 'CSS1Compat' ? document.documentElement.clientHeight : document.body.clientHeight;
    }
    return height;
  };

  getBoundingClientRect = function(element) {
    var el, parent, top;
    if (element.getBoundingClientRect != null) {
      return element.getBoundingClientRect();
    }
    top = 0;
    el = element;
    while (el) {
      top += el.offsetTop;
      el = el.offsetParent;
    }
    parent = element.parentElement;
    while (parent) {
      if (parent.scrollTop != null) {
        top -= parent.scrollTop;
      }
      parent = parent.parentElement;
    }
    return {
      top: top,
      bottom: top + element.offsetHeight
    };
  };

  debounce = function(f, t) {
    var timer;
    timer = null;
    return function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (timer != null) {
        clearTimeout(timer);
      }
      return timer = setTimeout((function() {
        return f.apply(null, args);
      }), t != null ? t : 100);
    };
  };

  windowCheckInView = function(event) {
    var i, _i, _len;
    for (_i = 0, _len = _windowInViewItems.length; _i < _len; _i++) {
      i = _windowInViewItems[_i];
      if (i.customDebouncedCheck != null) {
        i.customDebouncedCheck();
      }
    }
    return checkInView((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = _windowInViewItems.length; _j < _len1; _j++) {
        i = _windowInViewItems[_j];
        if (i.customDebouncedCheck == null) {
          _results.push(i);
        }
      }
      return _results;
    })(), null, event);
  };

}).call(this);
