!async function(){
    const cardData = await fetch("/static/gwent-chain/data/card-data-gwent.json")
    .then(res => res.json());

    ch`
    @> body:${document.body}
    @> head:${document.head}
    0> item:${`
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        justify-content: center;
    `}
    0> itemMargin: ${8}
    0> factionColors: ${{
        monster: "#4e120acc",
        scoiatael: "#323a1ecc",
        skellige: "#33155dcc",
        neutral: "#302113cc",
        syndicate: "#75390dcc",
        nilfgaard: "#222222cc",
        northern_realms: "#113a68cc"
    }}
    0> cardHeight: ${"clamp(240px, 20vh, 720px)"}
    0> aspectRatio: ${249 / 357}
    0> cardImageStyle: ${
        'style="width:100%; position: absolute; top: 0; left: 0;"'
    }
    0> renderStyles: ${await import("/static/js/render_styles.js")}
    0> renderCodeBlock: ${await import("/static/js/render_code_block.js")}
    0> ${async ({values}) => {
        const reactive = await ch.until(() => window.data).lastOp;
        values.renderCodeBlock.render(
            cardData, values, document.getElementById("code-block")
        )
    }}
    adopt ...${[
        "game-card", 
        (await import(
            "/static/js/component-game-card.js"
        )).render
    ]}
    *> ${"style"} |> sappend ${0}
    >> textContent ${({values}) => values.renderStyles.render(values)}
    -> cont:${document.createElement("div")} 
    0> contId:${"my-container"}
    satr id ${({values}) => values.contId}
    => ${({values}) => () => values.body.appendChild(values.cont)}
    0> weakmap:${new WeakMap()}
    0> rm:${Symbol("toBeRemoved")}
    0> fragment:${ch.crtFragment(1).lastOp[0]}
    0> comparer:${{ en: new Intl.Collator("en").compare }}
    => ${({values}) => () => values.pickle = ch.pickle`
        -> ${values.cont}
        => ${() => () => values.data.sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0) ||
            values.comparer.en(a["data-card-name"],b["data-card-name"])
        )}
        => ${() => () => {
            values.data.filter(d => {
                let node = values.weakmap.get(d);
                if (node && !node[values.rm]){
                    ch(node)
                    .cancelAnimate({
                        commit: ["transform"]
                    })(values.cont);
                    return 0;
                }
                return 1;
            }).forEach((d,i) => {
                values.weakmap.set(
                    d,
                    ch`
                    <game-card ${{ data: {values, d} }}/>
                    +< ${values.cont}`.selected
                )
            })
        }}
        -> ${values.cont}
        => ${() => () => {
            if (!values.data.length){return}
            values.dims = values.weakmap.get(values.data[0])
                .getBoundingClientRect();
            values.children = Array.from(values.cont.children);
        }}
        &> ${() => (n,i,c) => {
            if (n[values.rm]) {return}
            if (!values.data.includes(n.dataRef)){
                return ch(n).addClass("fadeOutDown")
                .set(values.rm, true)
                .animate([],{duration:1000})
            }
            ch`
            -> ${n}
            => ${() => () => {
                const
                    iData = values.data.indexOf(n.dataRef),
                    iDiff = iData - i;
                ch.animate([
                    {
                        transform: `translate(0px, ${
                            iDiff * (values.dims.height + values.itemMargin)
                        }px)`
                    }
                ],{duration:1000, easing: "ease-in-out", fill: "both"})
            }}
            `
        }}
        => ${() => () => {
            const
                nodes = values.data.map(d => values.weakmap.get(d)),
                promises = nodes.map(n => ch(n).promiseAnimate());
            Promise.all(promises).then((results) => {
                ch()`
                -> ${values.fragment}
                +> ${nodes}
                &> ${() => (n) => ch(n)
                    .rmClass("fadeInUp")
                    .immediateAnimate([
                        {transform: "translate(0px, 0px)"}
                    ])
                }
                -> ${(values.cont.replaceChildren(), values.cont)}
                prepend ${[values.fragment]}
                `
            }).catch(() => {})
        }}
    `}
    => ${({values}) => () => {
        const callback = ch.throttle(({val, prop, oldVal}) => {
            ch(values.pickle)
        }, {delay: 100}).lastOp;
        values.data = cardData.slice(0,5).map(
            d => ch.reactiveObject(d, {cb: callback})
        )
        window.data = ch.reactiveArray(values.data, {
            cb: callback,
            cbChild: callback
        })
    }}
    => ${({values}) => () => ch(values.pickle)}
    `
}()