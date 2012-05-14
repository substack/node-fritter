var fritter = require('../');
var vm = require('vm');

var out = fritter('(' + function () {
    console.log('beeeep');
    beep(console.log)('boop');
} + ')()');

console.log(out.source);
vm.runInNewContext(out.source, out.context);
