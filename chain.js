'use strict';
//
const Chain = function Chain (functionArray, callback) {
    if (functionArray) {
        this.setFunctions(functionArray);
    }
    if (callback) {
        this.setCallback(callback);
    }
};
//
Chain.prototype.setDelay = function (millis) {
    this._delay = millis;
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
    return this._callFunctions(...[this._delay, this._functionArray].concat(this._functionArgs));
};
//
// functionArguments will have the return value from the previous function call
// and the original function arguments which was set or passed to startCalls function.
Chain.prototype._callFunctions = function (delay, functions, ...args) {
    // the last argument will be the return value
    const [previousResult] = args.slice(-1);
    if (!functions || functions.length === 0) {
        // if there are no functions to invoke then callback
        if (this._callback) {
            this._callback(previousResult);
        }
        return;
    }
    let fnReturnValue = null;
    try {
        // invoke the function
        fnReturnValue = functions[0].apply(functions[0], args);
    } catch (err) {
        if (this._callback) {
            this._callback(err);
        }
        return;
    }
    // remove the invoked function from the array
    const nextFunctions = functions.slice(1);
    // check if return value is another chain
    if (fnReturnValue && fnReturnValue instanceof Chain && fnReturnValue._functionArray &&
            fnReturnValue._functionArray[0]) {
        // push the new chain's functions to the beginning of the original chain
        nextFunctions.unshift(...fnReturnValue._functionArray);
        // replace function arguments
        if (fnReturnValue._functionArgs && fnReturnValue._functionArgs !== null &&
                fnReturnValue._functionArgs.length > 0) {
            fnReturnValue = fnReturnValue._functionArgs;
        } else {
            // [retvalue] = args;
            fnReturnValue = previousResult;
        }
    }
    // prepare arguments for the next function call
    let callargs = [delay, nextFunctions];
    // add original arguments
    if (this._functionArgs) {
        callargs = callargs.concat(this._functionArgs);
    }
    // then add the return value of the previous function.
    callargs = callargs.concat(fnReturnValue);
    // callargs, the parameters for the next function will have
    // return value if previous function, original args
    const that = this;
    if (delay && delay > 0) {
        setTimeout(() => {
            that._callFunctions(...callargs);
        }, delay);
    } else {
        // TODO: fix stackoverflow
        that._callFunctions(...callargs);
    }
};
//
const create = function (functionArray, callback, ...args) {
    const fchain = new Chain(functionArray, callback);
    fchain.setFunctionArgs(args);
    return fchain;
};
const createWithDelay = function (delay, functionArray, callback, ...args) {
    const fchain = create(functionArray, callback, ...args);
    fchain.setDelay(delay);
    return fchain;
};
//
module.exports = {
    create,
    createWithDelay
};
