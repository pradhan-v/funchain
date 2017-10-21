'use strict';
const {expect} = require('chai');
const mocha = require('mocha');
const {describe} = mocha;
const {it} = mocha;
const Chain = require('../index');
const delay = 100;
//
const addOne = (num) => num + 1;
// appends a new character to the string. the char code of this new charater is
// 1+char code of the last character in the string (for abc, we get abcd, c+1)
const addNextChar = (str) => str + String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
//
/* eslint no-magic-numbers:0 */
describe('#chain', () => {
    it('check order', (done) => {
        const fchain = new Chain(delay, [addNextChar, addNextChar, addNextChar], (finalVal) => {
            expect(finalVal).to.equal('abcd');
            done();
        });
        fchain.startCalls('a');
    });
    it('check return values', (done) => {
        const fchain = new Chain(delay, [addOne, addOne, addOne], (finalVal) => {
            expect(finalVal).to.equal(4);
            done();
        });
        fchain.startCalls(1);
    });
    it('check arguments list', (done) => {
        const fchain = new Chain(delay, [
            (num, chr) => {
                expect(num).to.equal(1);
                expect(chr).to.equal('a');
                return 123;
            }, (retVal, num, chr) => {
                expect(retVal).to.equal(123);
                expect(num).to.equal(1);
                expect(chr).to.equal('a');
                return 456;
            }, (retVal, num, chr) => {
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
        const fchain = new Chain(delay, [addOne, () => {}, () => 111], (finalVal) => {
            expect(finalVal).to.equal(111);
            done();
        });
        fchain.startCalls(1);
    });
});
