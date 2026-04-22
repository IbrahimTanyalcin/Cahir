# POINTER ORB

![gif](https://ibrahimtanyalcin.github.io/Cahir/static/gif/pointer-orb-demo.gif)
![gif](https://ibrahimtanyalcin.github.io/Cahir/static/gif/pointer-orb-demo-2.gif)

👉 [Codepen](https://codepen.io/editor/IbrahimTanyalcin/pen/019ceec8-2c8f-7fc9-aed0-a43930badcb5/e25d4fbe95c67f37ae0d9545d3dff3a7)

Pointer-orb is a pointer (mouse etc.) tracker that has a slight gooey effect that allows to track motion. It does not hijack default browser event and registers its own listeners. You can completely customize how the pointer looks and behaves by speciying your own svg filter elements and attributes.

The idea behid pointer-orb is a single html element (`#center`) that acts as a primary body. A satellite (`:after` pseudo element) that tracks the primary body with a slight sprint easing animation.

## Installation

### regular script

```html
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.1.0/dist/cahir.0.1.0.evergreen.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.1.0/collections/DOM/ch.0.1.0.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.1.0/components/pointerOrb/pointer-orb.0.1.0.js"></script>
```

### es module
```html
<script type="module" src="./components/pointerOrb/pointer-orb.0.1.0.es.js"></script>
```

If you use a bundler, it should be able to handle the dependencies. If not please reach out to me and open an issue.

## Example markup

```html
<pointer-orb data-width="60">
</pointer-orb>
```

or use your custom filters and attributes

```html
<pointer-orb data-background-bubble="green" data-background-satellite="blue" data-background-primary="lightblue" data-width="45">
  <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur"></feGaussianBlur>
  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -10" result="filter"></feColorMatrix>
  <feComposite in="SourceGraphic" in2="filter" operator="atop"/></feComposite>
</pointer-orb>
```

that's it.

## Example

Go to the [examples](../examples/) folder and run:

```shell
cd examples
node server.cjs
```

Visit `localhost:3000`

## List of Attributes:

- **data-border**:radius
- **data-width**: width of the cursor. Falls back to data-width-ratio. If data-width-ratio is not provided, falls back to 1/20th of the width of its parent.
- **data-width-ratio**: ratio of the width of this custom element wrt to its parent. It is overridden by data-width. Defaults to 0.05.
- **data-aspect-ratio**: ratio of the height to its weight. Can be bigger then 1. Defaults to 1.
- **data-padding**: sets the padding, defaults to 4px. You can use `--padding` if you don't use this attribute.
- **data-fadein**: If this attribute exists the element will start with a fadein animation upon first `connectedCallback`.
- **data-opacity**: Opacity of the cursor. Defaults to 0.6. Alternatively you can use `--cursor-opacity`.
- **data-background-primary**: The background css property of the primar body. It's value could be a single color or a graident. Basically anything that css background accepts.
- **data-background-satellite**: Same as background-primary, but for the satellite.
- **data-background-bubble**: The background css property of the bubble that grows when click/pointerdown effect is captured.
- **data-auto-mount**: By default, even if this attribute is not there, adding pointer-orb to document automatically adds an event listener to set `--pointerX` and `--pointerY` properties on the element. Set `data-auto-mount="false"` to turn it off. You will need to manuall set `--pointerX` and `--pointerY` on the component.
- **data-auto-capture**: Similar to data-auto-mount, but for click/pointer down effect. By default it is active and captures left-click, right-click or pointer-down events on the window. Since `#center` itself does not receive events, this keeps your application functional fire animating the bubble. Set `data-auto-capture="false"` to turn it off. You can run something like `component.shadowRoot.querySelector("#center").classList.add("clicked")` to manually trigger the bubble animation. If you want this class directly on the component, let me know.


## List of Methods

```js
pointerOrb.remove(); //removes the element
pointerOrb.css(ruleString, position); //insert css rule string inside the shadow dom styles at given position. Defaults to appending.
pointerOrb.ready(); //returns a promise that resolves to true when the component is ready.
pointerOrb.nudge(); //forces the component to update, firing the connected Mutation Observer
pointerOrb.toggle({forceState, nudge} = {}); //toggles the element on or off. If forceState is truthy, brings it back and vice versa. If the element is removed and readded back to DOM, set nudge to truthy when invoking this method so that events are reattached.
```

## Contributing

If this project has been useful to you, you can help to make it better via:

- submitting PR for features
- fixes / bugs that I wasn't aware of
- supporting with documentation