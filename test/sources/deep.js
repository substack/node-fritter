function f () { g() }
function g () { h() }
function h () {
    setTimeout(function xxx () {
        (function yyy () {
            setTimeout(function () {
                setTimeout(zzz, 30)
            }, 5);
        })()
    }, 10);
}

f();

function zzz () {
    process.nextTick(function () {
        qualia(5);
    });
}

function qualia (n) {
    throw 'moo'
}
