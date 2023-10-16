function renderCodeBlock(cardData, values, codeBlock){
    const
        {
            min,
            max,
            random: rnd
        } = Math,
        rndLen = (len) => rnd() * len | 0,
        maxRepCount = 4,
        maxSpliceCount = 5,
        reactiveArray = window.data,
        transcribe = (text) => {
            codeBlock.textContent = text.trim()
                .split("\n")
                .filter(d => d)
                .concat(Array(maxRepCount + 1).fill(""))
                .slice(0,maxRepCount + 1)
                .join("\n");
            Prism.highlightElement(codeBlock);
        };
        
    const rmElem = () => {
        let len = reactiveArray.length,
            reps = min(len, max(1, rndLen(maxRepCount))),
            code = "";
        for (let _i = reps; _i > 0; --_i) {
            let len = reactiveArray.length,
                iEl = rndLen(len);
            if(!len){break}
            reactiveArray[iEl] = null;
            code += `data[${iEl}] = null;\n`
        }
        transcribe(code);
    }

    const popElem = () => {
        let len = reactiveArray.length,
            reps = min(len, max(1, rndLen(maxRepCount))),
            code = "";
        for (let _i = reps; _i > 0; --_i) {
            let len = reactiveArray.length;
            if(!len){break}
            reactiveArray.pop();
            code += `data.pop();\n`;
        }
        transcribe(code);
    }

    const shiftElem = () => {
        let len = reactiveArray.length,
            reps = min(len, max(1, rndLen(maxRepCount))),
            code = "";
        for (let _i = reps; _i > 0; --_i) {
            let len = reactiveArray.length;
            if(!len){break}
            reactiveArray.shift();
            code += `data.shift();\n`;
        }
        transcribe(code);
    }

    const addElem = () => {
        let len = cardData.length,
            reps = rndLen(maxRepCount),
            code = "";
        for (let _i = reps; _i > 0; --_i) {
            let iEl = rndLen(len);
            reactiveArray.push(cardData[iEl]);
            code += `data.push(cardData[${iEl}]);\n`;
        }
        transcribe(code);
    }

    const spliceElem = () => {
        let len = reactiveArray.length,
            start = rndLen(len),
            count = min(len - 1, max(1, rndLen(maxSpliceCount)));
        if (!len){return}
        reactiveArray.splice(start, count);
        transcribe(`data.splice(${start},${count});\n`);
    }

    const changeOrder = () => {
        let len = reactiveArray.length,
            reps = min(len, max(1, rndLen(maxRepCount))),
            code = "";
        for (let _i = reps; _i > 0; --_i) {
            let iEl = rndLen(len),
                rndOrder = rndLen(len);
            reactiveArray[iEl].order = rndOrder;
            code += `data[${iEl}].order = ${rndOrder};\n`
        }
        transcribe(code);
    }

    const unshiftElem = () => {
        let len = cardData.length,
            reps = rndLen(maxRepCount),
            code = "";
        for (let _i = reps; _i > 0; --_i) {
            let iEl = rndLen(len);
            reactiveArray.unshift(cardData[iEl]);
            code += `data.unshift(cardData[${iEl}]);\n`;
        }
        transcribe(code);
    }

    const concatElem = () => {
        let len = cardData.length,
            start = rndLen(len),
            count = rndLen(maxSpliceCount);
        reactiveArray.push(...cardData.slice(start, start + count));
        transcribe(`data.push(...cardData.slice(${start},${start + count}));\n`);
    }

    const controller = ch.until(function(){
        let subActions,
            len = reactiveArray.length;
        switch (true) {
            case len <= 2:
                subActions = this.grow;
                break;
            case len >= 7:
                subActions = this.shrink;
                break;
            default:
                subActions = this.default;
        }
        const action = subActions[rndLen(subActions.length)];
        action();
    },{
        thisArg: {
            grow: [addElem, unshiftElem, changeOrder, concatElem],
            shrink: [rmElem, spliceElem, changeOrder, popElem, shiftElem],
            default: [
                rmElem, spliceElem, changeOrder, 
                addElem, unshiftElem, popElem, shiftElem, concatElem
            ]
        },
        interval: 3000
    }).lastOp;

    ch(values.body)
    .select(".code-action button")
    .on("click", function(){
        if(this.paused){
            this.paused = false;
            this.textContent = "Pause"
            return controller.resume()
        }
        this.textContent = "Unpause"
        this.paused = true;
        controller.pause()
    })(values.body)`
        @> ${"details"}
        => ${({values:v}) => () => v.dets = ch.selected}
        on toggle ${({values:v}) => (e) => {
            const el = e.currentTarget;
            if (el.open){
                return ch(v.pre)
                .cancelAnimate({commit: ["transform", "opacity"]})
                .animate([
                    {
                        opacity: 1,
                        "-webkit-transform": "translate3d(0, 0%, 0)",
                        transform: "translate3d(0, 0%, 0)"
                    }
                ], {duration: 500, easing: "ease-in-out", fill: "both"})
            }
            ch(v.pre)
                .cancelAnimate({commit: ["transform", "opacity"]})
                .animate({
                        opacity: [1, 0],
                        "-webkit-transform": [
                            "translate3d(0, 0%, 0)",
                            "translate3d(0, -100%, 0)"
                        ],
                        transform: [
                            "translate3d(0, 0%, 0)",
                            "translate3d(0, -100%, 0)"
                        ]
                }, {duration: 500, easing: "ease-in-out", fill: "both"})
        }}
        +-> ${ch.crt("div").lastOp}
        on click ${({values:v}) => () => {
            v.dets.open = false;
        }}
        +-> pre:${ch.crt("pre").opItem()}
        on click ${() => (e) => {
            e.stopPropagation();
        }}
        +-> ${ch.crt("code").lastOp}
        addClass ${"language-js"}
        => ${({values:v}) => async () => {
            v.el = ch.selected;
            return fetch("static/js/app.js")
            .then(res => res.text())
        }}
        |> await ${({values:v}) => (text) => {
            v.el.textContent = text;
            Prism.highlightElement(v.el);
        }}
    `
}

export const render = renderCodeBlock;