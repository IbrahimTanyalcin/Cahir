const select = function(str, trgt){
    if (str instanceof Node) {
        return this(str);
    }
    trgt = trgt || this.selected;
    this.lastOp = this(trgt.querySelector(str));
    return this;
}

export {select as default, select};