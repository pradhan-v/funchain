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
/* eslint no-magic-numbers:0 */
describe('#chain', () => {
    it('empty args', (done) => {
        const fchain = chain.create();
        fchain.startCalls();
        done();
    });
    it('negative delay, empty array, no callback', (done) => {
        const fchain = chain.create(-1, []);
        fchain.startCalls();
        done();
    });
    it('negative delay', (done) => {
        const fchain = chain.create(-1, [addNextCharWrap, addNextCharWrap, addNextCharWrap], (finalVal) => {
            expect(finalVal).to.equal('defg');
            done();
        });
        fchain.startCalls('d');
    });
    it('check order', (done) => {
        const fchain = chain.create(delay, [addNextCharWrap, addNextCharWrap, addNextCharWrap], (finalVal) => {
            expect(finalVal).to.equal('abcd');
            done();
        });
        fchain.startCalls('a');
    });
    it('set args in create function call', (done) => {
        const fchain = chain.create(delay, [addNextCharWrap, addNextCharWrap, addNextCharWrap], (finalVal) => {
            expect(finalVal).to.equal('abcd');
            done();
        }, 'a');
        fchain.startCalls();
    });
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
        const fchain = chain.create(delay, [noReturnValue, noReturnValue, noReturnValue], () => {
            expect(obj.value).to.equal(103);
            done();
        });
        fchain.startCalls(obj);
    });
    it('function chain with no return value, no args functions', (done) => {
        globalObject.value = 0;
        const fchain = chain.create(delay, [noReturnValueNoArgs, noReturnValueNoArgs, noReturnValueNoArgs], () => {
            expect(globalObject.value).to.equal(3);
            done();
        });
        fchain.startCalls();
    });
    it('check return values', (done) => {
        const fchain = chain.create(delay, [addOneWrap, addOneWrap, addOneWrap], (finalVal) => {
            expect(finalVal).to.equal(4);
            done();
        });
        fchain.startCalls(1);
    });
    it('check arguments list, ' +
    // 'first arg shoud be return value from previous function, rest should be the original args', (done) => {
    'the function args should be the same as sent while creating the chain, ' +
    'the last parameter should be the return value from the previous function call', (done) => {
        const fchain = chain.create(delay, [
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
    it('check no return values', (done) => {
        /* eslint no-empty-function:0 */
        const fchain = chain.create(delay, [addOneWrap, () => {}, () => 111], (finalVal) => {
            expect(finalVal).to.equal(111);
            done();
        });
        fchain.startCalls(1);
    });
    // repeat tests
    it('function returns another chain', (done) => {
        const retChain = () => chain.create(delay, [addNextCharWrap, addNextCharWrap, addNextCharWrap]);
        const fchain = chain.create(
            delay, [addNextCharWrap, addNextCharWrap, retChain, addNextCharWrap, addNextCharWrap],
            (finalVal) => {
                expect(finalVal).to.equal('pqrstuvw');
                done();
            }
        );
        fchain.startCalls('p');
    });
    it('function returns another chain, one function hijacks args/return value', (done) => {
        const retChain = () => chain.create(delay, [addNextCharWrap, () => 'a', addNextCharWrap]);
        const fchain = chain.create(
            delay, [addNextCharWrap, addNextCharWrap, retChain, addNextCharWrap, addNextCharWrap],
            (finalVal) => {
                expect(finalVal).to.equal('abcd');
                done();
            }, 'p'
        );
        fchain.startCalls();
    });
    it('repeat function call', (done) => {
        const fc = chain.createRepeatFunctionChain(addOneWrap, (error, result) => result !== 100, (finalVal) => {
            expect(finalVal).to.equal(100);
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
    it('repeat function call, many functions', (done) => {
        const fc = chain.createRepeatFunctionChain(addOneWrap, (error, result) => result !== 10000, (finalVal) => {
            expect(finalVal).to.equal(10000);
            done();
        }, 0);
        // fc.setDelay(1);
        fc.startCalls();
    }); // .timeout(20000);
});
