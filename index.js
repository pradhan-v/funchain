'use strict';
//
const chain = require('./chain');
//
const repeatFunction = function (actualFunction, continueCallback, ...args) {
    // set result to the previous result
    let [result] = args.slice(-1);
    let repeat = false;
    let error = null;
    try {
        result = actualFunction(...args);
    } catch (err) {
        error = err;
    }
    if (continueCallback) {
        repeat = continueCallback(error, result);
    }
    if (repeat) {
        const fcc = chain.create();
        fcc.setFunctions([repeatFunction]);
        fcc.setFunctionArgs([result]);
        return fcc;
    }
    return result;
};
//
const createRepeatFunctionChain = function (actualFunction, continueCallback, resultCallback, ...args) {
    const fchain = chain.create([repeatFunction], resultCallback, actualFunction, continueCallback, ...args);
    return fchain;
};
//
module.exports = {
    'create': chain.create,
    'createWithDelay': chain.createWithDelay,
    createRepeatFunctionChain,
    repeatFunction
};
