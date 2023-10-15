export default {
    delim: " ",
    strTransform: str => str.trim(),
    valTransform: (thisArg, strings, stringsTransformed, rawVals) => {
        const 
            rawValsLen = rawVals.length,
            isNamedParam = /(?<param>[A-Z]+):$/gi;
        stringsTransformed.forEach(function(d,i,a){
            if (i >= rawValsLen) {
                return;
            }
            const [{groups:{param}} = {groups:{}}] = [
                ...d.matchAll(isNamedParam)
            ];
            if (param){
                rawVals[param] = rawVals[i];
                stringsTransformed[i] = d.slice(0, d.lastIndexOf(param));
            }
        },thisArg);
        return (val, index, vals) =>
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
    }
}