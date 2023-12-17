import "./style.css"
import { gsap } from "gsap"
import * as dat from "dat.gui"

import { Rendering } from "./rendering"

import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import { palettes, sinPalettes } from "./palettes"

let paletteKey = "blue"
let palette = palettes[paletteKey]
let sinPalette = sinPalettes[paletteKey]
let mesh
let meshBotton
let meshLeft
let meshRight
let meshTop
let material

// setting up
let rendering = new Rendering(document.querySelector("#canvas"), palette)
rendering.camera.position.x = 120

let controls = new OrbitControls(rendering.camera, rendering.canvas)
const gui = new dat.GUI()

let uTime = { value: 0 }

// Init Cylinder geometry
let radius = 2 / 3

const info = {
  grid: 40,
  // SEPERATE THE MESHES A BIT
  // make cellsize bigger than 1
  cellSize: 1.66,
}

let gridInfo = {
  totalGridSize: info.grid * info.cellSize,
  instanceCount: info.grid * info.grid,
  wireframe: false,
}

// Doesn't work yet
gui.add(info, "grid", 1, 40).onChange(function (value) {
  updateGeometry()
})

gui.add(info, "cellSize", 0.5, 4).onChange(function (value) {
  updateGeometry()
})

// add wireframe option to dat gui
gui
  .add(gridInfo, "wireframe")
  .name("Wireframe")
  .onChange(function (value) {
    material.wireframe = value
  })

let geometry = new THREE.CylinderGeometry(radius, radius, 1, 8, 2)
let instancedGeometry = new THREE.InstancedBufferGeometry().copy(geometry)

function updateGeometry() {
  // update values
  gridInfo.totalGridSize = info.grid * info.cellSize
  gridInfo.instanceCount = info.grid * info.grid

  instancedGeometry.instanceCount = gridInfo.instanceCount

  // create the instance grid position
  // this is going to hold the position of each instance r us to use inside the shader

  let pos = new Float32Array(gridInfo.instanceCount * 2) // soo 40 for entire grid + has to hold x and y for each instance (hence instanceCount * 2)

  let i = 0
  for (let y = 0; y < info.grid; y++)
    for (let x = 0; x < info.grid; x++) {
      // LETS CENTER THE GRID
      // to create a grid gap between cylinders we need to multiply the x or y by the cell size (hence * cellSize)
      // Position the points in the grid from -10 to 10 (hence - totalgridSize / 2)
      // not quiet center unless we offset by half the grid cell size (hence + cellSize / 2)

      pos[i] =
        x * info.cellSize - gridInfo.totalGridSize / 2 + info.cellSize / 2
      pos[i + 1] =
        y * info.cellSize - gridInfo.totalGridSize / 2 + info.cellSize / 2
      // jump to next grid position
      i += 2
    }

  // attach each position attribute to the instanced geometry
  instancedGeometry.setAttribute(
    "aPos",
    new THREE.InstancedBufferAttribute(pos, 2, false)
  )

  // if mesh exists update the position
  if (typeof mesh !== "undefined" && mesh !== null) {
    // clean rendering scene and re add meshes
    rendering.scene.remove(mesh)
    rendering.scene.remove(meshBotton)
    rendering.scene.remove(meshTop)
    rendering.scene.remove(meshRight)
    rendering.scene.remove(meshLeft)

    addMeshes()
  }
}

updateGeometry()

// init shaders

let vertexShader = glsl`

precision highp float;
attribute vec2 aPos;
uniform float uTime;
uniform float uFade;

varying vec2 vUv;
varying float vSquish;


void main(){
  vec3 transformed = position;

  // calculate the distance to the origin. This length function is going to create a radial gradient from the center
  float len = length(aPos);
  // input the radial gradient into a sin wave to make it loop infinitely, this makes it so when you add or subtract time, the gradient will start to grow from the center.
  float activation = sin(len * 0.3 - uTime * 2.0 + uFade * 5.); // -1, 1
  // normalize the activation to be between 0 and 1
  // uFade use mix function gsap aniamtes uFade to fade in and out
  float squish = smoothstep(-1., 1., mix(-1., activation, uFade)); // 0, 1

  // split y componenent in two parts 20% for base size and 80% to squish and grow
  transformed.y = transformed.y * 0.2 + transformed.y * 0.8 * squish;

  transformed.xz += aPos;
  
  vUv = uv;
  vSquish = squish;

  // fix end caps, end caps are at 0.5, checking over 0.4999 makes sure we only select the caps
  if ( position.y > 0.4999 ) {
    vUv.y = 1.;
  }

  if ( position.y < - 0.4999 ) {
    vUv.y = 0.;
  }
  // ----


  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
}
`

let fragmentShader = glsl`
#define PI 3.141592653589793

varying vec2 vUv;
varying float vSquish;

// palette function
// more here https://iquilezles.org/articles/palettes/
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ){
  return a + b*cos( 6.28318*(c*t+d) );
}

// Background color
uniform vec3 uBackground;

// Cosine palette
uniform vec3 uPalette0;
uniform vec3 uPalette1;
uniform vec3 uPalette2;
uniform vec3 uPalette3;
uniform float uPaletteOffset;

void main(){
  vec3 color = vec3(0.);

  // use our palette colours in the palette function
  vec3 paletteColor = palette(vSquish + uPaletteOffset, uPalette0, uPalette1, uPalette2, uPalette3);

  // mix the palette color with the background depending on the squish 
  color = mix(paletteColor, uBackground, cos(vSquish * PI * 2.) ); // -1 to 1
 // color = vec3(paletteColor);

  // mix hte background color with the current color
  color = mix(uBackground, color, vUv.y);
  
  gl_FragColor = vec4(color, 1.);
}
`

material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: uTime,
    uFade: { value: 1 },
    uBackground: { value: palette.BG },
    uPalette0: { value: sinPalette.c0 },
    uPalette1: { value: sinPalette.c1 },
    uPalette2: { value: sinPalette.c2 },
    uPalette3: { value: sinPalette.c3 },
    uPaletteOffset: { value: sinPalette.offset },
  },
})

let tl = gsap.timeline()

tl.fromTo(
  material.uniforms.uFade,
  { value: 0 },
  { value: 1, duration: 3, ease: "power2.out" }
)

// create mesh

function addMeshes() {
  // main background mesh
  mesh = new THREE.Mesh(instancedGeometry, material)
  mesh.scale.y = 10
  // flip mesh to look at us
  mesh.rotation.z = -Math.PI / 2
  // push our mesh back by half the gridSize
  mesh.position.x = -gridInfo.totalGridSize / 2 - 5
  rendering.scene.add(mesh)

  // bottom mesh: (on its side) and move to bottom
  meshBotton = new THREE.Mesh(instancedGeometry, material)
  meshBotton.scale.y = 10
  meshBotton.position.y = -gridInfo.totalGridSize / 2 - 5
  rendering.scene.add(meshBotton)

  // mesh top: rotate it to look down and move it to top
  meshTop = new THREE.Mesh(instancedGeometry, material)
  meshTop.scale.y = 10
  meshTop.rotation.z = Math.PI
  meshTop.position.y = gridInfo.totalGridSize / 2 + 5
  rendering.scene.add(meshTop)

  meshRight = new THREE.Mesh(instancedGeometry, material)
  meshRight.scale.y = 10
  meshRight.rotation.x = Math.PI / 2
  meshRight.position.z = -gridInfo.totalGridSize / 2 - 5
  rendering.scene.add(meshRight)

  meshLeft = new THREE.Mesh(instancedGeometry, material)
  meshLeft.scale.y = 10
  meshLeft.rotation.x = -Math.PI / 2
  meshLeft.position.z = gridInfo.totalGridSize / 2 + 5
  rendering.scene.add(meshLeft)
}

addMeshes()

// Events

const tick = (t) => {
  uTime.value = t
  rendering.render()
}

gsap.ticker.add(tick)
