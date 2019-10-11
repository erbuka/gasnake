Array.prototype.shuffle = function () {
    let result = [];
    let indices = this.map((v, i) => i);

    while (indices.length > 0) {
        let idx = Math.floor(Math.random() * indices.length);
        result.push(this[indices[idx]]);
        indices.splice(idx, 1);
    }

    return result;

}