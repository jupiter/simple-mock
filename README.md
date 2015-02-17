# simple-mock ![Project status](https://secure.travis-ci.org/jupiter/node-simple-mock.png?branch=master)

Super simple stubs and spies with 1-step sandbox restore.

## Install

`npm install simple-mock`

(For the browser, expose the `index.js` found at the top level of this repository.)

## Mock

Not sure when to use a mock, stub, or spy? Just use `simple.mock`.

Examples:

```js
var simple = require('simple-mock');

simple.mock(obj, 'example', 'value'); // Replace with this value
simple.mock(obj, 'example', function() {}); // Replace with a spy on this function

simple.mock(obj, 'example') // Spy on underlying method *or* stub
simple.mock(obj, 'example').callbackWith(null, 'etc'); // Stub
simple.mock(obj, 'example').returnWith('etc'); // Stub
simple.mock(obj, 'example').throwWith(new Error()); // Stub
```

Then, to make sure all objects are back to the state the were in before your mocks:

```js
simple.restore(); // Ideally called in an afterEach() block
```

`callbackWith`, `returnWith` and `throwWith` can be chained for queued behaviour, e.g.

```js
simple.mock(Something.prototype, 'example')
  .callbackWith(null, 'etc')
  .callbackWith(new Error());
```

`callbackWith`, `returnWith` and `throwWith` configurations are stored on a simple array fn.actions

## Expectations

You define your expectations with *your own choice* of assertion library.

```js
assert(fn.called);
assert.equals(fn.callCount, 3);
assert.equals(fn.lastCall.args[0], error); // First parameter of the last call
assert.equals(fn.calls[0].returned, 'etc');
assert.equals(fn.calls[1].threw, error);
```

## Standalone Stubs and Spies

If you need to create a standalone stub (stubs are also spies):

```js
simple.stub().callback(null, 'etc');
simple.stub().returnWith('etc');
simple.stub().throwWith(new Error());
```

Or spy on a standalone function:

```js
var fn = simple.spy(function(){});

assert.equals(fn.callCount, 0);
assert.equals(fn.calls, []);
```

## API

For `var simple = require('simple-mock')`:

### simple.restore()

Restores all current mocks.

### simple.mock(obj, key, value)

Sets the value on this object. E.g. `mock(config, 'title', 'test')` is the same as `config.title = 'test'`, but restorable with all mocks.

### simple.mock(obj, key, fn)

Wraps `fn` in a spy and sets this on the `obj`, restorable with all mocks.

### simple.mock(obj, key)

If `obj` has already has this function, it is wrapped in a spy. The resulting spy can be turned into a stub by further configuration. Restores with all mocks.

### simple.spy(fn) *or* simple.mock(fn)

Wraps `fn` in a spy.

### simple.stub() *or* simple.mock()

Returns a stub function that is also a spy.

---

### spy.called

Boolean

### spy.callCount

Number of times the function was called.

### spy.calls

An array of calls, each having these properties:

- **call.args** an array of arguments received on this call
- **call.returned** the value returned by the wrapped function
- **call.threw** the error thrown by the wrapped function
- **call.k** autoincrementing number, can be compared to evaluate call order

### spy.lastCall

The last call object, with properties as above. (This is often also the first and only call.)

### spy.reset()

Resets all counts and properties to the original state.

---

### stub.returnWith(val)

Configures this stub to return with this value. Subsequent calls of this on the same stub (chainable) will queue up different behaviours for each subsequent call of the stub.

### stub.throwWith(err)

Configures this stub to throw this error. Subsequent calls of this on the same stub (chainable) will queue up different behaviours for each subsequent call of the stub.

### stub.callback(...) *or* stub.callbackAtIndex(cbArgumentIndex, ...)

Configures this stub to call back with the arguments passed. It will use either the last argument as callback, or the argument at `cbArgumentIndex`. Subsequent calls of this on the same stub (chainable) will queue up different behaviours for each subsequent call of the stub.

### stub.inThisContext(obj)

Configures the last configured callback to be called in this context, i.e. `this` will be `obj`.

### stub.actions

An array of behaviours, each having *one* of these properties:

- **action.cbArgs** arguments to call back with
- **action.returnValue**
- **action.throwError**

### stub.loop

Boolean (default: true) setting whether the queue of actions for this stub should repeat.

## Why

The most complete, framework-agnostic mocking library is [sinon.js](http://sinonjs.org/). It also has pages of documentation and lots of sugar-coating that we generally don't need. Keep it simple!
