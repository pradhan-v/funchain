'use strict';
//
const chain = require('./chain');
//
const repeatFunction = function (actualFunction, continueCallback, ...args) {
    let result = null;
    try {
        result = actualFunction(...args);
    } catch (err) {
        if (continueCallback) {
            // TODO: use the callback and decide to stop.
            continueCallback(err, result);
        }
    }
    let repeat = false;
    if (continueCallback) {
        repeat = continueCallback(null, result);
    }
    if (repeat) {
        const fcc = chain.create();
        fcc.setFunctions([repeatFunction]);
        // args.unshift(actualFunction);
        // fcc.setFunctionArgs([actualFunction, continueCallback, resultCallback].concat(result));
        fcc.setFunctionArgs([result]);
        return fcc;
    }
    return result;
};
//
const createRepeatFunctionChain = function (actualFunction, continueCallback, resultCallback, ...args) {
    const fchain = chain.create(
        -1, [repeatFunction], resultCallback,
        actualFunction, continueCallback, ...args
    );
    return fchain;
};
//
module.exports = {
    'create': chain.create,
    createRepeatFunctionChain,
    repeatFunction
};
