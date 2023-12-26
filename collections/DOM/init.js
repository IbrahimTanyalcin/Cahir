const init = Cahir.tagify({
    strTransform: str => str
        .trim()
        .replace(/^<((?:[a-z]+-+[a-z]*)+)/,"wc $1")
        .replace(/^\/>\s*/,"")
        .replace(/^\|>/, "pipe")
        .replace(/^\|</, "rPipe")
        .replace(/^\$>/, "data")
        .replace(/^%>/, "filter")
        .replace(/^\*>/, "crt")
        .replace(/^&>/, "each")
        .replace(/^>>/, "set")
        .replace(/^->/gi, "invoke")
        .replace(/^@>/, "select")
        .replace(/=>/gi, "runtime")
        .replace(/^x>/gi, "exec")
        .replace(/^[+]>/gi, "append")
        .replace(/^[+]\->/gi, "sappend")
        .replace(/^[+]</gi, "appendTo")
        .replace(/^[+]\-</gi, "sappendTo")
        .replace(/^r>/gi, "replaceWith")
        .replace(/^r->/gi, "sreplaceWith")
        .replace(/^r</gi, "inplaceOf")
        .replace(/^r\-</gi, "sinplaceOf")
        .replace(/^0>/gi, "noOP")
        .replace(/^\[>/gi, "aref")
        .replace(/^\{>/gi, "oref")
        .replace(/^👌/gi, "noOP")
        .replace(/^☝/gi, "invoke")
        .replace(/^👉/gi, "sappend")
        .replace(/^🤞/gi, "sreplaceWith")
        .replace(/^👊/gi, "runtime")
        .replace(/^👈/gi, "appendTo")
})(function (...args) {
    if (args.length <= 1) {
        this.selected = args[0];
        return this;
    }
    return this[args[0]](...args.slice(1))
})

export {init as default, init as __init__};