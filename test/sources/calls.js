function f () { g() }
function g () { h() }
function h () { throw 'moo' }

f();
