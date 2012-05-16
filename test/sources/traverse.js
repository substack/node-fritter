var traverse = module.exports;

var xs = [];
traverse({ a : 1, b : 2, c : [ 3, 4 ]}, function (node) {
    if (this.isLeaf) xs.push(node);
});
t.same(xs, [ 1, 2, 3, 4 ]);

traverse({ a : 1, b : 2, c : [ 3, 4 ]}, function (node) {
    if (this.isRoot) throw 'beep';
});
