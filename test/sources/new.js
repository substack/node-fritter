module.exports = Doom;

function Doom (obj) {
    if (!(this instanceof Doom)) return new Doom(obj);
    this.value = obj;
}

Doom.prototype.gloom = function (n) {
    return this.value + n;
};
