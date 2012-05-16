exports.zzz = function zzz () {
    setTimeout(function () {
        throw 'beep boop';
    }, 20);
};
