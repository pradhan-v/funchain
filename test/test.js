'use strict';
const {expect} = require('chai');
const mocha = require('mocha');
const {describe} = mocha;
const {it} = mocha;
const chain = require('../index');
const delay = 10;
//
const addOne = (num) => num + 1;
// appends a new character to the string. the char code of this new charater is
// 1+char code of the last character in the string (for abc, we get abcd, c+1)
const addNextChar = (str) => str + String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
const addOneWrap = (num, result) => {
    if (result) {
        return addOne(result);
    }
    return addOne(num);
};
const addNextCharWrap = (str, result) => {
    if (result) {
        return addNextChar(result);
    }
    return addNextChar(str);
};
const noReturnValue = (obj) => obj.value++;
const globalObject = {'value': 0};
const noReturnValueNoArgs = () => {
    globalObject.value++;
};
//
/* eslint no-invalid-this: 0 */
/* eslint no-undefined: 0 */
// returns an array [functionArray, callback], this is passed to the create chain function
const getCreateArgs = function (done, fdelay, args) {
    let createargs = [];
    if (fdelay) {
        createargs.push(fdelay);
    } /* else if (this._functionArray) {
        createargs.push(undefined);
    }*/
    // dont add undefined for missing delay.
    // this method is called by create chain without delay too.
    if (this._functionArray) {
        createargs.push(this._functionArray);
    } else if (!this.noCallback) {
        createargs.push(undefined);
    }
    if (!this.noCallback) {
        createargs.push((finalVal) => {
            expect(this.expected).to.equal(finalVal);
            done();
        });
    } else if (args) {
        createargs.push(undefined);
        createargs.push(undefined);
    }
    if (args) {
        // createargs.push(...args);
        createargs = createargs.concat(args);
    }
    return createargs;
};
const ERROR = new Error('Some Error');
// TODO: add destructive test case.. send non-functions in the function array (string, int...)
const tests = [
    {
        'description': 'empty arguments',
        'noCallback': true
    }, {
        'description': 'empty array, no callback',
        'noCallback': true,
        '_functionArray': [],
        getCreateArgs
    }, {
        'description': 'simple order check',
        '_functionArray': [addNextCharWrap, addNextCharWrap, addNextCharWrap],
        getCreateArgs,
        'expected': 'abcd',
        'functionArgs': ['a']
    }, {
        'description': 'function has error',
        '_functionArray': [
            addNextCharWrap, () => {
                throw ERROR;
            }, addNextCharWrap
        ],
        getCreateArgs,
        'expected': ERROR,
        'functionArgs': ['a']
    }, {
        'description': 'function has error, no callback',
        '_functionArray': [
            addNextCharWrap, () => {
                throw ERROR;
            }, addNextCharWrap
        ],
        getCreateArgs,
        'noCallback': true,
        'expected': ERROR,
        'functionArgs': ['a']
    }, {
        'description': 'check no return values',
        /* eslint no-empty-function: 0 */
        '_functionArray': [addOneWrap, () => {}, () => 111],
        getCreateArgs,
        'expected': 111,
        'functionArgs': [1]
    }, {
        'description': 'function returns another chain',
        '_functionArray': [
            addNextCharWrap, addNextCharWrap, () => chain.create([addNextCharWrap, addNextCharWrap, addNextCharWrap]),
            addNextCharWrap, addNextCharWrap
        ],
        getCreateArgs,
        'expected': 'pqrstuvw',
        'functionArgs': ['p']
    }, {
        'description': 'function returns another chain, one function hijacks args/return value',
        '_functionArray': [
            addNextCharWrap, addNextCharWrap, () => chain.create([addNextCharWrap, () => 'a', addNextCharWrap]),
            addNextCharWrap, addNextCharWrap
        ],
        getCreateArgs,
        'expected': 'abcd',
        'functionArgs': ['p']
    }, {
        'description': 'function returns another chain, with functions having own args',
        '_functionArray': [
            addNextCharWrap, addNextCharWrap,
            () => chain.create([addNextCharWrap, addNextCharWrap], () => {}, 'l'),
            addNextCharWrap, addNextCharWrap
        ],
        getCreateArgs,
        'expected': 'lmnop',
        'functionArgs': ['o']
    }
];
/* eslint no-magic-numbers:0 */
describe('#tests, args while start', () => {
    tests.forEach((test) => {
        it(test.description, (done) => {
            let fchain = null;
            if (test.getCreateArgs) {
                fchain = chain.create(...test.getCreateArgs(done));
            } else {
                fchain = chain.create();
            }
            if (test.functionArgs) {
                fchain.startCalls(...test.functionArgs);
            } else {
                fchain.startCalls();
            }
            if (test.noCallback) {
                done();
            }
        });
    });
});
describe('#tests, args while start, with delay', () => {
    tests.forEach((test) => {
        it(test.description, (done) => {
            let fchain = null;
            if (test.getCreateArgs) {
                fchain = chain.createWithDelay(...test.getCreateArgs(done, delay));
            } else {
                fchain = chain.createWithDelay(delay);
            }
            if (test.functionArgs) {
                fchain.startCalls(...test.functionArgs);
            } else {
                fchain.startCalls();
            }
            if (test.noCallback) {
                done();
            }
        });
    });
});
describe('#tests, args while create', () => {
    tests.forEach((test) => {
        // other cases are covered already before
        if (test.getCreateArgs && test.functionArgs) {
            it(test.description, (done) => {
                let fchain = null;
                fchain = chain.create(...test.getCreateArgs(done, undefined, test.functionArgs));
                fchain.startCalls();
                if (test.noCallback) {
                    done();
                }
            });
        }
    });
});
describe('#tests, args while create, with delay', () => {
    tests.forEach((test) => {
        // other cases are covered already before
        if (test.getCreateArgs && test.functionArgs) {
            it(test.description, (done) => {
                const fchain = chain.createWithDelay(...test.getCreateArgs(done, delay, test.functionArgs));
                fchain.startCalls();
                if (test.noCallback) {
                    done();
                }
            });
        }
    });
});
describe('#tests, args while start and create, with delay', () => {
    tests.forEach((test) => {
        if (test.getCreateArgs && test.functionArgs) {
            it(test.description, (done) => {
                const fchain = chain.createWithDelay(...test.getCreateArgs(done, delay, test.functionArgs));
                fchain.startCalls(...test.functionArgs);
                if (test.noCallback) {
                    done();
                }
            });
        }
    });
});

describe('#chain', () => {
    it('use set functions', (done) => {
        const fchain = chain.create();
        fchain.setDelay(delay);
        fchain.setFunctions([addNextCharWrap, addNextCharWrap, addNextCharWrap]);
        fchain.setCallback((finalVal) => {
            expect(finalVal).to.equal('wxyz');
            done();
        });
        fchain.setFunctionArgs('w');
        fchain.startCalls();
    });
    it('function chain with no return value functions', (done) => {
        const obj = {'value': 100};
        const fchain = chain.createWithDelay(delay, [noReturnValue, noReturnValue, noReturnValue], () => {
            expect(obj.value).to.equal(103);
            done();
        });
        fchain.startCalls(obj);
    });
    it('function chain with no return value, no args functions', (done) => {
        globalObject.value = 0;
        const fchain = chain.createWithDelay(
            delay, [noReturnValueNoArgs, noReturnValueNoArgs, noReturnValueNoArgs],
            () => {
                expect(globalObject.value).to.equal(3);
                done();
            }
        );
        fchain.startCalls();
    });
    it('check return values', (done) => {
        const fchain = chain.createWithDelay(delay, [addOneWrap, addOneWrap, addOneWrap], (finalVal) => {
            expect(finalVal).to.equal(4);
            done();
        });
        fchain.startCalls(1);
    });
    it('check arguments list, ' +
        // 'first arg shoud be return value from previous function, rest should be the original args', (done) => {
        'the function args should be the same as sent while creating the chain, ' +
        'the last parameter should be the return value from the previous function call', (done) => {
        const fchain = chain.createWithDelay(delay, [
            (num, chr) => {
                expect(num).to.equal(1);
                expect(chr).to.equal('a');
                return 123;
            }, (num, chr, retVal) => {
                expect(retVal).to.equal(123);
                expect(num).to.equal(1);
                expect(chr).to.equal('a');
                return 456;
            }, (num, chr, retVal) => {
                expect(retVal).to.equal(456);
                expect(num).to.equal(1);
                expect(chr).to.equal('a');
                return 789;
            }
        ], (finalVal) => {
            expect(finalVal).to.equal(789);
            done();
        });
        fchain.startCalls(1, 'a');
    });
});
// repeat tests
describe('#repeat()', () => {
    it('repeat function call', (done) => {
        const fc = chain.createRepeatFunctionChain(addOneWrap, (error, result) => result !== 100, (finalVal) => {
            expect(finalVal).to.equal(100);
            done();
        }, 0);
        fc.startCalls();
    });
    it('repeat function call, no continue callback function', (done) => {
        const fc = chain.createRepeatFunctionChain(addOneWrap, undefined, (finalVal) => {
            expect(finalVal).to.equal(1);
            done();
        }, 0);
        fc.startCalls();
    });
    it('repeat function call, function throws error, dont continue', (done) => {
        globalObject.value = 0;
        const fc = chain.createRepeatFunctionChain((num, result) => {
            if (result === 3) {
                throw ERROR;
            }
            return addOneWrap(num, result);
        }, (error) => error === null, (finalVal) => {
            expect(finalVal).to.equal(3);
            done();
        }, 0);
        fc.startCalls();
    });
    it('repeat function call, function throws error, no continue callback function', (done) => {
        globalObject.value = 0;
        const fc = chain.createRepeatFunctionChain((num, result) => {
            if (result === 3) {
                throw ERROR;
            }
            return addOneWrap(num, result);
        }, undefined, (finalVal) => {
            expect(finalVal).to.equal(1);
            done();
        }, 0);
        fc.startCalls();
    });
    it('repeat function call, function throws error, continue', (done) => {
        globalObject.value = 0;
        const fc = chain.createRepeatFunctionChain((num, result) => {
            globalObject.value += 1;
            if (globalObject.value === 2) {
                throw ERROR;
            }
            return addOneWrap(num, result);
        }, (error, result) => result !== 8, (finalVal) => {
            expect(finalVal).to.equal(8);
            done();
        }, 0);
        fc.startCalls();
    });
    it('repeat function call, with delay', (done) => {
        const fc = chain.createRepeatFunctionChain(addOneWrap, (error, result) => result !== 10, (finalVal) => {
            expect(finalVal).to.equal(10);
            done();
        }, 0);
        fc.setDelay(delay);
        fc.startCalls();
    });
    it.skip('repeat function call, many functions(stack overflow)', (done) => {
        const fc = chain.createRepeatFunctionChain(addOneWrap, (error, result) => result !== 10000, (finalVal) => {
            expect(finalVal).to.equal(10000);
            done();
        }, 0);
        // fc.setDelay(1);
        fc.startCalls();
    }); // .timeout(20000);
});
