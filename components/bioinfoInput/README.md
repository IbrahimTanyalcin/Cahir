# mana-orb
![codepen](https://assets.codepen.io/1773517/internal/screenshots/pens/GRLVdMY.custom.png?version=1746796817)

A native webcomponent that can be used as input field.

[Play around with this codepen to get familiar](https://codepen.io/IbrahimTanyalcin/pen/GRLVdMY)

## Installation

### regular script

```html
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.0.10/dist/cahir.0.0.10.evergreen.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.0.10/collections/DOM/ch.0.0.10.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cahir@0.0.10/components/bioinfoInput/bioinfo-input.0.0.10.js"></script>
```

### es module
```html
<script type="module" src="./components/bioinfoInput/bioinfo-input.0.0.10.es.js"></script>
```

If you use a bundler, it should be able to handle the dependencies. If not please reach out to me and open an issue.

## Example markup
```html
<bioinfo-input 
  data-label="hello!!!" 
  data-fadein data-anycase data-colors="font,#e1e1ff,heading,#818cab,border,#9090b0,shadow,#9090b044,hover,#30304525">
</bioinfo-input>

```

## List of Attributes:

- **data-colors**: define colors stoke, fill, background etc. Comma separated list of part, followed by color.
- **data-label**: input label
- **data-fadein**: boolean attribute to start fadein animation when component is first attached
- **data-anycase**: boolean attribute to support both lowercase and uppercase

## List of Methods:

- **element.value()**: returns the current value, if `data-anycase`is NOT there, always returns uppercase.
- **element.disable()**: disables the component, user cannot provide input
- **element.enable()**: enables the component.

## List of css variables

Below variables are **OPTIONAL**. You can also provide similar colors via `data-colors` attribute. The attribute takes PRECEDENCE over below variables.

- --heading-color
- --border-color
- --shadow-color
- --font-color
- --hover-color
- --bg-color-transparent


## Credits