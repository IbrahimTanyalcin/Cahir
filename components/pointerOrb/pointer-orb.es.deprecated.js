import ch from "../../collections/DOM/ch.0.1.1.es.js";
const pointerOrb = ((symbols) => {
  "use strict";
  const 
    _window = globalThis || self || window,
    wk = new WeakMap(),
    {pi_2, pi_4, pi_8, pi_12} = new Proxy({}, {get: (t,p,r) => Math.PI * p.split("_").at(-1)}),
    cssVars = {x: "--orb-x", y: "--orb-y", pointerX: "--orb-pointer-x", pointerY: "--orb-pointer-y"},
    throttle_v2 = function(f, {thisArg = void(0), delay=100, defer=true} = {}){
      const 
          that = this,
          settle = (args) => {
              resolver?.(f.apply(thisArg, args));
              resolver = prom = null;
              tmstmp = performance.now();
          };
      let timeout,
          prom,
          resolver,
          tmstmp = performance.now();
      return /*this.lastOp = */function(...args) {
          clearTimeout(timeout);
          thisArg = thisArg ?? that;
          let elapsed = performance.now() - tmstmp;
          if (resolver) {
              if (defer || (!defer && elapsed < delay)) {
                  timeout = setTimeout(() => {
                      settle(args);
                  }, delay);
              } else {
                  settle(args);
              }
              return prom;
          }
          return prom = new Promise(res => {
              resolver = res;
              timeout = setTimeout(() => {
                  settle(args);
              }, delay);
          })
      }
    },
    genElastic = range => decay => (t) => Math.max(0, 1 - Math.sin(pi_2 * (range | 0) * t) / Math.pow((pi_2 * (range | 0) * t), decay)) || 0,
    elastic = genElastic(12)(0.9),
    autoPointerMove = function({clientX:x, clientY: y}){
      const {orb, el, values:v} = this;
      if (!el.parentNode){
        document.body.removeEventListener("pointermove", el[symbols.autoPointerMove]);
        return v.autoMountAdded = 0;
      }
      orb.style.setProperty(cssVars.pointerX, x);
      orb.style.setProperty(cssVars.pointerY, y);
    },
    autoPointerDown = function({orb, el, values:v}, {clientX:x, clientY: y}){ //inherits from MouseEvent
      if (!el.parentNode) {
        _window.removeEventListener("pointerdown", el[symbols.autoPointerDown], { capture: true });
        return v.autoCaptureAdded = 0;
      }
      ch(orb).toggleClass("clicked");
    },
    parseAttrType1 = ((falsies, truthies) => function(val,
        {ifFalsey = false, ifTruthy = true, defVal = 50, min = 0, max = Infinity} 
        = {}
    ){
      if (typeof val === "symbol" || typeof val === "bigint") {return defVal}
      const valStr = (val + "").toLowerCase().trim();
      if (falsies.includes(val) || falsies.includes(valStr)) {return ifFalsey}
      if (truthies.includes(val) || truthies.includes(valStr)) {return ifTruthy}
      if (Number.isNaN(val = +val)) {return defVal}
      return Math.max(min, Math.min(val, max));
    })([false, "false", null, "null", void(0), "undefined", ""], [true, "true"]),
    _onready = function(f, ...args){
      this.ready().then(() => f.apply(this, args));
      return this;
    },
    CSSGlobalSheetLoader = function() {
      const sheets = document.adoptedStyleSheets;
      if (
        CSSGlobalSheet 
        && (
          sheets.includes?.(CSSGlobalSheet) 
          || [...sheets].includes(CSSGlobalSheet)
        )
      ) return;
      CSSGlobalSheet = CSSGlobalSheet || new CSSStyleSheet();
      CSSGlobalSheet.replaceSync(`
        @property ${cssVars.x} { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property ${cssVars.y} { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property ${cssVars.pointerX} { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property ${cssVars.pointerY} { syntax: "<number>"; inherits: true; initial-value: 0; }
      `);
      if (!Object.isSealed(sheets) && !Object.isFrozen(sheets) && "push" in sheets) {
        sheets.push(CSSGlobalSheet);
      } else {
        document.adoptedStyleSheets = [...sheets, CSSGlobalSheet];
      }
    };
  let CSSGlobalSheet = void(0);
return function pointerOrb({name, attrs, styles, props, data, el, proto}) {
  if (!el[symbols.initialized]){
    proto[symbols.initialized] = true;
    proto[symbols.nuf] = [null, void(0), false];
    proto[symbols.nue] = [null, void(0), ""];
    proto.remove = function(){
      const shell = this.shadowRoot.querySelector('#shell');
      return ch(shell).animate([{
        transform: "translate(0%, -100%)",
        opacity: 0
      }], {duration:1000, easing: "ease-in-out", fill: "both"}).lastOp.then(() => (this.parentNode.removeChild(this), this));
    }
    proto.color = function(f, v) {
      if (f instanceof Array){
        f.forEach(([f,v]) => this.color(f, v))
        return this;
      }
      const colors = Object.fromEntries(
        (ch(this).gatr("data-colors") ?? "")
        .split(",")
        .filter(Boolean)
        .reduce((ac,d,i,a) => {
          if(!(i % 2)){
            ac.push([d, a[i+1]])
          }
          return ac;
      },[]));
      colors[f] = v;
      return ch.satr("data-colors", `${Object.entries(colors).flat()}`).selected;
    }
    proto.css = function (str, pos) {
      const shadow = this.shadowRoot,
            style = shadow.querySelector("style[data-for=pointer-orb]"),
            sheet = style.sheet;
      pos = pos ?? sheet.cssRules.length;
      sheet.insertRule(str, pos);
      return this;
    }
    proto[symbols.upAttrs] = async function({values:v, el}){
      ch(el);
      v.colors = el.colors = Object.fromEntries(
        (ch.gatr("data-colors") ?? "")
        .split(",")
        .filter(Boolean)
        .reduce((ac,d,i,a) => {
          if(!(i % 2)){
            ac.push([d, a[i+1]])
          }
          return ac;
      },[]));
      v.borderRadius = ch.gatr("data-border-radius");
      v.width = ch.gatr("data-width");
      v.widthRatio = ch.gatr("data-width-ratio");
      v.aspectRatio = ch.gatr("data-aspect-ratio");
      v.padding = ch.gatr("data-padding");
      v.fadein = el.fadein = (ch.gatr("data-fadein") ?? null) !== null ? 1 : 0;
      v.backgroundPrimary = ch.gatr("data-background-primary");
      v.backgroundBubble = ch.gatr("data-background-bubble");
      v.backgroundSatellite = ch.gatr("data-background-satellite");
      v.opacity = ch.gatr("data-opacity");
      v.autoMount = !!(el.hasAttribute("data-auto-mount") ? parseAttrType1(ch.gatr("data-auto-mount")) : true);
      v.autoCapture = !!(el.hasAttribute("data-auto-capture") ? parseAttrType1(ch.gatr("data-auto-capture")) : true);
      return v;
    };
    proto[symbols.upFilter] = async function({values:v, el}){
      //el[symbols.defFilter] = el[symbols.defFilter] || el?.shadowRoot?.querySelector("#def-filter");
      el[symbols.cusFilter] = el[symbols.cusFilter] || el?.shadowRoot?.querySelector("#cus-filter");
      if(!el[symbols.cusFilter]){return}
      if(el.firstElementChild) {
        ch(el)`
          0> content: ${""}
          &> ${({values:vv}) => (n,i,c) => {
            vv.content += n.outerHTML
          }}
          -> ${el[symbols.cusFilter]}
          => ${({values:vv}) => () => ch.set("innerHTML", vv.content)}
        `
      } else {
        el[symbols.cusFilter].replaceChildren();
      }
    }
    proto[symbols.upEvents] = async function({values:v, el}) {
      if (v.autoMount) {
        if (!v.autoMountAdded) {
          v.autoMountAdded = 1;
          ch(document.body).on("pointermove", el[symbols.autoPointerMove]);
        }
      } else {
        if (v.autoMountAdded) {
          v.autoMountAdded = 0;
          ch(document.body).off("pointermove", el[symbols.autoPointerMove]);
        }
      }
      if (v.autoCapture) {
        if (!v.autoCaptureAdded) {
          v.autoCaptureAdded  = 1;
          ch(_window).on("pointerdown", el[symbols.autoPointerDown], { capture: true });
        }
      } else {
        if (v.autoCaptureAdded) {
          v.autoCaptureAdded = 0;
          ch(_window).off("pointerdown", el[symbols.autoPointerDown], { capture: true });
        }
      }
    };
    proto[symbols.upStyle] = function({values:v, el, selector, prop, val}){
      //console.log("upStyle", el);
      selector = selector.trim();
      el[symbols.stylesheet] = el[symbols.stylesheet] || el?.shadowRoot?.styleSheets?.[0];
      if (!el[symbols.stylesheet]){return proto[symbols.upStyle]}
      for (const {style, selectorText} of el[symbols.stylesheet].cssRules){
        if (selectorText?.trim() !== selector){continue}
        if (el[symbols.nuf].includes(val)) {
          style.removeProperty(prop);
        } else {
          style.setProperty(prop, val);
        }
        break;
      }
      return proto[symbols.upStyle];
    }
    proto[symbols.upStyles] = function({values:v, el, state}){
      //console.log("upStyles", el, state);
      el[symbols.upStyle]
      ({values:v, el, selector: "#shell", prop: "animation", val:`${
        v.fadein 
        ? "animation: fadein-translate-y 0.4s ease-in-out 0s 1 normal forwards running;"
        : false
      }`})
      ({values:v, el, selector: "#shell", prop: "--state", val:`${state}`})
      ({values:v, el, selector: "#shell", prop: "transform", val:`translate(0px, ${(1 - state) * -100}px)`})
      ({values:v, el, selector: "#shell", prop: "opacity", val:`${state}`})
      ({values:v, el, selector: "#center", prop: "color", val:`${v.colors.font || "var(--font-color, DarkSlateGray)"}`})
      ({values:v, el, selector: "#center", prop: "border-radius", val:`${v.borderRadius || "var(--border-radius, 50%)"}`})
      ({values:v, el, selector: "#center", prop: "padding", val:`${v.padding || "var(--padding, 4px)"}`})
      ({values:v, el, selector: "#center", prop: "opacity", val:`${v.opacity || "var(--cursor-opacity, var(--opacity, 0.6))"}`})
      ({values:v, el, selector: "#center", prop: "background", val:`${v.backgroundPrimary || "var(--bg-primary, red)"}`})
      ({values:v, el, selector: "#center::before", prop: "border-radius", val:`${v.borderRadius || "var(--border-radius, 50%)"}`})
      ({values:v, el, selector: "#center::before", prop: "background", val:`${v.backgroundBubble || "var(--bg-bubble, radial-gradient(transparent 0%, transparent 20%, pink 30%))"}`})
      ({values:v, el, selector: "#center::after", prop: "background", val:`${v.backgroundSatellite || "var(--bg-satellite, red)"}`})
      ({values:v, el, selector: "#center::after", prop: "border-radius", val:`${v.borderRadius || "var(--border-radius, 50%)"}`})
    };
    proto[symbols.upSvg] = async function({values:v, el}){
      //console.log("upSvg", el);
      if(!v.svg){return}
      /*ch(el[symbols.xyz])
      .satr("someAttribute", v.uvw);*/
      v.calcResize?.();
    };
    proto.update = async function({values, el, state}, mList, obs){
      //console.log("update", el);
      //prevent recursion
      if (mList.every(d => d.attributeName === "style")) {
        return;
      }
      LOOP:
      for (const mutRec of mList) {
        //console.log(mList);
        switch (`${mutRec.type}-${mutRec?.target?.assignedSlot ? "slot" : "host"}` ) {
          case "childList-host":
            //console.log("childList-host");
            el[symbols.upFilter]({values, el});
            break;
          case "attributes-host":
            //console.log("attributes-host");
            await el[symbols.upAttrs]({values, el});
            await el[symbols.upStyles]({values, el, state});
            await el[symbols.upSvg]({values, el});
            await el[symbols.upEvents]({values, el});
            break;
          case "characterData-host":
            //console.log("characterData-host");
            el[symbols.upFilter]({values, el});
            break;
          case "childList-slot":
            //console.log("childList-slot");
            el[symbols.upFilter]({values, el});
            break;
          case "attributes-slot":
            //console.log("attributes-slot");
            el[symbols.upFilter]({values, el});
            break;
          case "characterData-slot":
            //console.log("characterData-slot");
            el[symbols.upFilter]({values, el});
            break;
          default:
            continue LOOP;
        }
      }
    }
    Object.defineProperties(proto, {
      onready: {
        get: function(){return _onready },
        set: function(f){ this.onready(f)},
        configurable: false
      }
    });
    proto.ready = function(){
      const v = wk.get(this); //values
      return v.readyPromise;
    }
    proto.nudge = function(){
      ch(this).satr("data-nudge").selected.removeAttribute("data-nudge");
    }
    CSSGlobalSheetLoader();
  }
  const shadow = el[symbols.shadow] = el.attachShadow({ mode: "open" });
  let state = 0,
      toggle,
      calcResize;
  ch(el)`
  satr ${[["aria-hidden", "true"], ["role", "presentation"]]}
  => ${({values:v}) => () => {
    const updateDelay = +ch.gatr("data-update-delay") || 50,
          resizeDelay = +ch.gatr("data-resize-delay") || 500,
          toggleDelay = +ch.gatr("data-toggle-delay") || 50;
    v.resizeDelay = resizeDelay;
    v.toggleDelay = toggleDelay;
    el[symbols.upAttrs] = ch.throttle(el[symbols.upAttrs], {delay: updateDelay});
    el[symbols.upStyles] = ch.throttle(el[symbols.upStyles], {delay: updateDelay});
    el[symbols.upSvg] = ch.throttle(el[symbols.upSvg], {delay: updateDelay});
    el[symbols.upFilter] = ch.throttle(el[symbols.upFilter], {delay: updateDelay});
    /*ready mechanism*/
    v.readyPromise = new Promise(r => v.ready = r);
  }}
  => ${({values}) => async () => {
    if (!wk.has(el)){wk.set(el, values)}
    return el[symbols.upAttrs]({values, el});
  }}
  |> await ${({values:v}) => async () => {
    v.mutObs = el.mutObs ?? new MutationObserver(el.update.bind(el, {values:v, el, get state(){return state}}))
  }}
  |> await ${({values:v}) => async () => {
    calcResize = v.calcResize = ch.throttle(function(){
       const parent = el?.parentElement;
       if(!parent){return}
       const
        scrollBarWidth = parent.offsetWidth - parent.clientWidth,
        scrollBarHeight = parent.offsetHeight - parent.clientHeight,
        {width: w, height: h} = el?.parentElement?.getBoundingClientRect(),
        currWidth = v.width ?? ((w - scrollBarWidth) * (+v.widthRatio || 0.05)),
        currHeight = currWidth * (v.aspectRatio || 1);
       ch(el).style("--currWidth", v.width ?? ((w - scrollBarWidth) * (+v.widthRatio || 0.05)))
       .style("--currHeight", currHeight)
       .style("--currParentHeight", (h - scrollBarHeight));
    }, {delay: v.resizeDelay ?? 500});
    (v.robserver = new ResizeObserver(calcResize)).observe(el?.parentElement, {box: "border-box"});
  }}
  |> await ${({values:v}) => async () => calcResize()}
  |> await ${({values:v}) => async () => {
    ch(shadow)`
    +> ${ch.dom`
      <style data-for="pointer-orb">
          *,
          *:after,
          *:before {
            box-sizing: border-box;
          }
          :host {
            box-sizing: border-box;
            width: 0px;
            height: 0px;
            inset: 0;
            margin: 0;
            border: 0;
            position: fixed;
            padding: 0px;
            overflow: visible;
            display: block;
            font-size: 1rem;
            pointer-events: none;
            z-index: 2147483647;
          }
          #shell {
            position: absolute;
            inset:0;
            width: 0;
            height: 0;
            overflow: visible;
            pointer-events: none;
            ${v.fadein ? "animation: fadein-translate-y 0.4s ease-in-out 0s 1 normal forwards running;" : ""}
            --state: ${state};
            transform: translate(0px, ${(1 - state) * -100}px);
            opacity: ${state};
          }
          #center {
            ${cssVars.x}: 0;
            ${cssVars.y}: 0;
            ${cssVars.pointerX}: 0;
            ${cssVars.pointerY}: 0;
            pointer-events: none;
            filter: url(#def-filter);
            width: calc(var(--currWidth) * 1px);
            height: calc(var(--currHeight) * 1px);
            padding: ${v.padding || "var(--padding, 4px)"};
            opacity: ${v.opacity || "var(--cursor-opacity, var(--opacity, 0.6))"};
            overflow: visible;
            color: ${v.colors.font || "var(--font-color, DarkSlateGray)"};
            background: ${v.backgroundPrimary || "var(--bg-primary, red)"};
            border-radius: ${v.borderRadius || "var(--border-radius, 50%)"};
            position: absolute;
            top: calc((var(${cssVars.y}, 0) - var(--currHeight, 0)  / 2) * 1px);
            left: calc((var(${cssVars.x}, 0) - var(--currWidth, 0) / 2) * 1px);
            font-size: 1rem;
            animation: follow-pointer 1s 0s infinite normal none running;
            animation-composition: replace;
            --direction: atan2(calc(var(${cssVars.pointerY}) - var(${cssVars.y})), calc(var(${cssVars.pointerX}) - var(${cssVars.x})));
            --distance-proxy: min(var(--currWidth) , calc(pow(var(${cssVars.pointerY}) - var(${cssVars.y}), 2) + pow(var(${cssVars.pointerX}) - var(${cssVars.x}), 2)));
            #shell:has(+ svg #cus-filter *) & {
              filter: url(#cus-filter);
            }
          }
          #center:before {
            display: block;
            filter: none;
            width: 0%;
            height: 0%;
            border-radius: ${v.borderRadius || "var(--border-radius, 50%)"};
            background: ${v.backgroundBubble || "var(--bg-bubble, radial-gradient(transparent 0%, transparent 20%, pink 30%))"};
            position: absolute;
            top: 50%;
            left: 50%;
            opacity: 1;
            transform: translate(-50%, -50%);
            content: '';
          }
          #center.clicked:before {
            width: 80%;
            height: 80%;
            opacity: 0;
            transition: transform 1s ease, opacity 1s ease;
            transform: translate(-50%, -50%) scale(10, 10);
          }
          #center:after {
            display: block;
            width: 70%;
            height: 70%;
            border-radius: ${v.borderRadius || "var(--border-radius, 50%)"};
            background: ${v.backgroundSatellite || "var(--bg-satellite, red)"};
            position: relative;
            top: 50%;
            left: 50%;
            transform: translate(calc(-50% - cos(var(--direction)) * var(--distance-proxy) * 1px), calc(-50% - sin(var(--direction)) * var(--distance-proxy) * 1px));
            content: '';
          }
          @keyframes fadein-translate-y {
            0% {
              visibility: visible;
              transform: translate(0%, 50%);
              opacity: 0;
            }
            100% {
              transform: translate(0%,0%);
              opacity: 1;
              visibility: visible;
            }
          }
          @keyframes follow-pointer {
            to {
              ${cssVars.x}: var(${cssVars.pointerX});
              ${cssVars.y}: var(${cssVars.pointerY});
            }
          }
       </style>
    `}`
  }}
  |> await ${({values:v}) => async () => ch(shadow)
    .sappend(v.shell = ch.dom`<div id="shell"></div>`)
    .sappend(v.orb = ch.dom`<div id="center"></div>`)
    .set(symbols.ownerComponent, el)
  }
  |> await ${({values}) => async () => {
    const autoPointerMoveDelay = +ch(el).gatr("data-auto-pointer-move-delay") || 9;
    el[symbols.autoPointerMove] = throttle_v2(autoPointerMove, {thisArg: {orb: values.orb, el, values}, delay: autoPointerMoveDelay, defer: false});
    el[symbols.autoPointerDown] = autoPointerDown.bind(el, {orb: values.orb, el, values});
    el[symbols.upEvents]({values, el});
  }}
  |> await ${({values:v}) => async () => ch(shadow).append(v.svg = ch.dom`
    <svg style="display: none;">
      <defs>
        <foreignObject>
          <slot></slot>
        </foreignObject>
        <filter id="cus-filter">
        </filter>
        <filter id="def-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur"/>
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -10" result="filter"/>
          <feComposite in="SourceGraphic" in2="filter" operator="atop"/>
        </filter>
      </defs>
    </svg>
  `)}
  |> await ${({values:v}) => async () => {
    /*attach the transitionend events etc here*/
    for (let i = 0, j = []; i <= 39; ++i) {
      j.push(Math.min(1.0, elastic(i / 39)).toFixed(3));
      if (i === 39) {
        ch(v.orb).style("animation-timing-function" , `linear(${j})`);
      }
    }
    ch.on("animationiteration",function(animEvent) {
      if(animEvent.animationName === 'follow-pointer') {
        ch(v.orb).style([[cssVars.x, v.orb.style.getPropertyValue(cssVars.pointerX)], [cssVars.y, v.orb.style.getPropertyValue(cssVars.pointerY)]])
      }
    }).on("transitionend",  function(transitionEvt) {
      if (transitionEvt?.pseudoElement?.toLowerCase()?.endsWith("before")) {
          ch(this).rmClass("clicked");
          this.__transitionEnded = true;
          setTimeout(() => this.__transitionEnded = false, 17);
      }
    }).on("transitioncancel",  function(transitionEvt) {
      if (this.__transitionEnded) {return}
      if (transitionEvt?.pseudoElement?.toLowerCase()?.endsWith("before")) {
        ch(this).addClass("clicked");
      }
    });
  }}
  |> await ${({values:v}) => async () => {
    v.svg = shadow.querySelector("svg");
    toggle = v.toggle = el.toggle = ch.throttle(function({forceState, nudge} = {}){
      if (forceState !== void(0)){
        state = +!!forceState;
      } else {
        state = state ? 0 : 1;
      }
      if (nudge) {el.nudge()}
      const display = ["none", "block"][state];
      ch(v.shell).style("--state", state)
      `=> ${() => () => (!state || v.shell.getAnimations().filter(a => a.playState !== "finished").length) && ch.cancelAnimate({commit: ["transform", "opacity"]})}`
      `=> ${() => () => {
        if (state) {
          v.shell.style.setProperty("display", display, "important");
          el.style.setProperty("display", display, "important");
        }
      }}`
      .animate([{
          transform: `translate(0px, ${(1 - state) * -100}px)`,
          opacity: state,
          display
      }], {duration: 400, fill:"both", easing: "ease-in-out"})
      .lastOp
      .then(() => {
        v.shell.style.setProperty("display", display, "important");
        el.style.setProperty("display", display, "important");
      })
      .catch(() => {})
    }, {delay: v.toggleDelay ?? 50})
  }}
  |> await ${({values}) => async() => {
     return Promise.all([
      el[symbols.upFilter]({values, el}),
      el[symbols.upStyles]({values, el, state}),
      el[symbols.upSvg]({values, el})
    ]);
  }}
  |> await ${({values:v}) => async () => v.toggle()}
  |> await ${({values:v}) => async () => {shadow.querySelector("style").sheet.cssRules[2].style.setProperty("transition", "all 0.4s ease")}}
  |> await ${({values:v}) => async () => v.mutObs.observe(el, {childList: true, subtree: true, attributes: true, characterData: true})}
  |> await ${({values:v}) => async () => v.ready(true)}
  `
}})(
  (({initialized,cusClipPath,defClipPath,clipG,cusFilter,defFilter,shadow,upAttrs,upFilter,upEvents,upSvg,upStyle,upStyles,autoPointerMove,autoPointerDown,stylesheet,nuf,nue,ownerComponent}) => ({
    initialized,
    cusClipPath,
    defClipPath,
    clipG,
    cusFilter,
    defFilter,
    shadow,
    upAttrs,
    upFilter,
    upEvents,
    upSvg,
    upStyle,
    upStyles,
    autoPointerMove,
    autoPointerDown,
    stylesheet,
    nuf,
    nue,
    ownerComponent
  }))(new Proxy({},{get (t, p, r) {return Symbol(p)}}))
)

ch.adopt("pointer-orb", pointerOrb)`<pointer-orb ${{}}/>`;
