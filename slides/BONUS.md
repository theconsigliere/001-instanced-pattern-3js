# Bonus effects

Bringing the demo to life with the little things that matter: Animation and gradient easings

---

# Preparing for Animation

---

Add an animation uniform

```javascript
let material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: uTime,
    uFade: {value: 1.},
    uBackground:    { value: palette.BG },
    uPalette0:      { value: sinPalette.c0},
    uPalette1:      { value: sinPalette.c1},
    uPalette2:      { value: sinPalette.c2},
    uPalette3:      { value: sinPalette.c3},
    uPaletteOffset: { value: sinPalette.offset},
  },
});
```

---

Update the squish function in the vertex shader

When fade is 0, this forces everything to squish. And because the squish value drive the blending, it blends with the background as well

```glsl
 float squish = smoothstep( -1.,1., mix(-1., activation, uFade));
```

---

Then in Javascript, animate the value with a nice easing.

```javascript
let t1 = gsap.timeline()
t1.fromTo(
  material.uniforms.uFade,
  { value: 0 },
  { value: 1, duration: 3, ease: "power2.out" }
);
```

---

## Explore how you can modify the animation!

You can use the instance attribute for change how it appears aswell!

---

# Gradient easings

Details like these are what make a project amazing.

---

### Fragment shader

Instead of using vUv.y or other gradients directly. We pass them through an easing creating a nicer blend instead of a linear blend.

- [glsl-easings](https://github.com/glslify/glsl-easings/tree/master)

```glsl
float ease(float t) {
  return -0.5 * (cos(PI * t) - 1.0);
}

void main() {
  // ...

  color = mix(uBackground, color, ease(vUv.y) );
  gl_FragColor = vec4(color, 1.);
}
```

---

Changing the color frequency. Only yellow at the top

```
color = mix(paletteColor, uBackground, cos(vSquish * PI * 1.) ); // -1 to 1
```

---

### Scaling down instances

```glsl
  transformed.y += -0.5;
  transformed.y *= smoothstep(20., 10., len);
  transformed.y += 0.5;
```

---

Instead of scaling from the center we can scale from the top aswell

```glsl
  transformed.y += 0.5;
  transformed.y = transformed.y * 0.2 + transformed.y * 0.8 * squish;
  transformed.y += 0.5;
```
---

Making the movement loop and change in interesting ways

```
  float activation = sin(len * 0.3 - cos(uTime * 2. + len * 0.1) * 4.0);  // -1 to 1
```

---

Making length grow exponencially 

```
  len = len * len;
```

---
# Go beyond!

---

You can control more values with uniforms, or even connect the instance position to the intro animation, you can increase the size of the grid and scale down the tubes near the edge. A lot of possibilities! 

We’ll learn how to work with the instances further in the next project!
