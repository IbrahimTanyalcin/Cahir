import ch from "../../collections/DOM/ch.0.0.10.es.js";
const manaOrb = ((symbols) => function manaOrb({name, attrs, styles, props, data, el, proto}) {
    if (!el[symbols.initialized]){
      proto[symbols.initialized] = true;
      proto[symbols.nuf] = [null, void(0), false];
      proto[symbols.nue] = [null, void(0), ""];
      proto.remove = function(){
        return ch(this).animate([{
          transform: "translate(0%, -100%)",
          opacity: 0
        }], {duration:1000, easing: "ease-in-out", fill: "both"}).lastOp.then(() => (this.parentNode.removeChild(this), this));
      }
      proto.filterOpacity = function(v) {
        /*const shadow = this.shadowRoot,
              [filter, pattern, rect] = shadow.querySelectorAll("#displacement-filter, #imagePattern, #filter-rect");*/
        this.setAttribute("data-filter-opacity", v); 
        return this;
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
              style = shadow.querySelector("style[data-for=mana-orb]"),
              sheet = style.sheet;
        pos = pos ?? sheet.cssRules.length;
        sheet.insertRule(str, pos);
        return this;
      }
      proto.play = function() {
        this.removeAttribute("data-paused"); return this;
      }
      proto.pause = function() {
        this.setAttribute("data-paused", ""); return this;
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
        v.backgroundOpacity = ch.gatr("data-background-opacity");
        v.widthRatio = ch.gatr("data-width-ratio");
        v.aspectRatio = ch.gatr("data-aspect-ratio");
        v.padding = ch.gatr("data-padding");
        v.fadein = el.fadein = (ch.gatr("data-fadein") ?? null) !== null ? 1 : 0;
        v.hrefTexture = ch.gatr("data-href-texture");
        v.hrefOverlay = ch.gatr("data-href-overlay");
        el[symbols.nue].includes(v.overlayOpacity = ch.gatr("data-overlay-opacity")) 
          ? v.overlayOpacity = 1 
          : void(0);
        //animateTransform
        v.animDur = ch.gatr("data-duration") || "3s";
        v.animBegin = ch.gatr("data-begin") || "0s";
        v.animFrom = ch.gatr("data-from") || "0,0";
        v.animTo = ch.gatr("data-to") || "1,0";
        v.animFill = ch.gatr("data-fill") || "freeze";
        v.animRepCount = ch.gatr("data-repeat-count") || "indefinite";
        v.paused = el.hasAttribute("data-paused"); //TODO: add to ch 'hatr'
        //progress
        v.progress = ch.gatr("data-progress") || "1";
        v.progressRight = ch.gatr("data-progress-right") || "1";
        //stroke
        v.strokeWidth = (+ch.gatr("data-stroke-width") || 0) * 2;
        //filter
        v.filterOpacity = ch.gatr("data-filter-opacity") ?? 1;
        el[symbols.nue].includes(v.filterScale = ch.gatr("data-filter-scale")) 
          ? v.filterScale = 0.65
          : void(0);
        return v;
      };
      proto[symbols.upClipPath] = async function({values:v, el}){
        //console.log("upClipPath", el);
        el[symbols.clipG] = el[symbols.clipG] || el?.shadowRoot?.querySelector("#clip-g");
        el[symbols.strokeG] = el[symbols.strokeG] || el?.shadowRoot?.querySelector("#stroke-g");
        el[symbols.strokeGParent] = el[symbols.strokeGParent] || el?.shadowRoot?.querySelector("#stroke-g-parent");
        if(el.firstElementChild) {
          el[symbols.cusClipPath] = el[symbols.cusClipPath] || el?.shadowRoot?.querySelector("#cusClip");
          if (!el[symbols.cusClipPath]){return}
          ch(el[symbols.cusClipPath])`
          >> innerHTML outerHTML: ${el.firstElementChild.outerHTML} 
          -> ${el[symbols.strokeG]}
          >> innerHTML ${({values:vv}) => vv.outerHTML}
          -> ${el[symbols.strokeGParent]}
          satr clip-path ${"url(#cusClip)"}
          -> ${el[symbols.clipG]} 
          satr clip-path ${"url(#cusClip)"}`
        } else {
          el[symbols.defClipPath] = el[symbols.defClipPath] || el?.shadowRoot?.querySelector("#defClip");
          ch(el[symbols.clipG]).satr("clip-path", "url(#defClip)")
          (el[symbols.strokeGParent]).satr("clip-path", "url(#defClip)")
          (el[symbols.strokeG]).set("innerHTML", el[symbols.defClipPath].firstElementChild.outerHTML);
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
        ({values:v, el, selector: ":host", prop: "height", val:`calc(var(--currWidth) * ${v.aspectRatio || 1} * 1px)`})
        ({values:v, el, selector: ":host", prop: "padding", val:`${v.padding || "var(--padding, 4px)"}`})
        ({values:v, el, selector: ":host", prop: "color", val:`${v.colors.font || "var(--font-color, DarkSlateGray)"}`})
        ({values:v, el, selector: ":host", prop: "background-color", val:`${v.colors.background || "var(--bg-color, #f9f9f9)"}`})
        ({values:v, el, selector: ":host", prop: "border-radius", val:`${v.borderRadius || "var(--border-radius, 4px)"}`})
        ({values:v, el, selector: ":host", prop: "animation", val:`${
          v.fadein 
          ? "animation: fadein-translate-y 0.4s ease-in-out 0s 1 normal forwards running;"
          : false
        }`})
        ({values:v, el, selector: ":host", prop: "--state", val:`${state}`})
        ({values:v, el, selector: ":host", prop: "transform", val:`translate(0px, ${(1 - state) * -100}px)`})
        ({values:v, el, selector: ":host", prop: "opacity", val:`${state}`})
        ({values:v, el, selector: "path", prop: "stroke", val:`${v.colors.stroke || "var(--stroke-color, #9098a9)"}`})
        ({values:v, el, selector: "path", prop: "fill", val:`${v.colors.fill || "none"}`})
      };
      proto[symbols.upSvg] = async function({values:v, el}){
        //console.log("upSvg", el);
        if(!v.svg){return}
        el[symbols.pattern] = el[symbols.pattern] || v.svg.querySelector("#imagePattern");
        el[symbols.animateTransform] = el[symbols.animateTransform] || v.svg.querySelector("animateTransform");
        el[symbols.svgImage] = el[symbols.svgImage] || v.svg.querySelector("#source-image");
        el[symbols.svgOverlay] = el[symbols.svgOverlay] || v.svg.querySelector("#source-overlay");
        el[symbols.maskG] = el[symbols.maskG] || v.svg.querySelector("#mask-g");
        el[symbols.maskRect] = el[symbols.maskRect] || v.svg.querySelector("#progress-rect");
        el[symbols.strokeG] = el[symbols.strokeG] || el?.shadowRoot?.querySelector("#stroke-g");
        el[symbols.filterRect] = el[symbols.filterRect] || el?.shadowRoot?.querySelector("#filter-rect");
        el[symbols.displacementFe] = el[symbols.displacementFe] || el?.shadowRoot?.querySelector("#displacement-fe");
        ch(el[symbols.animateTransform])
        .satr([["dur", v.animDur], ["begin", v.animBegin], ["from", v.animFrom], ["to", v.animTo], ["fill", v.animFill], ["repeatCount", v.animRepCount]])
        .exec(() => {
          const 
            a = !!el[symbols.isPaused],
            b = !!v.paused;
          switch (true) {
            case a && b:
            case !a && !b:
              break;
            case !a && b:
              el[symbols.isPaused] = 1;
              //ch.selected.endElement(); iOS 18 bug
              el[symbols.animateTransform].remove();
              break;
            case a && !b:
              el[symbols.isPaused] = 0;
              //ch.selected.beginElement(); iOS 18 bug
              el[symbols.pattern].appendChild(el[symbols.animateTransform]);
          }
        })
        (el[symbols.svgImage])
        .satr("href", v.hrefTexture)
        (el[symbols.svgOverlay])
        .satr([["href", v.hrefOverlay || ""], ["opacity", v.overlayOpacity]])
        (el[symbols.maskRect])
        .satr("transform", `translate(${v.progressRight - 1}, ${1 - v.progress})`)
        (el[symbols.strokeG])
        .style([["stroke", `${v.colors.stroke || "var(--stroke-color, #9098a9)"}`], ["stroke-width", v.strokeWidth / 100/*v.svg.getScreenCTM().a*/]])
        (el[symbols.filterRect])
        .satr("opacity", v.filterOpacity)
        (el[symbols.displacementFe])
        .satr("scale", v.filterScale);
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
              el[symbols.upClipPath]({values, el});
              break;
            case "attributes-host":
              //console.log("attributes-host");
              await el[symbols.upAttrs]({values, el});
              await el[symbols.upStyles]({values, el, state});
              await el[symbols.upSvg]({values, el})
              break;
            case "characterData-host":
              //console.log("characterData-host");
              el[symbols.upClipPath]({values, el});
            case "childList-slot":
              //console.log("childList-slot");
              el[symbols.upClipPath]({values, el});
              break;
            case "attributes-slot":
              //console.log("attributes-slot");
              el[symbols.upClipPath]({values, el});
              break;
            case "characterData-slot":
              //console.log("characterData-slot");
              el[symbols.upClipPath]({values, el});
              break;
            default:
              continue LOOP;
          }
        }
      }
    }
    const shadow = el[symbols.shadow] = el.attachShadow({ mode: "open" });
    let state = 0,
        toggle,
        calcResize;
    ch(el)`
    => ${({values:v}) => () => {
      const updateDelay = +ch.gatr("data-update-delay") || 50,
            resizeDelay = +ch.gatr("data-resize-delay") || 500,
            toggleDelay = +ch.gatr("data-toggle-delay") || 50;
      v.resizeDelay = resizeDelay;
      v.toggleDelay = toggleDelay;
      el[symbols.upAttrs] = ch.throttle(el[symbols.upAttrs], {delay: updateDelay});
      el[symbols.upClipPath] = ch.throttle(el[symbols.upClipPath], {delay: updateDelay});
      el[symbols.upStyles] = ch.throttle(el[symbols.upStyles], {delay: updateDelay});
      el[symbols.upSvg] = ch.throttle(el[symbols.upSvg], {delay: updateDelay});
    }}
    => ${({values}) => async () => {
      return el[symbols.upAttrs]({values, el})
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
          {width: w, height: h} = el?.parentElement?.getBoundingClientRect();
         ch(el).style("--currWidth", (w - scrollBarWidth) * (+v.widthRatio || 0.95))
         .style("--currHeight", (h - scrollBarHeight));
      }, {delay: v.resizeDelay ?? 500});
      (v.robserver = new ResizeObserver(calcResize)).observe(el?.parentElement, {box: "border-box"});
    }}
    |> await ${({values:v}) => async () => calcResize()}
    |> await ${({values:v}) => async () => {
      ch(shadow)`
      +> ${ch.dom`
        <style data-for="mana-orb">
            *,
            *:after,
            *:before {
              box-sizing: border-box;
            }
            :host {
              box-sizing: border-box;
              width: calc(var(--currWidth) * 1px);
              height: calc(var(--currWidth) * ${v.aspectRatio || 1} * 1px);
              margin: auto;
              padding: ${v.padding || "var(--padding, 4px)"};
              overflow-y: auto;
              color: ${v.colors.font || "var(--font-color, DarkSlateGray)"};
              background-color: ${v.colors.background || "var(--bg-color, #f9f9f9)"};
              border-radius: ${v.borderRadius || "var(--border-radius, 4px)"};
              display: grid;
              position: relative;
              font-size: 1rem;
              container: component-container;
              container-type: inline-size;
              grid-template-columns: repeat(2, 1fr);
              grid-template-rows: repeat(2, 1fr);
              grid-template-areas:
                  "q q"
                  "q q";
              ${
                v.fadein 
                ? "animation: fadein-translate-y 0.4s ease-in-out 0s 1 normal forwards running;"
                : ""
              }
              --state: ${state};
              transform: translate(0px, ${(1 - state) * -100}px);
              opacity: ${state};
            }
            svg, path, rect, circle {
              transition: all 0.4s ease;
            }
            svg {
              display: block;
              position: absolute;
              inset: 0;
              pointer-events: none;
              width: 100%;
              height: 100%;
              transform: translate(0px, -0px);
            } 
            path {
              fill: ${v.colors.fill || "none"};
              stroke: ${v.colors.stroke || "var(--stroke-color, #9098a9)"};
              stroke-linejoin: round;
              stroke-linecap: round;
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
            /*@container component-container (max-width: 100px) {
              svg {
              }
            }*/
         </style>
      `}`
    }}
    |> await ${({values:v}) => async () => ch(shadow).append(v.svg = ch.dom`
      <svg id="main-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none">
        <defs>
          <foreignObject>
            <slot></slot>
          </foreignObject>
          <filter id="displacement-filter" filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" color-interpolation-filters="sRGB">
            <feImage id="displacement-map" href="data:image/jpeg;base64,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cUAUAkEkziomgGgkoxZGgxZFQFQlYnQHRdPfj/10KCSCKESCNiVkViPSLpD0h6I0Q0I0A2IoBWBIJIBKBIJoJIJ2R2J0JWBUJ0JUB0XTv479dFZDYiglYigkhEgjZFQjRFQjRFQjQigFYigHYigmgEgmglYlYnQlQlYlQHQlQnQ9P/kf1yVkNiNCNkNiVENiNiViNEViNkVCVgKCViViViSCViSCVgdCViVCViVCdgVCVCdD1D+U/XBWQ2I0I2Q2JUQ2I0JWQ0I2JUQ2JUI2JUI2J0JWJWJWA2R0BWJ0I2JUJ2BUJUJ0P//EABkQAQEBAQEBAAAAAAAAAAAAAAECABEDEP/aAAgBAQABAgB1atWrVq1atWrVq1atWrVq1atWrVq1atWrVq+OrVq1atWrVq1atWrVq1atWrVq1atWrVq1atXxVppppppdWrVq1atWrVq1NNNNNNNNNNNPVWmmmmms6tWrVq1atWpppppppppppppp6q0000uc51atWrVq1ammmmmmmmmmmmmt1Vpppc5znVq1atWrVqaaaaaaaaaaaaaeqtNLnOc51atWrVq1ammmmmmmmmmmmmnqrS5znOc6tWrVq16222mmmmmmlVppp6tKuc5znOrVq1a9TbbbbTTTTTSq000qtLnOc5zq1atWrW0222200000qqqtKqrnOc5zq1atTbbbbbbbbTTTSqqqqqq5znOc6tTTTbbbbbbbbTTTSqqqqrlVznOctNNNtttttttttNNNNKqqqrqznKqrTTTTbbbbbbbbbTTTSqqqqrqznOc5aaaabbbbbbbbbaaaaVVVVVdWc5znVq1NNttttttttttNNKqqqqudWc5znVq16tbbbbbbbbbbTTSqqqq5XVnOc6tWrVrb1tttttttttNNKqqqqrWrK5VWmmm2230bbbbbbaaaXOc5zlVa1KuVVppptttt9G22222mmlzlVznK6tWVVWmmmm2222222222mlznOc5znLWppVVWmmm22222229bTWrOc5znOcq1qaaVpWmm222222229erVqznOc5znKtatStK0rTbTTbbbberXr1as5znOc5aVpppppWlabaabbbb1ta9WrVnOc5znU0rTTTTTTTTTbTTbbbTWvVq1as5znOdTTStNNNNNNNNNtNNtttN6tWvVq1ZznOrU00rTTTTTTTTTTTTTbTWvVq1atWrOc6tTTTStNNNNNNNNNNtNNtNa9WrVq1Z1Z1NNNNNK1q1NNNNNNNNNNNtNatWrVq1atWrU00000rWrVq1atWrVq1alaaa1atWrVq1NNNammmmla1atWrVq1aterVq16tWrVnVqa1NK1qaaaVX/xAAWEAADAAAAAAAAAAAAAAAAAAAhgJD/2gAIAQEAAz8AaExf/8QAGhEBAQEBAQEBAAAAAAAAAAAAAQISEQADEP/aAAgBAgEBAgDx48ePHjx48ePHjx48ePHjx48ePHjx48ePHj86IiIiIiInjx48ePHjx48IiIiIj0oooooooooRERER73ve60UUUUUUVrWiiiiiihERERER73ve97ooooorRWiiiiihKERERER73ve973RRRRWtFFFFFFCIiIiIiPe973ve60UUVrRRRRRRQiIlCIiI973ve973pRRWiiiiiiiiiiiiiiihEe973ve973RRWtFFFFFFFFFFFFFFFFFFa13ve973WitaKKKKKKKKKKKKKKKKKK1rWtd1rutFa1oooooooooooosssooorWta1rWta1rRRRRRRRRRRZZZZZZZZZWta1rWta1rRRRRRRRRZZZZZZZZZZZZe9a1rWta1rWitaKLLLLLLLLLLLLLLLLL3rWta1rWtFbLLLLLLLLLLLLLLLLLLLL3vWta1rWita1ssssssss+hZZZZZZZZe961rWta0Vre97LLLLLLLLLLLPoWWWWWXrWta1oorWta3ssss+hZZZZ9Cyyyyyyyyiita1orWta1ve9llllllllllllllllFFa0VorWta1ve9llllllllllllllllllFFFaK1rWta1rWiyyyyyyyyyyyyiiiiiiitFFa1rWta1oosoosssssoooosoooorRRRWta1rWta0UUUUUWUUUUUUUUUUUVoooorWta1rWtaKKKKKKmiiiiiiiiiiiiiiitd73ve61oSiiipoqaKKKKKKKKKK0UUUVrve973vREREZoSihEooooorRRRRWtd73ve9EREREREoSiiiiitFllllla73ve9ERERERESiiiiiitH0PoWWWWVrXe96IiIiMoiJRRRRRRWjwlFFllllFFd6IiIiIlCUUUUUUUUUePHjx48ePCIiIiIiIiUUUUUUUUUUUePHjx48ePHjx48ePHjx48IiUUUUUUJRRRX//xAAWEQADAAAAAAAAAAAAAAAAAAABYJD/2gAIAQIBAz8AtEV7/8QAFxEBAQEBAAAAAAAAAAAAAAAAAAECEP/aAAgBAwEBAgCtNNNNNNNNNNNNNNNNNNNNNNNNNNNNNcrTTTTTTTTTTTTTTTTTTTTTTTTTTTTTXKrTTTTTTTU000000000000000000001FVpppppqampqaaaaaaaaaaaaaaaaaaaa5Vaaaaampqampqammmmmmmmmmmlaaaaaaiq0001NTU1NTU1NTTTTTTTTTTSqqtNNNcqtNNSyzU1LNTU1NTTTTTTTTTSqqq001ytNLLLLNTU1NTU1NTbbbTTTTTSqqq001ytNLLLLLNTU1NTU3NttttNNNNNKqq001KrSyyyyyzU1NTU3Nzc02220000qqqqrSqqyyyyyzU1NTU3Nzc3NttttNNNKqqqqqqssssss1NTU3Nzc3NzbbbbTTTSqqqqqqrLLLLLNTU1Nzc3Nzc22220000qqqqqqqqssss1NTU3Nzc3NzbbbbbTTSqqqqqqqqqqzU1NTc3Nzc3Nzbc22000qqqqqqqqqqqtTU3Nzc3Nzc3NtzbTTSqqqqrKqqqqqtNNzc23Nzc3Nzc3NTU1KqqqrKqqqqqtNNNNttzc3Nzc3NzU1NLLLLLKqqqqqqqq0022223Nzc3NzU1NSyyyyyyqqqqqqqrTTbbbbc3Nzc3NTU1LLLLLLKsqqqqqqrTTTTbbbc3Nzc1NTUsssssssqqqqqqrTTTTTbbbTc3NTU1NTUsssssqqqqqqqq0000222023NTU1NTUsssssqqqqqqqq000000003NTU1NTU1LLLLLNKrTSqqqqtNNNNNNtNNTU1NSzUssss00qq0qqqqrTTTTTTTTTU1NTUs1LLLNNNKrTTTSqqq00000000001NTU1LNTU0000qtNNNKqqqtNNNNNNNNTU1NTUs1NNNNNKss1NNNK00qtK0000001NNTU0s000000qq000001NKrStNNNNK1NNNNStNNNNNKqtNNNNNNNK0000000rU0000rTTTTTSq00000rTTTTTTTTTTTTTTTTStNNNNKr/xAAUEQEAAAAAAAAAAAAAAAAAAACg/9oACAEDAQM/AAAf/9k=" result="displacementMap" preserveAspectRatio="none" />
            <feDisplacementMap id="displacement-fe" in="SourceGraphic" in2="displacementMap" scale="0.65" xChannelSelector="R" yChannelSelector="B" />
          </filter>
          <pattern id="imagePattern" patternTransform="translate(0,0)" patternContentUnits="objectBoundingBox" patternUnits="objectBoundingBox" width="1" height="1">
            <image id="source-image" href="${v.hrefTexture}" width="1" height="1" preserveAspectRatio="none"/>
            <animateTransform id="anim-pattern" begin="0s" attributeName="patternTransform" type="translate" from="0,0" to="1,0" dur="3s" repeatCount="indefinite" fill="freeze"/>
          </pattern>
          <clipPath id="defClip" clipPathUnits="userSpaceOnUse">
            <circle cx="0.5" cy="0.5" r="0.5"></circle>
          </clipPath>
          <clipPath id="cusClip" clipPathUnits="userSpaceOnUse"></clipPath>
          <mask id="progress-mask" maskUnits="objectBoundingBox" preserveAspectRatio="none">
            <rect 
              id="progress-rect"
              width="1" 
              height="1" 
              x="0" 
              y="0" 
              fill="white" 
              transform="translate(0, 0)" 
            />
          </mask>
        </defs>
        
        <g id="mask-g" mask="url(#progress-mask)">
          <g id="clip-g" clip-path="url(#defClip)">
            <rect id="filter-rect" width="1" height="1" fill="url(#imagePattern)" filter="url(#displacement-filter)" />
          </g>
        </g>
        <g clip-path="url(#defClip)" id="stroke-g-parent">
          <image id="source-overlay" href="${v.hrefOverlay}" x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice" />
          <g id="stroke-g"style="transition: all 0.4s ease; fill: transparent; stroke: ${v.colors.stroke || "var(--stroke-color, #9098a9)"}; stroke-width: 0;">
          </g>
        </g>
      </svg>
    `)}
    |> await ${({values:v}) => async () => {
      v.svg = shadow.querySelector("svg");
      toggle = v.toggle = el.toggle = ch.throttle(function(){
        //console.log("toggle", el);
        state = state ? 0 : 1;
        const display = ["none", "grid"][state];
        ch(el).style("--state", state)
        `=> ${() => () => (!state || el.getAnimations().filter(a => a.playState !== "finished").length) && ch.cancelAnimate({commit: ["transform", "opacity"]})}`
        `=> ${() => () => state && el.style.setProperty("display", display, "important")}`
        .animate([{
            transform: `translate(0px, ${(1 - state) * -100}px)`,
            opacity: state,
            display
        }], {duration: 400, fill:"both", easing: "ease-in-out"})
        .lastOp
        .then(() => el.style.setProperty("display", display, "important"))
        .catch(() => {})
      }, {delay: v.toggleDelay ?? 50})
    }}
    |> await ${({values}) => async() => {
       return Promise.all([
        el[symbols.upClipPath]({values, el}),
        el[symbols.upStyles]({values, el, state}),
        el[symbols.upSvg]({values, el})
      ]);
    }}
    |> await ${({values:v}) => async () => v.toggle()}
    |> await ${({values:v}) => async () => {shadow.querySelector("style").sheet.cssRules[1].style.setProperty("transition", "all 0.4s ease")}}
    |> await ${({values:v}) => async () => v.mutObs.observe(el, {childList: true, subtree: true, attributes: true, characterData: true})}
    `
  })(
    {
      initialized: Symbol("initialized"),
      cusClipPath: Symbol("cusClipPath"),
      defClipPath: Symbol("defClipPath"),
      clipG: Symbol("clipG"),
      maskG: Symbol("maskG"),
      strokeG: Symbol("strokeG"),
      strokeGParent: Symbol("strokeGParent"),
      maskRect: Symbol("maskRect"),
      filterRect: Symbol("filterRect"),
      displacementFe: Symbol("displacementFe"),
      shadow: Symbol("shadow"),
      upAttrs: Symbol("upAttrs"),
      upSvg: Symbol("upSvg"),
      upStyle: Symbol("upStyle"),
      upStyles: Symbol("upStyles"),
      upClipPath: Symbol("upClipPath"),
      stylesheet: Symbol("stylesheet"),
      svgImage: Symbol("svgImage"),
      svgOverlay: Symbol("svgOverlay"),
      pattern: Symbol("pattern"),
      animateTransform: Symbol("animateTransform"),
      isPaused: Symbol("isPaused"),
      nuf: Symbol("nuf"),
      nue: Symbol("nue")
    }
  )
  
  ch.adopt("mana-orb", manaOrb)`<mana-orb ${{}}/>`
  
  