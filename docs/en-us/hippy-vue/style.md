# Styles

Standard Hippy does not allow units of length - but for browser compatibility, hippy-vue uses the 1px = 1pt conversion scheme - which removes the px from the CSS unit and turns it into a number without units in Hippy.

However, there are still some problems. If relative units such as rem and vh are written into Hippy business, it may be more important to find and avoid more significant risks in time. Therefore, only px units are converted now, and other units are allowed to be reported errors at the terminal level.

HippyVue provides `beforeLoadStyle` Vue options hook function, for developers to do custom modify CSS styles, such as

```js
    new Vue({
      // ...
      beforeLoadStyle(decl) {
         let { type, property, value } = decl;
         console.log('property|value', property, value); // => height, 1rem
          // For example, process the rem units 
         if(typeof value === 'string' && /rem$/.test(value)) {
             // ...value = xxx
         } 
         return { ...decl, value}
      }
    });
```

# CSS Selector

At present, the basic `Universal`, `Type`, `ID`, `Class`, `Grouping` selectors have been implemented, and the basic combinators except for sibling have been supported.


## Scoped & Attribute

> `2.15.0` support Vue `scoped` style, `2.15.2` support to merge styles on root element of child component.

> `2.15.1` support `Attribute` selector and Vue `deep` selector.

How to use?

1. Update `@hippy/vue` and  `@hippy/vue-css-loader` to `2.15.1+` version.
2. Vue2.0 set `Vue.config.scoped = true;`（Vue2.0 `scoped` and `Attribute` disabled by default，Vue3.0 enabled by default）



