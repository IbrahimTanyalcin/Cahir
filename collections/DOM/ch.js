const ch = new Cahir({
    __init__: Cahir.tagify({
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
    }),
    select: function(str, trgt){
        if (str instanceof Node) {
            return this(str);
        }
        trgt = trgt || this.selected;
        this.lastOp = this(trgt.querySelector(str));
        return this;
    },
    data: function (data) {
        if (data === void (0)) {
            return this.lastOp = this.__data__;
        }
        this.lastOp = this.__data__ = data;
        this.dataRoot = this.selected;
        return this;
    },
    datum: function (acc, trgt) {
        const that = this,
            idxs = [];
        let ndx = this.getIdx(acc, trgt, true),
            currNode = ndx.node;
        if (!this.dataRoot.contains(currNode)) {
            return void (0);
        } else if (this.dataRoot === currNode) {
            return this.__data__;
        }
        while (currNode !== this.dataRoot) {
            idxs.push(ndx);
            if (acc instanceof Function) {
                trgt = currNode.parentNode.parentNode;
            } else {
                acc = currNode.parentNode;
            }
            ndx = this.getIdx(acc, trgt);
            currNode = ndx.node;
        }
        return function (f = function (idxs) {
            let datum = that.__data__;
            for (let i = 0, l = idxs.length; i < l; ++i) {
                datum = datum[idxs[i].index]
            }
            return datum;
        }) {
            return f(idxs.reverse());
        }
    },
    getIdx: function (acc, trgt, useFilter = false) {
        let pNode,
            children,
            index,
            node,
            findIndex = 0;
        if (acc instanceof Function) {
            pNode = trgt || this.selected;
            findIndex = 1;
        } else if (acc instanceof Node) {
            pNode = acc.parentNode;
        } else {
            pNode = this.selected?.parentNode;
        }
        children = Array.from(pNode?.children ?? { length: 0 }).filter(d => !useFilter || this.__filter__(d, "getIdx"));
        index = children[findIndex ? "findIndex" : "indexOf"](acc ?? this.selected);
        node = children[index];
        return { node, index };
    },
    filter: function (f = (d, op) => d) {
        this.__filter__ = f;
        return this;
    },
    __filter__: (d, op) => d,
    set: function (k, v) {
        if (k instanceof Array) {
            if (k[0] instanceof Array) {
                this.lastOp = k.map(([k, v]) => { this.set(k, v); return v });
                return this;
            }
            [k, v] = k;
            if (k === void(0)) {
                return this;
            }
        }
        this.selected[k] = this.lastOp = v;
        return this;
    },
    get: function (k) {
        if (k instanceof Array) {
            return this.lastOp = k.map(_k => this.selected[_k])
        }
        return this.lastOp = this.selected[k];
    },
    call: function (a, ...args) {
        this.lastOp = this.selected[a].apply(this.selected, args);
        return this;
    },
    invoke: function (...args) {
        return this.lastOp = this(...args);
    },
    runtime: function (f, ...args){
        this.lastOp = f.apply(this, args);
        return this;
    },
    apply: function (a, args) {
        this.lastOp = this.selected[a].apply(this.selected, args);
        return this;
    },
    gatr: function (attr) {
        if (attr instanceof Array) {
        	  return this.lastOp = attr.map(k => this.gatr(k));
        }
        return this.lastOp = this.selected.getAttribute(attr);
    },
    gatrNS: function (attr, namespace) {
        if (attr instanceof Array) {
        	  return this.lastOp = attr.map(([k, ns]) => this.gatrNS(k, ns));
        }
        return this.lastOp = this.selected.getAttributeNS(namespace, attr);
    },
    satr: function (attr, val) {
        if (attr instanceof Array) {
            this.lastOp = attr.map(([k, v]) => { this.satr(k, v); return v });
        } else {
            this.selected.setAttribute(attr, this.lastOp = val);
        }
        return this;
    },
    satrNS: function (attr, val, namespace) {
        if (attr instanceof Array) {
            this.lastOp = attr.map(([k, v, n]) => { this.satrNS(k, v, n); return v });
        } else {
            this.selected.setAttributeNS(namespace, attr, this.lastOp = val);
        }
        return this;
    },
    unwrap: function(v) {
        if (v instanceof Function){
            if (v.length === 2) {
                v = v.call(this, this.datum()(), this.dindex()());
            } else if (v.length === 1) {
                v = v.call(this, this.datum()());
            } else {
                v = v.call(this);
            }
        }
        this.lastOp = v;
        return this;
    },
    style: function (k, v) {
        if (k instanceof Array) {
            this.lastOp = k.map(([k, v]) => { 
            	return this.unwrap(v).rPipe("style",k).lastOp; 
            });
        } else {
            this.selected.style.setProperty(k, this.lastOp = this.unwrap(v).lastOp);
        }
        return this;
    },
    pipe: function (command, ...args) {
        args = args.flat();
        this[command].apply(this, [this.lastOp, ...args]);
        return this;
    },
    rPipe: function (command, ...args) {
        args = args.flat();
        this[command].apply(this, [...args, this.lastOp]);
        return this;
    },
    crt: function (tagName, count = 1) {
        if (tagName instanceof Array) {
            this.lastOp = tagName.map(d => document.createElement(d));
        } else {
            this.lastOp = Array.from({ length: count }).map(d => document.createElement(tagName));
        }
        return this;
    },
    crtNode: function (nodeString) {
        this.lastOp = document.createElement(nodeString);
        return this;
    },
    crtText: function (data, count = 1) {
        if (data instanceof Array) {
            this.lastOp = data.map(d => document.createTextNode(d));
        } else {
            this.lastOp = Array.from({ length: count }).map(d => document.createTextNode(data));
        }
        return this;
    },
    crtFragment: function (count = 1) {
        this.lastOp = Array.from({ length: count }).map(d => document.createDocumentFragment());
        return this;
    },
    append: function (els) {
        els = [els].flat(Infinity);
        (this.lastOp = els).forEach(d => this.selected.appendChild(d));
        return this;
    },
    appendTo: function (node, els) {
        const sel = this.selected;
        els = [els ?? sel].flat(Infinity);
        return this.select(node).append(els)(sel);
    },
    sappendTo: function (node, els) {
        const sel = this.selected;
        els = [els ?? sel].flat(Infinity);
        return this.select(node).append(els);
    },
    sappend: function(els){
        els = [els].flat(Infinity);
        let lastEl;
        (this.lastOp = els).forEach(d => lastEl = this.selected.appendChild(d));
        return this(lastEl);
    },
    unshift: function (els) {
        els = [els].flat(Infinity);
        (this.lastOp = els).forEach(d => this.selected.insertBefore(d, this.selected.firstElementChild));
        return this;
    },
    prepend: function (els) {
        els = [els].flat(Infinity);
        (this.lastOp = els).forEach(d => this.selected.insertBefore(d, this.selected.firstElementChild));
        return this;
    },
    sprepend: function (els) {
        els = [els].flat(Infinity);
        let lastEl;
        (this.lastOp = els).forEach(d => lastEl = this.selected.insertBefore(d, this.selected.firstElementChild));
        return this(lastEl);
    },
    replaceWith: function (node) {
        this.lastOp = this.selected.parentNode.replaceChild(node, this.selected);
        return this;
    },
    sreplaceWith: function (node) {
        this.lastOp = this.selected.parentNode.replaceChild(node, this.selected);
        return this(node);
    },
    inplaceOf: function (node) {
        this.lastOp = node.parentNode.replaceChild(this.selected, node);
        return this;
    },
    sinplaceOf: function (node) {
        this.lastOp = node.parentNode.replaceChild(this.selected, node);
        return this(node);
    },
    first: function () {
        return this(this.lastOp = this.selected.firstElementChild);
    },
    last: function () {
        return this(this.lastOp = this.selected.lastElementChild);
    },
    prev: function () {
        return this(this.lastOp = this.selected.previousElementSibling);
    },
    next: function () {
        return this(this.lastOp = this.selected.nextElementSibling);
    },
    pop: function () {
        if (this.selected.children.length) {
            this.lastOp = this.selected.removeChild(this.selected.lastElementChild);
        }
        return this;
    },
    rm: function (els, reverse) {
        if (typeof els?.[0] === "string") {
            let list = Array.from(this.selected.children).filter((d) => this.__filter__(d, "rm")),
                listLen = list.length,
                elsLen = els.length;
            if (reverse) {
                list = list.reverse();
            }
            for (let i = 0, j = 0; i < listLen && j < elsLen; ++i) {
                let node = list[i];
                if (node.parentNode && node.matches(els[j])) {
                    this.selected.removeChild(node);
                    ++j;
                    i = -1;
                } else if (i === listLen - 1) {
                    ++j;
                    i = -1;
                }
            }
        } else {
            els.forEach(node => node
                && this.selected?.contains(node)
                && this.selected.removeChild(node)
            )
        }
        this.lastOp = els;
        return this;
    },
    on: function (evt, f, opts = {}) {
        const that = this;
        let evtName,
            evtNS,
            wm,
            ns,
            ev,
            listener = this.lastOp = f;
        if (evt.includes("@", 1)) {
            if (!this.__eventMap__) {
                this.__eventMap__ = new WeakMap();
            }
            wm = this.__eventMap__;
            [evtName, evtNS] = evt.split("@");
            if (!wm.has(this.selected)) {
                wm.set(this.selected, new Map());
            }
            ns = wm.get(this.selected);
            if (!ns.has(evtNS)) {
                ns.set(evtNS, new Map());
            }
            ev = ns.get(evtNS);
            if (!ev.has(evtName)) {
                ev.set(evtName, new Map())
            }
            ev.get(evtName).set(listener, opts);
        }
        evt = evtName ?? evt;
        (opts.trgt ?? this.selected).addEventListener(evt, listener, opts);
        return this;
    },
    off: function (evt, f, opt) {
        let [evtName, evtNS] = evt.split("@");
        let temp;
        switch ((!!evtName << 1) + (!!evtNS << 0)) {
            case 0:
                this.lastOp = null;
                break;
            case 1:
                (temp = this.__eventMap__
                    .get(this.selected))
                    .get(evtNS)
                    ?.forEach((listeners, evtStr, thisMap) =>
                        listeners.forEach((_opt, _f, thatMap) => {
                            this.lastOp = _f;
                            this.selected.removeEventListener(evtStr, _f, _opt);
                            thatMap.delete(_f);
                        })
                    );
                temp.delete(evtNS);
                break;
            case 2:
                this.selected.removeEventListener(evt, f, opt);
                break;
            case 3:
                this.__eventMap__
                .get(this.selected)
                .forEach((evtMap, _evtNS, thisMap) => {
                    if (evtNS !== _evtNS) {
                        return
                    }
                    evtMap.forEach((listeners, evtStr, thatMap) => {
                        if (evtStr === evtName) {
                            listeners.forEach((_opt, _f, thereMap) => {
                                this.lastOp = _f;
                                this.selected.removeEventListener(evtStr, _f, _opt);
                                thereMap.delete(_f);
                            })
                        }
                    })
                });
        }
        return this;
    },
    each: function (f) {
        const oSel = this.selected;
        (this.lastOp = Array.from(this.selected.children)).filter(d => this.__filter__(d, "each")).forEach((d, i, a) => {
            f.call(this, d, i, a);
        }, this);
        return this(oSel);
    },
    exec: function (f, ...args) {
        this.lastOp = f.apply(this, args);
        return this;
    },
    up: function () {
        return this(this.lastOp = this.selected.parentNode);
    },
    addClass: function (cls, trgt) {
    		trgt = trgt || this.selected;
        if (typeof cls === "function") {
            cls = cls.call(this);
        }
        if (cls instanceof Array) {
            trgt.classList.add(...cls);
        } else {
            trgt.classList.add(cls);
        }
        this.lastOp = cls;
        return this;
    },
    rmClass: function (cls, trgt) {
    		trgt = trgt || this.selected;
        if (typeof cls === "function") {
            cls = cls.call(this);
        }
        if (cls instanceof Array) {
            trgt.classList.remove(...cls);
        } else {
            trgt.classList.remove(cls);
        }
        this.lastOp = cls;
        return this;
    },
    toggleClass: function (cls, force, trgt) {
    		trgt = trgt || this.selected;
        if (typeof cls === "function") {
            cls = cls.call(this);
        }
        if (cls instanceof Array) {
            cls.forEach(t => trgt.classList.toggle(t, force));
        } else {
            trgt.classList.toggle(cls, force);
        }
        this.lastOp = cls;
        return this;
    },
    replace: function (cls, nToken, trgt) {
        trgt = trgt || this.selected;
        if (typeof cls === "function") {
            cls = cls.call(this);
        }
        if (cls instanceof Array) {
            cls.forEach(([oToken, nToken]) => trgt.classList.replace(oToken, nToken));
        } else {
            trgt.classList.replace(cls, nToken);
        }
        this.lastOp = cls;
        return this;
    },
    stash: function (v, ...args) {
        if (!this.__stash) {
            this.__stash = [];
        }
        if (typeof v === "function") {
            this.__stash.push(this.lastOp = v.apply(this, args));
        } else {
            this.__stash.push(this.lastOp = v);
        }
        return this;
    },
    save: function (v, ...args) {
        return this.stash(v, ...args);
    },
    stashPop: function (v, ...args) {
        if (typeof v === "function") {
            return this.lastOp = v.apply(this, [this.__stash.pop(), ...args]);
        }
        return this.lastOp = this.__stash.pop();
    },
    recall: function (v, ...args) {
        return this.stashPop(v, ...args);
    },
    animate: function (oKeyframes, opts = 1000) {
        const that = this,
            sel = this.selected;
        if (
            sel.__animation__
            && !["finished", "idle"].includes(sel?.__currentAnimation__?.playState)
        ) {
            this.lastOp = sel.__animation__ = sel.__animation__.then(() => {
                if (sel.__currentAnimation__.__cancelled__) {
                    throw new DOMException("Animation cancelled.", "AbortError");
                }
                return (sel.__currentAnimation__ = sel.animate(oKeyframes, opts)).finished
            })
        } else {
            this.lastOp = sel.__animation__ = (sel.__currentAnimation__ = sel.animate(oKeyframes, opts))
                .finished
        }
        return this;
    },
    immediateAnimate: function(oKeyframes, opts = {}) {
        return this.animate(oKeyframes, {
            duration: 1,
            delay: -1,
            fill:"both",
            ...opts
        });
    },
    promiseAnimate: function (opts = {}){
        return this.immediateAnimate([], opts).lastOp;
    },
    cancelAnimate: function ({commit = []} = {}) {
        let currAnim = this.selected?.__currentAnimation__,
            computed;
        if (currAnim) {
            if (commit?.length) {
                computed = Object.fromEntries(
                    commit.map(function (d) {
                        return [d, this[d]]
                    }, getComputedStyle(this.selected))
                );
            }
            (this.lastOp = currAnim).cancel();
            currAnim.__cancelled__ = true;
            if (computed){
                this.immediateAnimate([computed])
            }
        }
        return this;
    },
    await: function (promise, cb) {
        this.lastOp = promise.then(cb.bind(this));
        return this;
    },
    noOP: function(){
        return this;
    },
    aref: ((sym, isIntLike) => function (arr, {
        cb,
        args,
        cbChild,
        argsChild
    } = {}) {
        if (!(arr instanceof Array)) {
            throw new Error("1st argument is expected to be an array.");
        } else if (typeof cb !== "function") {
            throw new Error("2nd argument is expected to be a function.");
        }
        const that = this;
        return this.lastOp = new Proxy(arr, {set: function(trgt, prop, val, rec){
            const oldVal = trgt[prop];
            if (
                (val ?? sym) === sym
                && !/^\s+$/.test(prop)
                && !isNaN(+prop)
            ){
                trgt.splice(+prop,1);
            } else {
                trgt[prop] = cbChild 
                    ? isIntLike(prop)
                        ? that.oref(val, {
                            cb: cbChild, args: argsChild
                        })
                        : val
                    : val;
            }
            if(oldVal != val) {
                cb.apply(that, [
                    {
                        oldVal,
                        prop,
                        val,
                        trgt,
                        args,
                        arguments: args,
                        key: prop,
                        value: val
                    }
                ]);
            }
            return trgt.length || true;
        }})
    })(Symbol("nullOrUndef"), ((v) => {
            if (Number.isInteger(v)) return true;
            if ((""+v).trim() !== v) return false;
            if (Number.isInteger(+v)) return true;
            return false;
    })),
    oref: ((rgx, symIsReactive) => function (obj, {
        cb,
        args
    } = {}) {
        if (!rgx.exec(Object.prototype.toString.call(obj))) {
            throw new Error("1st argument is expected to be an object.");
        } else if (typeof cb !== "function") {
            throw new Error("2nd argument is expected to be a function.");
        } else if (obj?.[symIsReactive] === obj) {
            return obj;
        }
        const that = this;
        return this.lastOp 
        = obj[symIsReactive] 
        = new Proxy(obj, {set: function(trgt, prop, val, rec){
            const oldVal = trgt[prop];
            trgt[prop] = val;
            if(oldVal !== val){
                cb.apply(that, [
                    {
                        oldVal,
                        prop,
                        val,
                        trgt,
                        args,
                        arguments: args,
                        key: prop,
                        value: val
                    }
                ]);
            }
            return true;
        }})
    })(/(?<=\s)object(?=\])/i, Symbol("isReactive")),
    until:(() => {
        async function* until (f, interval, breaker, pauser, resolver){
            let cond = false;
            while(!breaker.value && !cond){
                yield cond = await nPromise(f, interval, pauser, resolver);
            }
        }
        function nPromise(f, interval, pauser, resolver) {
            return new Promise(res => {
                setTimeout(() => {
                    if(!pauser.value){return res(f())}
                    resolver.value = () => res(f());
                }, interval)
            })
        }
        return function (f, {thisArg = "", args = [], interval = 0} = {}) {
            const that = thisArg ?? this,
                  breaker = {value: false},
                  pauser = {value: false},
                  resolver = {value: void(0)},
                  _f = function(){
                    return f.call(that, ...args);
                  },
                  _until = (async () => {
                    let lastVal;
                    for await (lastVal of until(_f, interval, breaker, pauser, resolver)){}
                    return lastVal;
                  })();
            _until.break = () => {breaker.value = true};
            _until.pause = () => {pauser.value = true};
            _until.resume = () => {pauser.value = false; resolver?.value?.()};
            this.lastOp = _until;
            return this;
        }
    })(),
    throttle: function(f, {thisArg = void(0), delay=100} = {}){
        const that = this;
        let timeout,
            prom,
            resolver;
        return this.lastOp = function(...args) {
            clearTimeout(timeout);
            thisArg = thisArg ?? that;
            if (resolver) {
                timeout = setTimeout(() => {
                    resolver?.(f.apply(thisArg, args));
                    resolver = prom = null;
                }, delay);
                return prom;
            }
            return prom = new Promise(res => {
                resolver = res;
                timeout = setTimeout(() => {
                    res(f.apply(thisArg, args));
                    resolver = prom = null;
                }, delay);
            })
        }
    },
    wc: ((symData, symInit) => function(name, args){
        const that = this;
        const {
            attrs = [],
            styles = [],
            props = [],
            data = null,
            innerHTML = "",
            select = true
        } = args;
        if (!/^(?:[a-z]+-+[a-z]*)+$/.test(name)) {
            throw new Error([
                "start with an ASCII lowercase letter (a-z)",
                "contain a hyphen",
                "not contain any ASCII uppercase letters"
            ].join("\n"))
        } else if (!this[`${name}`]){
            throw new Error("this component is not defined");
        } else if (!customElements.get(name)){
            function genWc () {
                return Reflect.construct(HTMLElement, [], new.target);
            }
            genWc.prototype = Object.create(HTMLElement.prototype);
            genWc.prototype.constructor = genWc;
            genWc.prototype.connectedCallback = function(){
                if(this[symInit]){return}
                this[symInit] = true;
                that[name](
                    {...this[symData], el: this, proto: genWc.prototype}
                )
            }
            genWc.name = name;
            Object.setPrototypeOf(genWc, HTMLElement);
            customElements.define(name, genWc);
        }
        const node = document.createElement(name);
        node[symData] = {name, attrs, styles, props, data};
        if (typeof innerHTML === "function") {
            innerHTML = innerHTML.call(node, data);
        }
        node.innerHTML = innerHTML;
        select && this(node);
        this.lastOp = node;
        return this;
    })(Symbol("wc-data"), Symbol("wc-init")),
    adopt: function(k, v){
        const proto = Object.getPrototypeOf(this);
        if (k instanceof Array) {
            if (k[0] instanceof Array) {
                k.forEach(([k, v]) => this.adopt(k, v));
                return this;
            }
            [k, v] = k;
        }
        proto[k] = v;
        return this;
    },
    opItem: function(i = 0) {
        if (!(this.lastOp instanceof Array)) {
            return this.lastOp;
        }
        return this.lastOp.at(i);
    },
    state: function(oState){
        if(!oState){
            return {
                selected: this.selected,
                lastOp: this.lastOp
            }
        }
        this(oState.selected);
        this.lastOp = oState.lastOp;
        return this;
    },
    dom: ((V, M) => function(...args) {
        let html = "";
        switch (true) {
            case (!M.get("p")):
                throw new DOMException(
                    "No access to DOM is possible",
                    "NotSupportedError"
                )
                break;
            case (args?.[0]?.raw && Object.isFrozen(args[0])):
                let strs = args[0],
                    vals = args.slice(1);
                for (let i = 0; i < strs.length; ++i){
                    html += strs[i] + V(vals[i] ?? "")
                }
                break;
            default:
                html = args.reduce((ac,d) => ac += V(d))
        }
        const
            p = M.get("p"),
            c = M.get("c"),
            nC = c.cloneNode();
        M.set("c", nC);
        try {
            c.outerHTML = html;
            return p.replaceChild(nC, p.firstElementChild);
        } catch (err) {
            p.replaceChildren(nC);
            throw err;
        }
    })(...(() => {
        const V = (v) => {
            v = [v].flat();
            return v.map(d => 
                typeof d === "function"
                ? d()
                : d
            ).join("")
        }
        let p,c;
        try {
            p = document.createElement("div"),
            c = p.appendChild(document.createElement("div"));
        } catch (err) {
        } finally {
            return [V, new Map([["p",p], ["c", c]])]
        }
    })()),
    __interceptGet__: ((rgx, pass) => function (next, prop, receiver) {
        switch (true) {
            case (typeof prop === "symbol"):
            case (pass.includes(prop)):
            case (prop?.charAt?.(0) === "_"):
                break;
            case (!(prop in this)):
                const state = this.state();
                let {groups:{tag, opts = "{}"}} = rgx.exec(prop);
                opts = JSON.parse(opts);
                const el = document.createElement(tag);
                this(el)
                .style(opts?.style ?? [])
                .satr(opts?.attr ?? [])
                .satrNS(opts?.attrNS ?? [])
                .set(opts?.prop ?? [])
                .state(state);
                return el;
        }
        next();
    })(
        /^(?<tag>[a-z]+)(?<opts>\{.+\})?$/s,
        ["selected", "lastOp", "state", "dataRoot"]
    )
});