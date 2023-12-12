import "./style.css"
import { gsap } from "gsap"

import { Rendering } from "./rendering"

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import { palettes, sinPalettes } from "./palettes";

let paletteKey = "blue"
let palette = palettes[paletteKey]
let sinPalette = sinPalettes[paletteKey]

// setting up
let rendering = new Rendering(document.querySelector("#canvas"), palette)
rendering.camera.position.x = 80;

let controls = new OrbitControls(rendering.camera, rendering.canvas)

let uTime = { value: 0 };

// Init

let radius = 2 /3 
let grid = 20;
let cellSize = 1.66
let totalGridSize = grid * cellSize

let geometry = new THREE.CylinderGeometry(radius, radius, 1, 8, 2)
let instancedGeometry = (new THREE.InstancedBufferGeometry()).copy(geometry)
let instanceCount = grid * grid;
instancedGeometry.instanceCount = instanceCount


let pos = new Float32Array(instanceCount * 2)

let i =0;
for (let y = 0; y < grid; y++)
for (let x = 0; x < grid; x++) {
  pos[i] = x * cellSize - totalGridSize/2 + cellSize /2;
  pos[i + 1] = y * cellSize - totalGridSize/2 + cellSize/2;
  i+= 2;
}

instancedGeometry.setAttribute("aPos", new THREE.InstancedBufferAttribute(pos, 2, false))

let vertexShader = glsl`
attribute vec2 aPos;
uniform float uTime;

varying vec2 vUv;
varying float vSquish;

void main(){
  vec3 transformed = position;

  float len = length(aPos);


  float activation = sin(len * 0.3 + uTime * 2.  );  // -1 to 1


  float squish = smoothstep(-1., 1., activation); // 0 to 1

  transformed.y = transformed.y * 0.2 + transformed.y * 0.8 * squish;

  transformed.xz += aPos;


  vUv = uv;
  vSquish = squish;

  if(position.y > 0.4999){
    vUv.y = 1.;
  }
  if(position.y < -0.4999){
    vUv.y = 0.;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
}

`

let fragmentShader = glsl`
#define PI 3.141592653589793

varying vec2 vUv;
varying float vSquish;

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

  vec3 paletteColor = palette(vSquish + uPaletteOffset, uPalette0, uPalette1, uPalette2, uPalette3);


  color = mix(paletteColor, uBackground, cos(vSquish * PI * 2.) ); // -1 to 1
  color = mix(uBackground, color, vUv.y);


  gl_FragColor = vec4(color, 1.);
}
`

let material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: uTime,
    uBackground:    { value: palette.BG },
    uPalette0:      { value: sinPalette.c0},
    uPalette1:      { value: sinPalette.c1},
    uPalette2:      { value: sinPalette.c2},
    uPalette3:      { value: sinPalette.c3},
    uPaletteOffset: { value: sinPalette.offset},
  }
})


let mesh = new THREE.Mesh(instancedGeometry, material);
mesh.scale.y = 10
mesh.rotation.z = -Math.PI / 2
mesh.position.x = -totalGridSize /2 - 5 
rendering.scene.add(mesh)

let meshBotton = new THREE.Mesh(instancedGeometry, material);
meshBotton.scale.y = 10
meshBotton.position.y = -totalGridSize /2 - 5
rendering.scene.add(meshBotton)

let meshTop = new THREE.Mesh(instancedGeometry, material);
meshTop.scale.y = 10
meshTop.rotation.z = Math.PI
meshTop.position.y = totalGridSize /2 + 5
rendering.scene.add(meshTop)

let meshRight = new THREE.Mesh(instancedGeometry, material);
meshRight.scale.y = 10
meshRight.rotation.x = Math.PI /2
meshRight.position.z = -totalGridSize /2 - 5
rendering.scene.add(meshRight)

let meshLeft = new THREE.Mesh(instancedGeometry, material);
meshLeft.scale.y = 10
meshLeft.rotation.x = -Math.PI /2
meshLeft.position.z = totalGridSize /2 + 5
rendering.scene.add(meshLeft)

// Events

const tick = (t)=>{
  uTime.value = t 
  rendering.render()
}

gsap.ticker.add(tick)

