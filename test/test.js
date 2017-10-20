'use strict';
const expect = require('chai').expect;
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const Chain = require('../index');
//
const addOne = (n) => n + 1;
//appends a new character to the string. the char code of this new charater is 1+char code of the last character in the string (for abc, we get abcd, c+1)
const addNextChar = (s) => s + String.fromCharCode(s.charCodeAt(s.length - 1) + 1);
//
describe('#chain', function() {
	it('check order', function(done) {
		let f = new Chain(100, [addNextChar, addNextChar, addNextChar], (f) => {
			expect(f).to.equal('abcd');
			done();
		});
		f.startCalls('a');
	});
	it('check return values', function(done) {
		let f = new Chain(100, [addOne, addOne, addOne], (f) => {
			expect(f).to.equal(4);
			done();
		});
		f.startCalls(1);
	});
	it('check arguments list', function(done) {
		let f = new Chain(100, [(n, c) => {
			expect(n).to.equal(1);
			expect(c).to.equal('a');
			return 123;
		}, (r, n, c) => {
			expect(r).to.equal(123);
			expect(n).to.equal(1);
			expect(c).to.equal('a');
			return 456;
		}, (r, n, c) => {console.log("rnc", r,n,c);
			expect(r).to.equal(456);
			expect(n).to.equal(1);
			expect(c).to.equal('a');
			return 789;
		}], (f) => {
			expect(f).to.equal(789);
			done();
		});
		f.startCalls(1, 'a');
	});
	it('check no return values', function(done) {
		let f = new Chain(100, [(n) => n + 1, (n) => {}, () => 100], (f) => {
			expect(f).to.equal(100);
			done();
		});
		f.startCalls(1);
	});
});
