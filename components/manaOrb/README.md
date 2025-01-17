# mana-orb
![codepen](https://shots.codepen.io/username/pen/YPKaMdL-320.jpg?version=1737116949)

A native webcomponent that can be used as loaders or icons or designate on going processes. Includes a progress indicator.

[Play around with this codepen to get familiar](https://codepen.io/IbrahimTanyalcin/pen/YPKaMdL)

## Installation
```html
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.0.7/dist/cahir.0.0.7.evergreen.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.0.7/collections/DOM/ch.0.0.7.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.0.7/components/manaOrb/mana-orb.0.0.7.js"></script>
```

3 scripts above amount to 15Kb in total, gziped.

## Example markup
```html
<mana-orb 
  data-colors="background,transparent,stroke,orange"
  data-width-ratio="0.6" 
  data-aspect-ratio="1" 
  data-href-texture="https://distreau.com/assets/img/texture.png"
  data-href-overlay="https://distreau.com/assets/img/glare.png"
  data-update-delay="20" 
  data-stroke-width="2" 
  data-progress="1">
</mana-orb>
```

Default cutout is a circle. If you want to change that, add child:

```html
<mana-orb>
  <path d="..."/>
</mana-orb>
```

If your cutout clip is complex, use a `g` element to group.

The parentmost svg inside `shadowRoot` has a `viewBox` of `0 0 1 1`. If your custom clip is designed for a much bigger viewBox, your options are either to update the attributes or use `transform` to scale it down:

```html
<mana-orb>
  <path transform="translate(0.5 0.5) scale(0.01) translate(-50 -50)" d="m 93.102467,88.879897 c 5.327891,-5.333401...../>
</mana-orb>
```

Above first translates the element to origin (`translate(-50 -50)`), scales it by 0.01 and then translates it back to center (`translate(0.5 0.5)`). (Read the svg transforms from RIGHT TO LEFT) For a live example, [see the wizard hat](https://codepen.io/IbrahimTanyalcin/pen/YPKaMdL)

## List of Attributes:

- **data-colors**: define colors stoke, fill, background etc. Comma separated list of part, followed by color.
- **data-border**-radius
- **data-background-opacity**
- **data-width-ratio**: ratio of the width of this custom element wrt to its parent. You can override this with your custom css.
- **data-aspect-ratio**: ratio of the height to its weight. Can be bigger then 1. You can override this with your custom css.
- **data-padding**
- **data-fadein**: If this attribute exists the element will start with a fadein animation upon first `connectedCallback`.
- **data-href-texture**: the texture for the filter to use. Could be png/jpg etc.
- **data-href-overlay**: the texture for the overlay image. Empty string or null value hides the overlay.
- **data-overlay-opacity**
- **data-duration**: the duration of the repeating animation. Bigger values makes the texture flow slower.
- **data-from**: used in conjunction with `data-to`. 0,0 is top corner. if `data-from` is "0,1" and `data-to` is "1,0", the texture flows from bottom left to top right.
- **data-to**
- **data-fill**: See https://www.w3.org/TR/SVG11/animate.html
- **data-begin**: See https://www.w3.org/TR/SVG11/animate.html
- **data-repeat-count**: See https://www.w3.org/TR/SVG11/animate.html
- **data-paused**: If the attribute is there, it pauses the animation
- **data-progress**: vertical progress from 0 to 1, float.
- **data-progress-right**: horizontal progress from 0 to 1, float.
- **data-stroke-width**: stroke width of the cutout shape. Default is circle.
- **data-filter-opactity**: opacity of the animated texture. [See](https://codepen.io/IbrahimTanyalcin/pen/YPKaMdL)
- **data-update-delay**: Attribute updates are batched and throttled. This attribute defines the interval these updates are called, in ms. Default 50.
- **data-resize-delay**: Unless you have custom css, the element will resize itself if the parent dimensions change. This value determines the interval, in ms, of resize calls. Default 500.
- **data-toggle-delay**: The animation duration of `el.toggle()` calls. Default 50, in ms.

## Credits
The idea of using `animateTransform` to animate a pattern is not mine, see this [great twitter post](https://x.com/bbssppllvv/status/1844450794298634307).