var falafel = require('falafel');
var identifier = require('identifier');
var EventEmitter = require('events').EventEmitter;

module.exports = function (src, context) {
    if (!context) context = {};
    var self = new EventEmitter;
    self.context = context;
    
    function isBuiltin (fn) {
        return fn === context.setTimeout
            || fn === context.clearTimeout
            || fn === context.setInterval
            || fn === context.clearInterval
        ;
    }
    
    var names = self.names = {};
    var nodes = self.nodes = [];
    var stack = self.stack = [];
    
    names.call = identifier(6);
    context[names.call] = function (ix, fn) {
        if (typeof fn === 'function' && typeof fn.apply === 'function') {
            var fn_ = function () {
                stack.push(nodes[ix]);
console.log('PUSH ' + ix);
                var res = fn.apply(undefined, arguments);
                stack.pop();
console.log('POP ' + ix);
                return res;
            };
            return copyAttributes(fn, fn_);
        }
        else if (typeof fn === 'object' && isBuiltin(fn)) {
            // some builtin IE functions have no .apply()
            var fn_ = function (_a, _b, _c, _d, _e, _f, _g, _h, _i, _j) {
                return fn(_a, _b, _c, _d, _e, _f, _g, _h, _i, _j);
            };
            return copyAttributes(fn, fn_);
        }
        else return fn;
    };
    
    names.catcher = identifier(6);
    names.catchVar = identifier(6);
    context[names.catcher] = function (err) {
console.log('CAUGHT');
        self.emit('error', err);
        throw err;
    };
    
    self.source = falafel(src, function (node) {
        if (node.type === 'FunctionExpression') {
            var inner =  node.body.source().slice(1,-1); // inside the brackets
            node.body.update('{'
                + 'try{' + inner + '}'
                + 'catch(' + names.catchVar + '){'
                + names.catcher + '(' + names.catchVar + ')'
                + '}'
            + '}');
        }
        else if (node.type === 'CallExpression') {
            node.callee.update(
                '(' + names.call + '('
                    + nodes.length + ', ' + node.callee.source()
                + '))'
            );
            nodes.push(node);
        }
    });
    
    return self;
};

var Object_keys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};

function copyAttributes (fn, fn_) {
    var keys = Object_keys(fn);
    for (var i = 0; i < keys.length; i++) fn_[key] = fn[key];
    return fn_;
}
