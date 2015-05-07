(function (global, module) { // Browser compatibility
  var simple = module.exports
  var mocks = []
  var totalCalls = 0

  /**
   * Restore the current simple and create a new one
   *
   * @api public
   */
  simple.restore = function () {
    mocks.forEach(_restoreMock)
    mocks = []
  }

  /**
   * Create a mocked value on an object
   *
   * @param {Object} obj
   * @param {String} key
   * @param {Function|Value} mockValue
   * @return {Function} mock
   * @api public
   */
  simple.mock = function (obj, key, mockValue) {
    if (!arguments.length) {
      return simple.spyOrStub()
    } else if (arguments.length === 1) {
      mockValue = key
      key = wrappedRequireFnCache.indexOf(obj)
      if (!~key) return simple.spyOrStub(obj)
      obj = unwrappedRequireFnCache
      if (!mockValue) mockValue = simple.spyOrStub(obj, key)
      else mockValue = simple.spyOrStub(mockValue)
    } else if (isFunction(mockValue)) {
      mockValue = simple.spyOrStub(mockValue)
    } else if (arguments.length === 2) {
      mockValue = simple.spyOrStub(obj, key)
    }

    var mock = {
      obj: obj,
      key: key,
      mockValue: mockValue,
      oldValue: obj[key],
      oldValueHasKey: (key in obj)
    }

    mock.restore = _restoreMock.bind(null, mock)
    mocks.push(mock)

    obj[key] = mockValue
    return mockValue
  }

  /**
   * Create a stub function
   *
   * @param {Function|Object} wrappedFn
   * @param {String} [key]
   * @return {Function} spy
   * @api public
   */
  simple.spyOrStub = simple.stub = simple.spy = function (wrappedFn, key) {
    if (arguments.length === 2) {
      wrappedFn = wrappedFn[key]
    }

    var stubFn = function () {
      var action = (newFn.loop) ? newFn.actions[(newFn.callCount - 1) % newFn.actions.length] : newFn.actions.shift()

      if (!action) return
      if (action.throwError) throw action.throwError
      if (action.returnValue) return action.returnValue

      var cb = ('cbArgIndex' in action) ? arguments[action.cbArgIndex] : arguments[arguments.length - 1]
      if (action.cbArgs) return cb.apply(action.cbContext || null, action.cbArgs)
    }

    var newFn = function () {
      var call = {
        k: totalCalls++, // Keep count of calls to record the absolute order of calls
        args: Array.prototype.slice.call(arguments, 0),
        arg: arguments[0],
        context: this
      }
      newFn.calls.push(call)
      newFn.firstCall = newFn.firstCall || call
      newFn.lastCall = call
      newFn.callCount++
      newFn.called = true

      try {
        call.returned = (wrappedFn || _noop).apply(this, arguments)
      } catch(e) {
        call.threw = e
        throw e
      }
      return call.returned
    }

    // Spy
    newFn.reset = function () {
      newFn.calls = []
      newFn.lastCall = { args: [] } // For dot-safety
      newFn.callCount = 0
      newFn.called = false
    }
    newFn.reset()

    // Stub
    newFn.actions = []
    newFn.loop = true

    newFn.callbackWith = newFn.callback = function () {
      wrappedFn = stubFn
      newFn.actions.push({ cbArgs: arguments })
      return newFn // Chainable
    }

    newFn.callbackArgWith = newFn.callbackAtIndex = function () {
      wrappedFn = stubFn
      newFn.actions.push({
        cbArgs: Array.prototype.slice.call(arguments, 1),
        cbArgIndex: arguments[0]
      })
      return newFn // Chainable
    }

    newFn.inThisContext = function (obj) {
      var action = newFn.actions[newFn.actions.length - 1]
      action.cbContext = obj
      return newFn // Chainable
    }

    newFn.withArgs = function () {
      var action = newFn.actions[newFn.actions.length - 1]
      action.cbArgs = arguments
      return newFn // Chainable
    }

    newFn.returnWith = function (returnValue) {
      wrappedFn = stubFn
      newFn.actions.push({ returnValue: returnValue })
      return newFn // Chainable
    }

    newFn.throwWith = function (err) {
      wrappedFn = stubFn
      newFn.actions.push({ throwError: err })
      return newFn // Chainable
    }

    newFn.resolveWith = function (value) {
      if (simple.Promise.when) return newFn.returnWith(simple.Promise.when(value))
      return newFn.returnWith(simple.Promise.resolve(value))
    }

    newFn.rejectWith = function (value) {
      return newFn.returnWith(simple.Promise.reject(value))
    }
    return newFn
  }

  var originalModuleLoad

  simple.overload = function () {
    if (originalModuleLoad) return

    // Object.keys(require.cache).forEach(function (key) {
    //   if (key === module.id) return;
    //   delete require.cache[key]
    // })

    var Module = require('module').Module;
    originalModuleLoad = Module._load

    Module._load = function () {
      var returned = originalModuleLoad.apply(this, arguments)
      if (!isFunction(returned)) return returned

      var indexOfWrappedRequireFn = unwrappedRequireFnCache.indexOf(returned)
      if (~indexOfWrappedRequireFn) return wrappedRequireFnCache[indexOfWrappedRequireFn]

      function WrappedRequireFn() {
        return unwrappedRequireFnCache[indexOfWrappedRequireFn].apply(arguments)
      }

      console.log(WrappedRequireFn.__proto__)
      WrappedRequireFn.__proto__ = returned
      WrappedRequireFn.prototype = returned.prototype

      unwrappedRequireFnCache.push(returned)
      wrappedRequireFnCache.push(WrappedRequireFn)
      indexOfWrappedRequireFn = wrappedRequireFnCache.length - 1

      return WrappedRequireFn
    }
  }

  var wrappedRequireFnCache = [];
  var unwrappedRequireFnCache = [];

  function _restoreMock (mock) {
    if (!mock.oldValueHasKey) {
      delete mock.obj[mock.key]
      return
    }
    mock.obj[mock.key] = mock.oldValue
  }

  function _noop () {}

  /**
   * Return whether the passed variable is a function
   *
   * @param {Mixed} value
   * @return {Boolean}
   * @api private
   */
  function isFunction (value) {
    return Object.prototype.toString.call(value) === funcClass
  }
  var funcClass = '[object Function]'

  // Browser compatibility
  if (typeof window !== 'undefined') {
    window.simple = simple
  }

  // Native Promise support
  if (typeof Promise !== 'undefined') simple.Promise = Promise
})(this, typeof module !== 'undefined' ? module : {exports: {}})
