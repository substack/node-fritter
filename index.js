var falafel = require('falafel');
var identifier = require('identifier');
var EventEmitter = require('events').EventEmitter;

module.exports = function (src, context) {
    if (typeof src === 'object') {
        context = src;
        src = undefined;
    }
    if (!context) context = {};
    
    var fry = new Fritter(context || {});
    if (src !== undefined) fry.include(String(src));
    return fry;
};

function Fritter (context) {
    this.names = {
        call : identifier(6),
        catcher : identifier(6),
        catchVar : identifier(6),
        expr : identifier(6),
        stopped : identifier(6)
    };
    this.stack = [];
    this.current = undefined;
    this.context = context;
    this.nodes = [];
    this.defineContext();
    this.source = '';
}

Fritter.prototype = new EventEmitter;

Fritter.prototype.defineContext = function () {
    var self = this;
    var nodes = this.nodes;
    var context = this.context;
    var names = this.names;
    
    function isBuiltin (fn) {
        return fn === context.setTimeout
            || fn === context.clearTimeout
            || fn === context.setInterval
            || fn === context.clearInterval
        ;
    }
    
    context[names.call] = function (ix, fn) {
        if (typeof fn === 'function' && typeof fn.apply === 'function') {
            var fn_ = function () {
                if (self.stopped) throw names.stopped;
                self.stack.unshift(nodes[ix]);
                var res = fn.apply(undefined, arguments);
                self.stack.shift();
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
    
    (function () {
        var caught = [];
        var throwing = false;
        
        self.context[names.catcher] = function (err) {
            if (err === names.stopped) return;
            
            if (caught.indexOf(err) < 0) {
                caught.push(err);
                self.emit('error', err, {
                    stack : self.stack.slice(),
                    current : self.current
                });
            }
            
            if (!throwing) {
                throwing = true;
                process.nextTick(function () {
                    caught = [];
                    throwing = false;
                });
            }
            throw err;
        };
    })();
    
    context[names.expr] = function (ix, expr) {
        if (self.stopped) throw names.stopped;
        self.current = self.nodes[ix];
        return expr;
    };
};

Fritter.prototype.stop = function () {
    this.stopped = true;
};

Fritter.prototype.include = function (src, opts) {
    var self = this;
    if (typeof src === 'object') {
        opts = src;
        src = opts.source;
    }
    if (!opts) opts = {};
    var nodes = this.nodes;
    var names = this.names;
    
    function pushNode (node) {
        if (opts.filename) node.filename = opts.filename;
        node.start = node.loc.start;
        node.end = node.loc.end;
        nodes.push(node);
    }
    
    var src_ = falafel({ source : src, loc : true }, function (node) {
        if (node.type === 'FunctionExpression'
        || node.type === 'FunctionDeclaration') {
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
            pushNode(node);
        }
        else if (node.type === 'ExpressionStatement') {
            node.update(
                names.expr + '(' + nodes.length + ');'
                + node.source()
            );
            pushNode(node);
        }
    });
    this.source += src_ + ';';
    
    return this;
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
