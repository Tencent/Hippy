# Transform

This type of style can make some basic deformations to the component elements, such as scaling, rotating, twisting, and so on.

# transform

`transform` You can pass in multiple deformed parameter arrays to complete the transform of the original element. For example:

```jsx
transform: [{ rotateX: '45deg' }, { rotateZ: '0.785398rad' }]
```

It is similar to the transform parameter of CSS, see the [mdn](//developer.mozilla.org/en-US/docs/Web/CSS/transform) for details.

| Type                                                                                                                                                                                                                                                                                                                                                    | Required |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |----------|
| array of object: { perspective: number }, object: { rotate: string }, object: { rotateX: string }, object: { rotateY: string }, object: { rotateZ: string }, object: { scale: number }, object: { scaleX: number }, object: { scaleY: number }, object: { translateX: number }, object: {translateY: number}, object: { skewX: string }, object: { skewY: string }| false    |
