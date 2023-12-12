# Creating your first instances

<video data-autoplay loop muted playsinline width="500" >
<source src="../assets/two.mp4" type="video/mp4">
</video>

---

## Create the CylinderGeometry

Delete the box geometry and create the cylinder geometry that is going to be instanced and repeated in grid

```jsx
let radius = 2 / 3;

let geometry = new THREE.CylinderGeometry(radius, radius, 1,  8,2);
```

---

Create the shader Material

Most of the instancing positioning and effects are going to happen inside of here.

```jsx
let vertexShader = glsl`
precision highp float;
uniform float uTime;
varying vec2 vUv;

  void main() {
    vec3 transformed = position;
        vUv = uv;
    gl_Position =  projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
  }

`
let fragmentShader = glsl`
varying vec2 vUv;
  void main() {
       vec3 color = vec3(0.);
        color = vec3(vUv.y);
    gl_FragColor = vec4(color, 1.);
  }
`

let material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: uTime,
  },
});
```

---

Create the mesh, give it some height, and add it to the scene

```jsx
let mesh = new THREE.Mesh(geometry, material);
mesh.scale.y = 10;

rendering.scene.add(mesh)
```

---

# Before instancing, let’s talk a bit about meshes

---

# Each mesh has a preparation step

When you tell the GPU to render a mesh, it has to get and prepare the data. This is what we call a draw call.

---

If we have many meshes, even if the next mesh is exactly the same as before, they are done one by one.

Render Mesh → Prepare → Draw → Render Mesh → Prepare → Draw → Render Mesh → Prepare → Draw → Render Mesh → Prepare → Draw → Render Mesh → Prepare → Draw

---

# Instancing minimizes the preparation step.

Instead of sending similar meshes one by one as meshes. Instancing says “hey GPU, render 50 Mesh.

Render 50 of this mesh → Prepare → Draw.

---

**One Mesh instanced 50 times → 1 draw call.**

Render 50 of this mesh → Prepare ONCE → Draw 50 times.

## vs

**50 Meshes → 50 draw calls**

Render Mesh → Prepare → Draw → Render Mesh → Prepare → Draw → Render Mesh → Prepare → Draw → Render Mesh → Prepare → Draw → Render Mesh → Prepare → Draw

---

Removing this preparation step lets the GPU do what it does best. Draw many pixels. 

Let’s instance our geometry.

---

**Create the instanced Buffer Geometry**

This indicates to the GPU we want this geometry repeated many times

```jsx
let instancedGeometry = (new THREE.InstancedBufferGeometry()).copy(geometry)
```

---

**Add the instance count.**

We need to tell the GPU how many of these particles we want.

```jsx
let grid = 20;
let instanceCount = grid * grid
instancedGeometry.instanceCount =  instanceCount
```

---

For the instancing to work, we need to give each instance a different attribute value. In our case we are going to give each instance a different positions

---

**Create the instancePosition attribute.**

This is going to hold the position of each instance for us to use inside the shader.

```jsx
let pos = new Float32Array(instanceCount * 2);

let i = 0;
for (let y = 0; y < grid; y++)
for (let x = 0; x < grid; x++) {
  pos[i] = x ;
  pos[i + 1] = y;
  i += 2;
}
```

---

**Set the attribute to the geometry**

We need to attach this attribute to our instanced geometry using the `InstancedBufferAttribute`. to indicate to ThreeJS these are attributes for each shader.

```jsx
instancedGeometry.setAttribute('aPos', new THREE.InstancedBufferAttribute(pos, 2, false))
```

---

Update the geometry with the new geometry

```jsx
let mesh = new THREE.Mesh(instancedGeometry, material);
```

---

Add the position to the vertex shader

```jsx
`
precision highp float;
attribute vec2 aPos;
uniform float uTime;
varying vec3 vUv;

void main() {
  vec3 transformed = position;
    
  transformed.xz += aPos;

  gl_Position =  projectionMatrix * viewMatrix * vec4(transformed, 1.);
}
`
```

---

Done! Look around.

---

### Instancing repeats the same geometry.

You send the GPU one geometry, and it repeats that

---

The instancing is working in a single draw call.

However, it’s not centered and it’s looking in a different direction

---

To fix that, let’s first rotate the mesh

```jsx
let mesh = new THREE.Mesh(instancedGeometry, material);
mesh.rotation.z = -Math.PI / 2;
```

---

Then, let’s center the grid.

Our meshes are positioned from 0 to 20. To center then, we need them to position form negative 10, to positive 10. We can use the size of the grid for this.

```jsx

let i = 0;
for (let y = 0; y < grid; y++)
for (let x = 0; x < grid; x++) {
  pos[i] = x - grid/2;
  pos[i + 1] = y - grid/2;
  i += 2;
}
```

---

## It is still slightly offcenter

because our first instance was centered, the first cell was centered as well. So, we need to offset it by one cell. Currently, cells are of size 1 because of our loop. So we offset it by half, 0.5 

```jsx
let i = 0;
for (let y = 0; y < grid; y++)
for (let x = 0; x < grid; x++) {
  pos[i + 0] = x - grid / 2 + 0.5;
  pos[i + 1] = y - grid / 2 + 0.5;
  i += 2;
}
```

---

Now our grid is centered on the 0,0.

---

Lets separate the cylinders a bit

To separate them we are going to calculate bigger grid cells bigger. 

Lets define the size of the cell, and while we are here, the total size of the grid.

```jsx

let cellSize = 1.66
let totalGridSize = grid * cellSize
```

---

Then, we update our instance position calculation by multiplying the X and the Y

```jsx
let i = 0;

for (let y = 0; y < grid; y++)
for (let x = 0; x < grid; x++) {
  pos[i + 0] = x * cellSize - totalGridSize / 2 + cellSize/2;
  pos[i + 1] = y * cellSize - totalGridSize / 2 + cellSize/2;
  i += 2;
} 
```

---

However, now our grid is off-centered again because we changed the grid cell size which made the total grid size bigger. To fix it, **use our totalGridSize and our new cellSize to center instead**

```jsx
let i = 0;

for (let y = 0; y < grid; y++)
for (let x = 0; x < grid; x++) {
  pos[i + 0] = x * cellSize - totalGridSize / 2 + cellSize/2;
  pos[i + 1] = y * cellSize - totalGridSize / 2 + cellSize/2;
  i += 2;
} 
```

---

This attribute can be whatever value we want, not just position. 

In the next lesson, we’ll take what we built here into the shaders to distort and create colors on the cylinders. See you there!
