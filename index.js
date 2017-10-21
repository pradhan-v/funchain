'use strict';
//
const Chain = function Chain (timeout, functionArray, callback) {
    if (!(this instanceof Chain)) {
        return new Chain(timeout, functionArray);
    }
    if (timeout) {
        this.setTimeout(timeout);
    }
    if (functionArray) {
        this.setFunctions(functionArray);
    }
    if (callback) {
        this.setCallback(callback);
    }
};
//
Chain.prototype.setTimeout = function (millis) {
    this._timeout = millis;
};
//
Chain.prototype.setFunctionArgs = function (args) {
    this._functionArgs = args;
};
//
Chain.prototype.setFunctions = function (functionArray) {
    this._functionArray = functionArray;
};
//
Chain.prototype.setCallback = function (callback) {
    this._callback = callback;
};
//
Chain.prototype.startCalls = function (...args) {
    if (args && args.length > 0) {
        this.setFunctionArgs(args);
    }
    return this._callFunctions(...[this._timeout, this._functionArray].concat(this._functionArgs));
};
//
// functionArguments will have the return value from the previous function call
// and the original function arguments which was set or passed to startCalls function.
Chain.prototype._callFunctions = function (timeout, functions, ...args) {
    // get arguments to the functiongs
    if (!functions || functions.length === 0) {
        // if there are no functions to invoke then callback
        if (this._callback) {
            this._callback.apply(this._callback, args);
        }
        return;
    }
    let retvalue = null;
    try {
        // invoke the function
        retvalue = functions[0].apply(functions[0], args);
    } catch (err) {
        if (this._callback) {
            this._callback.apply(this._callback, err);
        }
        return;
    }
    // remove the invoked function from the array
    const nextFunctions = functions.slice(1);
    // check if return value is another chain
    if (retvalue && retvalue instanceof Chain && retvalue._functionArray && retvalue._functionArray[0]) {
        // push the new chain's functions to the beginning of the original chain
        nextFunctions.unshift(...retvalue._functionArray);
        // replace function arguments
        if (retvalue._functionArgs) {
            retvalue = retvalue._functionArgs;
        } else {
            retvalue = args;
        }
    }
    // prepare arguments for the next function call
    let callargs = [timeout, nextFunctions];
    // add the return value of the previous function first
    if (retvalue) {
        callargs = callargs.concat(retvalue);
    }
    // then add original arguments
    if (this._functionArgs) {
        callargs = callargs.concat(this._functionArgs);
    }
    const that = this;
    if (timeout && timeout > 0) {
        setTimeout(() => {
            that._callFunctions(...callargs);
        }, timeout);
    } else {
        that._callFunctions(...callargs);
    }
};
//
module.exports = Chain;
