'use strict'
/*global describe beforeEach it before*/
var simple = require('./index')
var assert = require('assert')

describe('simple', function () {
  describe('spy()', function () {
    var originalFn
    var spyFn

    describe('for noop function', function () {
      beforeEach(function () {
        spyFn = simple.spy(function () {})
      })

      it('can be queried without having been called', function () {
        assert.equal(spyFn.callCount, 0)
        assert.deepEqual(spyFn.calls, [])
        assert(spyFn.lastCall)
        assert.deepEqual(spyFn.lastCall.args, [])
      })

      it('can be queried for arguments on a single call', function () {
        var context = {
          spyFn: spyFn
        }

        context.spyFn('with', 'args')

        assert(spyFn.called)
        assert.equal(spyFn.callCount, 1)
        assert(spyFn.calls)
        assert(spyFn.firstCall)
        assert.equal(spyFn.firstCall, spyFn.lastCall)
        assert.equal(spyFn.firstCall, spyFn.calls[0])
        assert.deepEqual(spyFn.lastCall.args, ['with', 'args'])
        assert.equal(spyFn.lastCall.context, context)
      })

      it('can be queried for arguments over multiple calls', function () {
        var context = {
          spyFn: spyFn
        }

        spyFn('with', 'args')
        spyFn('and')
        context.spyFn('more', 'args')

        assert(spyFn.called)
        assert.equal(spyFn.callCount, 3)
        assert(spyFn.calls)
        assert(spyFn.firstCall)
        assert.equal(spyFn.firstCall, spyFn.calls[0])
        assert.deepEqual(spyFn.firstCall.args, ['with', 'args'])
        assert(spyFn.calls[1])
        assert.deepEqual(spyFn.calls[1].args, ['and'])
        assert(spyFn.lastCall)
        assert.equal(spyFn.lastCall, spyFn.calls[2])
        assert.deepEqual(spyFn.lastCall.args, ['more', 'args'])
        assert.equal(spyFn.lastCall.context, context)
      })
    })

    describe('for a throwing function', function () {
      beforeEach(function () {
        var i = 0

        originalFn = function () {
          throw new Error(i++)
        }

        spyFn = simple.spy(originalFn)
      })

      it('can be queried without having been called', function () {
        assert(!spyFn.called)
        assert.equal(spyFn.callCount, 0)
        assert.deepEqual(spyFn.calls, [])
        assert(spyFn.lastCall)
        assert.equal(spyFn.lastCall.threw, undefined)
      })

      it('can be queried for what it threw on a single call', function () {
        var threw
        try {
          spyFn()
        } catch (e) {
          threw = e
        }

        assert(threw)
        assert(spyFn.called)
        assert.equal(spyFn.callCount, 1)
        assert(spyFn.firstCall)
        assert.equal(spyFn.firstCall.threw, threw)
      })

      it('can be queried for what it threw over multiple calls', function () {
        var threw = []
        try {
          spyFn()
        } catch (e) {
          threw.push(e)
        }
        try {
          spyFn()
        } catch (e) {
          threw.push(e)
        }
        try {
          spyFn()
        } catch (e) {
          threw.push(e)
        }

        assert.equal(threw.length, 3)
        assert(spyFn.called)
        assert.equal(spyFn.callCount, 3)
        assert(spyFn.firstCall)
        assert.equal(spyFn.firstCall.threw, threw[0])
        assert.equal(spyFn.calls[1].threw, threw[1])
        assert.equal(spyFn.lastCall.threw, threw[2])
      })
    })

    describe('for a returning function', function () {
      beforeEach(function () {
        var i = 1

        originalFn = function () {
          return i++
        }

        spyFn = simple.spy(originalFn)
      })

      it('can be queried without having been called', function () {
        assert(!spyFn.called)
        assert.equal(spyFn.callCount, 0)
        assert.deepEqual(spyFn.calls, [])
        assert(spyFn.lastCall)
        assert.equal(spyFn.lastCall.returned, undefined)
      })

      it('can be queried for what it threw on a single call', function () {
        var returned

        returned = spyFn()

        assert(returned)
        assert.equal(spyFn.callCount, 1)
        assert(spyFn.firstCall)
        assert.equal(spyFn.firstCall.returned, returned)
      })

      it('can be queried for what it threw over multiple calls', function () {
        var returned = []

        returned.push(spyFn())
        returned.push(spyFn())
        returned.push(spyFn())

        assert.equal(returned.length, 3)
        assert(spyFn.called)
        assert.equal(spyFn.callCount, 3)
        assert(spyFn.firstCall)
        assert.equal(spyFn.firstCall.returned, returned[0])
        assert.equal(spyFn.calls[1].returned, returned[1])
        assert.equal(spyFn.lastCall.returned, returned[2])
      })
    })

    describe('calls of multiple spies', function () {
      it('can be compared to determine the order they were called in', function () {
        var spy1 = simple.spy(function () {})
        var spy2 = simple.spy(function () {})
        var spy3 = simple.spy(function () {})

        spy1()
        spy3()
        spy2()
        spy1()

        assert(spy1.lastCall.k > spy2.lastCall.k)
        assert(spy1.lastCall.k > spy3.lastCall.k)
        assert(spy2.lastCall.k > spy3.lastCall.k)
        assert(spy3.lastCall.k > spy1.calls[0].k)
      })
    })
  })

  describe('stub()', function () {
    var stubFn

    describe('with no configuration', function () {
      it('is also a spy', function () {
        stubFn = simple.stub()

        stubFn('etc')
        assert(stubFn.called)
        assert(stubFn.lastCall.args[0], 'etc')
      })
    })

    describe('for a single callback configuration', function () {
      describe('with default index', function () {
        beforeEach(function () {
          stubFn = simple.stub().callbackWith(1, 2, 3)
        })

        it('can call back with arguments', function () {
          stubFn('a', function () {
            assert(stubFn.called)
            assert(stubFn.callCount, 1)
            assert.equal(stubFn.lastCall.args[0], 'a')
            assert.equal(arguments.length, 3)
            assert.equal(arguments[0], 1)
            assert.equal(arguments[1], 2)
            assert.equal(arguments[2], 3)
          })
        })

        it('can call back with arguments, over multiple calls', function () {
          stubFn('a', function () {})
          stubFn('b', function () {
            assert(stubFn.called)
            assert(stubFn.callCount, 2)
            assert.equal(stubFn.lastCall.args[0], 'b')
            assert.equal(arguments.length, 3)
            assert.equal(arguments[0], 1)
            assert.equal(arguments[1], 2)
            assert.equal(arguments[2], 3)
          })
        })
      })

      describe('with specified index', function () {
        beforeEach(function () {
          stubFn = simple.stub().callbackArgWith(1, 2, 3)
        })

        it('can call back with arguments', function () {
          stubFn('a', function () {
            assert(stubFn.called)
            assert(stubFn.callCount, 1)
            assert.equal(stubFn.lastCall.args[0], 'a')
            assert.equal(arguments.length, 2)
            assert.equal(arguments[0], 2)
            assert.equal(arguments[1], 3)
          })
        })

        it('can call back with arguments, over multiple calls', function () {
          stubFn('a', function () {})
          stubFn('b', function () {
            assert(stubFn.called)
            assert(stubFn.callCount, 2)
            assert.equal(stubFn.lastCall.args[0], 'b')
            assert.equal(arguments.length, 2)
            assert.equal(arguments[0], 2)
            assert.equal(arguments[1], 3)
          })
        })
      })

      describe('with context specified', function () {
        beforeEach(function () {
          stubFn = simple.stub().callback().inThisContext({ a: 'a' })
        })

        it('should do what...', function (done) {
          stubFn(function () {
            assert.equal(this.a, 'a')
            done()
          })
        })
      })
    })

    describe('for a multiple callback configurations', function () {
      beforeEach(function () {
        stubFn = simple.stub().callbackWith(1).callbackWith(2).callbackWith(3)
      })

      it('can call back once with arguments', function () {
        stubFn('a', function () {
          assert(stubFn.called)
          assert(stubFn.callCount, 1)
          assert.equal(stubFn.lastCall.args[0], 'a')
          assert.equal(arguments[0], 1)
        })
      })

      it('can call back with arguments, over multiple calls, looping per default', function () {
        stubFn('a', function () {})
        stubFn('b', function () {
          assert(stubFn.called)
          assert(stubFn.callCount, 2)
          assert.equal(stubFn.lastCall.args[0], 'b')
          assert.equal(arguments[0], 2)
        })
        stubFn('c', function () {
          assert(stubFn.called)
          assert(stubFn.callCount, 3)
          assert.equal(stubFn.lastCall.args[0], 'c')
          assert.equal(arguments[0], 3)
        })
        stubFn('d', function () {
          assert(stubFn.callCount, 4)
          assert.equal(stubFn.lastCall.args[0], 'd')
          assert.equal(arguments[0], 1)
        })
      })

      it('can call back with arguments, over multiple calls, looping turned off', function () {
        stubFn.loop = false
        stubFn('a', function () {})
        stubFn('b', function () {
          assert(stubFn.called)
          assert(stubFn.callCount, 2)
          assert.equal(stubFn.lastCall.args[0], 'b')
          assert.equal(arguments[0], 2)
        })
        stubFn('c', function () {
          assert(stubFn.called)
          assert(stubFn.callCount, 3)
          assert.equal(stubFn.lastCall.args[0], 'c')
          assert.equal(arguments[0], 3)
        })
        var neverCalled = true
        stubFn('d', function () {
          neverCalled = false
        })
        assert(neverCalled)
      })
    })

    describe('for a single throwing configuration', function () {
      beforeEach(function () {
        stubFn = simple.stub().throwWith(new Error('example'))
      })

      it('can throw', function () {
        var threw
        try {
          stubFn()
        } catch (e) {
          threw = e
        }

        assert(threw)
        assert(stubFn.called)
        assert.equal(stubFn.callCount, 1)
        assert.equal(threw.message, 'example')
      })

      it('can throw over multiple calls, looping per default', function () {
        var threw = []
        try {
          stubFn()
        } catch (e) {
          threw.push(e)
        }
        try {
          stubFn()
        } catch (e) {
          threw.push(e)
        }

        assert.equal(threw.length, 2)
        assert(stubFn.called)
        assert.equal(stubFn.callCount, 2)
        assert.equal(threw[0], threw[1])
        assert.equal(threw[0].message, 'example')
      })
    })

    describe('for a multiple throwing configurations', function () {
      beforeEach(function () {
        stubFn = simple.stub().throwWith(new Error('a')).throwWith(new Error('b'))
      })

      it('can throw', function () {
        var threw
        try {
          stubFn()
        } catch (e) {
          threw = e
        }

        assert(threw)
        assert(stubFn.called)
        assert.equal(stubFn.callCount, 1)
        assert.equal(threw.message, 'a')
      })

      it('can throw over multiple calls, looping per default', function () {
        var threw = []
        try {
          stubFn()
        } catch (e) {
          threw.push(e)
        }
        try {
          stubFn()
        } catch (e) {
          threw.push(e)
        }
        try {
          stubFn()
        } catch (e) {
          threw.push(e)
        }

        assert.equal(threw.length, 3)
        assert(stubFn.called)
        assert.equal(stubFn.callCount, 3)
        assert.equal(threw[0].message, 'a')
        assert.equal(threw[1].message, 'b')
        assert.equal(threw[2].message, 'a')
      })

      it('can throw over multiple calls, looping turned off', function () {
        stubFn.loop = false

        var threw = []
        try {
          stubFn()
        } catch (e) {
          threw.push(e)
        }
        try {
          stubFn()
        } catch (e) {
          threw.push(e)
        }
        try {
          stubFn()
        } catch (e) {
          threw.push(e)
        }

        assert.equal(threw.length, 2)
        assert(stubFn.called)
        assert.equal(stubFn.callCount, 3)
        assert.equal(threw[0].message, 'a')
        assert.equal(threw[1].message, 'b')
      })
    })

    describe('for a single returning configuration', function () {
      beforeEach(function () {
        stubFn = simple.stub().returnWith('example')
      })

      it('can return', function () {
        var returned
        returned = stubFn()

        assert(returned)
        assert.equal(stubFn.callCount, 1)
        assert.equal(returned, 'example')
      })

      it('can return over multiple calls, looping per default', function () {
        var returned = []
        returned.push(stubFn())
        returned.push(stubFn())

        assert.equal(returned.length, 2)
        assert(stubFn.called)
        assert.equal(stubFn.callCount, 2)
        assert.equal(returned[0], returned[1])
        assert.equal(returned[0], 'example')
      })
    })

    describe('for a multiple returning configurations', function () {
      beforeEach(function () {
        stubFn = simple.stub().returnWith('a').returnWith('b')
      })

      it('can return', function () {
        var returned
        returned = stubFn()

        assert(returned)
        assert.equal(stubFn.callCount, 1)
        assert.equal(returned, 'a')
      })

      it('can return over multiple calls, looping per default', function () {
        var returned = []
        returned.push(stubFn())
        returned.push(stubFn())
        returned.push(stubFn())

        assert.equal(returned.length, 3)
        assert(stubFn.called)
        assert.equal(stubFn.callCount, 3)
        assert.equal(returned[0], 'a')
        assert.equal(returned[1], 'b')
        assert.equal(returned[2], 'a')
      })

      it('can return over multiple calls, looping turned off', function () {
        stubFn.loop = false

        var returned = []
        returned.push(stubFn())
        returned.push(stubFn())
        returned.push(stubFn())

        assert.equal(returned.length, 3)
        assert(stubFn.called)
        assert.equal(stubFn.callCount, 3)
        assert.equal(returned[0], 'a')
        assert.equal(returned[1], 'b')
        assert.equal(returned[2], undefined)
      })
    })

    describe('for a specified function to call', function () {
      it('should be called with arguments and return', function () {
        var stubFn = simple.stub().callFn(function () {
          return arguments
        })

        var returned = stubFn('z', 'x')

        assert.equal(stubFn.callCount, 1)
        assert.equal(returned[0], 'z')
        assert.equal(returned[1], 'x')
      })

      it('should be able to throw', function () {
        var stubFn = simple.stub().callFn(function () {
          throw new Error('my message')
        })

        try {
          stubFn()
        } catch(e) {
          assert(e instanceof Error)
          assert.equal(e.message, 'my message')
        }
      })

      it('should be called in context', function () {
        var mockObj = {
          stubFn: simple.stub().callFn(function () {
            return this
          })
        }

        var returned = mockObj.stubFn()

        assert.equal(returned, mockObj)
      })

      it('can be called in specified context', function () {
        var anotherMockObj = {}

        var mockObj = {
          stubFn: simple.stub().callFn(function () {
            return this
          }).inThisContext(anotherMockObj)
        }

        var returned = mockObj.stubFn()

        assert.equal(returned, anotherMockObj)
      })
    })

    describe('for custom/when-conforming promises', function () {
      var fulfilledStub
      var rejectedStub

      beforeEach(function () {
        fulfilledStub = simple.stub().returnWith(true)
        rejectedStub = simple.stub().returnWith(true)

        var mockPromise = {
          resolveValue: null,
          rejectValue: null,
          then: function (fulfilledFn, rejectedFn) {
            var self = this
            process.nextTick(function () {
              if (self.resolveValue) return fulfilledFn(self.resolveValue)
              if (self.rejectValue) return rejectedFn(self.rejectValue)
            })
          }
        }

        simple.mock(simple, 'Promise', {
          when: function (value) {
            var promise = Object.create(mockPromise)
            promise.resolveValue = value
            return promise
          },
          reject: function (value) {
            var promise = Object.create(mockPromise)
            promise.rejectValue = value
            return promise
          }
        })
      })

      describe('with a single resolving configuration', function () {
        beforeEach(function () {
          stubFn = simple.stub().resolveWith('example')
        })

        it('can return a promise', function (done) {
          var returned = stubFn()

          assert(returned)

          returned.then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 1)
            assert.equal(fulfilledStub.lastCall.arg, 'example')
            assert.equal(rejectedStub.callCount, 0)
            done()
          }, 0)
        })
      })

      describe('with a multiple resolving configurations', function () {
        beforeEach(function () {
          stubFn = simple.stub().resolveWith('a').resolveWith('b')
        })

        it('can return a promise', function (done) {
          var returned = stubFn()

          assert(returned)

          returned.then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 1)
            assert.equal(fulfilledStub.lastCall.arg, 'a')
            assert.equal(rejectedStub.callCount, 0)
            done()
          }, 0)
        })

        it('can return over multiple calls, looping per default', function (done) {
          stubFn().then(fulfilledStub, rejectedStub)
          stubFn().then(fulfilledStub, rejectedStub)
          stubFn().then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 3)
            assert.equal(fulfilledStub.calls[0].arg, 'a')
            assert.equal(fulfilledStub.calls[1].arg, 'b')
            assert.equal(fulfilledStub.calls[2].arg, 'a')
            assert.equal(rejectedStub.callCount, 0)
            done()
          }, 0)
        })
      })

      describe('with a single rejecting configuration', function () {
        beforeEach(function () {
          stubFn = simple.stub().rejectWith('example')
        })

        it('can return a promise', function (done) {
          var returned = stubFn()

          assert(returned)

          returned.then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 0)
            assert.equal(rejectedStub.callCount, 1)
            assert.equal(rejectedStub.lastCall.arg, 'example')
            done()
          }, 0)
        })
      })

      describe('with a multiple rejecting configurations', function () {
        beforeEach(function () {
          stubFn = simple.stub().rejectWith('a').rejectWith('b')
        })

        it('can return a promise', function (done) {
          var returned = stubFn()

          assert(returned)

          returned.then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 0)
            assert.equal(rejectedStub.callCount, 1)
            assert.equal(rejectedStub.lastCall.arg, 'a')
            done()
          }, 0)
        })

        it('can return over multiple calls, looping per default', function (done) {
          stubFn().then(fulfilledStub, rejectedStub)
          stubFn().then(fulfilledStub, rejectedStub)
          stubFn().then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 0)
            assert.equal(rejectedStub.callCount, 3)
            assert.equal(rejectedStub.calls[0].arg, 'a')
            assert.equal(rejectedStub.calls[1].arg, 'b')
            assert.equal(rejectedStub.calls[2].arg, 'a')
            done()
          }, 0)
        })
      })
    })

    if (typeof Promise === 'undefined') return // Skip on unsupported platforms

    describe('for native/conforming promises', function () {
      var fulfilledStub
      var rejectedStub

      beforeEach(function () {
        fulfilledStub = simple.stub().returnWith(true)
        rejectedStub = simple.stub().returnWith(true)
      })

      describe('with a single resolving configuration', function () {
        beforeEach(function () {
          stubFn = simple.stub().resolveWith('example')
        })

        it('can return a promise', function (done) {
          var returned = stubFn()

          assert(returned)

          returned.then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 1)
            assert.equal(fulfilledStub.lastCall.arg, 'example')
            assert.equal(rejectedStub.callCount, 0)
            done()
          }, 0)
        })
      })

      describe('with a multiple resolving configurations', function () {
        beforeEach(function () {
          stubFn = simple.stub().resolveWith('a').resolveWith('b')
        })

        it('can return a promise', function (done) {
          var returned = stubFn()

          assert(returned)

          returned.then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 1)
            assert.equal(fulfilledStub.lastCall.arg, 'a')
            assert.equal(rejectedStub.callCount, 0)
            done()
          }, 0)
        })

        it('can return over multiple calls, looping per default', function (done) {
          stubFn().then(fulfilledStub, rejectedStub)
          stubFn().then(fulfilledStub, rejectedStub)
          stubFn().then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 3)
            assert.equal(fulfilledStub.calls[0].arg, 'a')
            assert.equal(fulfilledStub.calls[1].arg, 'b')
            assert.equal(fulfilledStub.calls[2].arg, 'a')
            assert.equal(rejectedStub.callCount, 0)
            done()
          }, 0)
        })
      })

      describe('with a single rejecting configuration', function () {
        beforeEach(function () {
          stubFn = simple.stub().rejectWith('example')
        })

        it('can return a promise', function (done) {
          var returned = stubFn()

          assert(returned)

          returned.then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 0)
            assert.equal(rejectedStub.callCount, 1)
            assert.equal(rejectedStub.lastCall.arg, 'example')
            done()
          }, 0)
        })
      })

      describe('with a multiple rejecting configurations', function () {
        beforeEach(function () {
          stubFn = simple.stub().rejectWith('a').rejectWith('b')
        })

        it('can return a promise', function (done) {
          var returned = stubFn()

          assert(returned)

          returned.then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 0)
            assert.equal(rejectedStub.callCount, 1)
            assert.equal(rejectedStub.lastCall.arg, 'a')
            done()
          }, 0)
        })

        it('can return over multiple calls, looping per default', function (done) {
          stubFn().then(fulfilledStub, rejectedStub)
          stubFn().then(fulfilledStub, rejectedStub)
          stubFn().then(fulfilledStub, rejectedStub)

          setTimeout(function () {
            assert.equal(fulfilledStub.callCount, 0)
            assert.equal(rejectedStub.callCount, 3)
            assert.equal(rejectedStub.calls[0].arg, 'a')
            assert.equal(rejectedStub.calls[1].arg, 'b')
            assert.equal(rejectedStub.calls[2].arg, 'a')
            done()
          }, 0)
        })
      })
    })
  })

  describe('mock()', function () {
    var obj

    describe('on a object with prototype', function () {
      var ProtoKlass

      before(function () {
        ProtoKlass = function ProtoKlass () {}
        ProtoKlass.prototype.protoValue = 'x'
        ProtoKlass.prototype.protoFn = function () {
          return 'x'
        }
      })

      beforeEach(function () {
        obj = new ProtoKlass()
      })

      it('can mock instance values over its prototype\'s and restore', function () {
        simple.mock(obj, 'protoValue', 'y')
        assert.equal(obj.protoValue, 'y')
        simple.restore()
        assert.equal(obj.protoValue, 'x')
      })

      it('can mock with custom instance functions over its prototype\'s and restore', function () {
        simple.mock(obj, 'protoFn', function () {
          return 'y'
        })
        assert.equal(obj.protoFn(), 'y')
        assert(obj.protoFn.called)
        simple.restore()
        assert.equal(obj.protoFn(), 'x')
      })

      it('can mock with stubbed functions over its prototype\'s and restore', function () {
        simple.mock(obj, 'protoFn').returnWith('y')
        assert.equal(obj.protoFn(), 'y')
        assert(obj.protoFn.called)
        simple.restore()
        assert.equal(obj.protoFn(), 'x')
      })
    })

    describe('on an anonymous object', function () {
      beforeEach(function () {
        obj = {
          a: 'a',
          b: 'b',
          c: 'c',
          fnD: function () {
            return 'd'
          }
        }
      })

      it('can mock instance values and restore', function () {
        var beforeKeys = Object.keys(obj)
        simple.mock(obj, 'a', 'd')
        simple.mock(obj, 'd', 'a')
        assert.equal(obj.a, 'd')
        assert.equal(obj.d, 'a')
        simple.restore()
        assert.equal(obj.a, 'a')
        assert.equal(obj.d, undefined)
        assert.deepEqual(Object.keys(obj), beforeKeys)
      })

      it('can mock with spy on pre-existing functions and restore', function () {
        simple.mock(obj, 'fnD').returnWith('a')
        assert.equal(obj.fnD(), 'a')
        assert(obj.fnD.called)
        simple.restore()
        assert.equal(obj.fnD(), 'd')
      })

      it('can mock with newly stubbed functions and restore', function () {
        simple.mock(obj, 'fnA').returnWith('a')
        assert.equal(obj.fnA(), 'a')
        assert(obj.fnA.called)
        simple.restore()
        assert.equal(obj.fnA, undefined)
      })
    })

    describe('with one argument', function () {
      it('returns a spy', function () {
        var called = 0

        var spy = simple.mock(function () {
          called++
        })

        spy()
        assert(called, 1)
        assert(spy.called)
      })
    })

    describe('with no arguments', function () {
      it('returns a stub', function () {
        var stub = simple.mock().returnWith('x')

        var x = stub()
        assert(stub.called)
        assert(x, 'x')
      })
    })
  })
})
