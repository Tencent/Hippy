# Style

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

# CSS selector and support for scoped

At present, the basic `ID`、`Class`、`Tag` selectors have been implemented, and the basic nesting relationship can be supported. The rest selectors and scoped are not supported yet.



