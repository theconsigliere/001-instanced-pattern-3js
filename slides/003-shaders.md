# Shader effects

Using the instance attribute to drive our effects.

---

### Shader refresher

If you need to refresh your memory on shaders: Intro to Shaders for Web Developers
[https://offscreencanvas.com/courses/intro-to-shaders](https://offscreencanvas.com/courses/intro-to-shaders):
---

## Vertex shader instances squish

This is not only a transformation of the geometry, but it’s also going to drive the color later on.

---

Jump into your vertex shader and calculate the distance to the origin.

This length function is going to create a radial gradient from the center.

```jsx
// ...
void main() {
  vec3 transformed = position;
  
  float len = length(aPos);

  transformed.xz += aPos;
  gl_Position =  projectionMatrix * viewMatrix * vec4(transformed, 1.);
}

```

---

Let’s input that radial gradient into a sin wave to make it loop infinitely

This makes it so when you add or substract time, the gradient will start to grow from the center.

```jsx
float len = length(aPos);
float activation = sin(len* 0.3 - uTime * 2.0);
```

---

he sine wave gives negative values, it has a range of negative 1 to positive 1.
Normalize it to a range of 0 to 1.

```jsx
float len = length(aPos);
float activation = sin(len* 0.3 - uTime * 2.0);
float squish = smoothstep( -1.,1., activation);
```

---

Then, before we use this value. split the y component in two parts. 

20% for the base size, and 80% which we are going to squish and grow.

```jsx
float len = length(aPos);
float activation = sin(len* 0.3 - uTime * 2.0);
float squish = smoothstep( -1.,1., activation);
transformed.y = transformed.y * 0.2 + transformed.y * 0.8;
```

---

Multiply the squish value with the squish percentage.

```jsx
float len = length(aPos);
float activation = sin(len* 0.3 - uTime * 2.0);
float squish = smoothstep( -1.,1., activation);
transformed.y = transformed.y * 0.2 + transformed.y * 0.8 * squish ;
```

---

## Moving to the fragment shader effect.

We’re still gonna mess with the vertex shader later on, but these are all the transformations we are going to use. 

---

Before we move to the color effects, let’s add a view new color uniforms.

These are presets I’ve created for you, but you can use your own background color and cosine palette configurations if you want.

```jsx
let material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: uTime,
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

Then, declare this uniforms at the top of the fragment shader

```jsx
let fragmentShader = glsl`
varying vec2 vUv;

uniform vec3 uBackground;
uniform vec3 uPalette0;
uniform vec3 uPalette1;
uniform vec3 uPalette2;
uniform vec3 uPalette3;
uniform float uPaletteOffset;

void main() {
  vec3 color = vec3(0.);
  color = vec3(vUv.y);
  gl_FragColor = vec4(color, 1.);
}
`
```

---

We have a couple of color effects on the tubes: 

- Color palette
- Fade into backgorund
- Fade when suish

Let’s start with the fade into background

---

Using the vUv.y, mix the background color and the current color. 

Make sure the background color is the first value so the tube fades at the end.

```jsx
void main() {
  vec3 color = vec3(0.);
  color = mix(uBackground, color, vUv.y );
  gl_FragColor = vec4(color, 1.);
}
```

---

This works pretty well but look at the top and back of the tube.

The end caps have some weird UVs to them. This is done line this because these are in theory circles, so they have the UVs of a circle.

---

Go back to the vertex shader an manually fix the UVs by selecting the end caps using the position.

The end caps are exactly at 0.5, checking over 0.49999 makes sure we only select the caps.

This is why we kept the tube size of 10 and scaled afterwards.

```jsx
void main(){ 

  // ...
  vUv = uv;

  if(position.y > 0.4999){
    vUv.y = 1.;
  }
  if(position.y < -0.4999){
    vUv.y = 0.;
  }
}
```

---

This is a monkey patch, something that we are doing at runtime that should be done when the geometry is generated or directly in modeling software. But it’s quick, easy and works for our purposes.

---

While we are in the vertex shader, let’s send a varying to the fragment shader. `vSquish`

```jsx
varying float vSquish;
void main(){ 

  // ...
  vUv = uv;

  if(position.y > 0.4999){
    vUv.y = 1.;
  }
  if(position.y < -0.4999){
    vUv.y = 0.;
  }
  vSquish = squish;
}
```

---

## Generative Palettes

We are going to use the height of the tube to select it’s color. When it’s small it’ll fade into the background, and when it’s not it’ll have a color depending on it’s height.

---

First, declare the new `vSquish` varying, define `PI`, and import this `palette` function.

```glsl
#define PI 3.141592653589793

varying vec2 vUv;
varying float vSquish;

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ){
  return a + b*cos( 6.28318*(c*t+d) );
}
//...

```

---

Then, generate the palette color using the squish value, and the unfirosm we imported before.

```glsl

  vec3 paletteColor = palette(vSquish + uPaletteOffset, 
                 uPalette0,	uPalette1,	uPalette2,	uPalette3);

```

---

Take the palette color, and mix it with the background.

```glsl
void main(){
 vec3 color = vec3(0.);

  vec3 paletteColor = palette(vSquish + uPaletteOffset, 
                 uPalette0,	uPalette1,	uPalette2,	uPalette3);

  color = mix(paletteColor , uBackground, cos( vSquish * PI * 2.)   );

  color = mix(uBackground, color, vUv.y );
  gl_FragColor = vec4(color, 1.);
}
```

---

That’s it for the effect.

---

## Back mesh

Push our current mesh back by half the grid size.

```glsl
let mesh = new THREE.Mesh(instancedGeometry, material);
mesh.rotation.z = -Math.PI / 2;
mesh.position.x = -totalGridSize/2 - 5
mesh.scale.y = 10;
```

---

## Bottom mesh

Rotate to look up. And move it down.

```glsl
let meshBottom = new THREE.Mesh(instancedGeometry, material);
meshBottom.position.y = -totalGridSize/2 - 5
meshBottom.scale.y = 10;

rendering.scene.add(meshBottom)
```

---

## Top Mesh

Rotate to look down, and move it up.

```glsl
let meshTop = new THREE.Mesh(instancedGeometry, material);
meshTop.rotation.z = Math.PI ;
meshTop.position.y = totalGridSize/2 + 5
meshTop.scale.y = 10;

rendering.scene.add(meshTop)
```

---

## Left and right meshes

Rotate to look up. And move it down.

```glsl
let meshLeft = new THREE.Mesh(instancedGeometry, material);
meshLeft.rotation.x = Math.PI / 2;
meshLeft.position.z = -totalGridSize/2 - 5
meshLeft.scale.y = 10;

rendering.scene.add(meshLeft)

let meshRight = new THREE.Mesh(instancedGeometry, material);
meshRight.rotation.x = -Math.PI / 2;
meshRight.position.z = totalGridSize/2 + 5
meshRight.scale.y = 10;

rendering.scene.add(meshRight)
```

---

From here you can play with different kinds of effects. Increase the grid size, or change the scale based on the distance. In the next extra lesson, we’ll explore animation and some other small details.
