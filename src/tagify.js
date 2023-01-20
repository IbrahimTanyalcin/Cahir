import { Chain } from "./Chain.js"

Chain.tagify = (
    {
        delim = " ",
        strTransform = str => str.trim(),
        valTransform = (thisArg, strings, stringsTransformed) =>
            (val, index, vals) =>
                typeof val === "function"
                    ? val({
                        thisArg,
                        self: val,
                        index,
                        values: vals,
                        strings,
                        stringsTransformed
                    })
                    : val
    } = {}
) => (f) => function (...args) {
    if (args?.[0]?.raw && Object.isFrozen(args[0])) {
        const strs = args[0].map(strTransform),
            vals = args.slice(1).map(valTransform(this, args[0], strs));
        for (let i = 0, fields; i < vals.length; ++i) {
            fields = strs[i].split(delim);
            this[fields[0]](fields[1], vals[i]);
        }
        return this;
    }
    return f?.call?.(this, ...args);
}