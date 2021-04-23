import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

class Sketch {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    // this.camera = new THREE.PerspectiveCamera(
    //   45,
    //   window.innerWidth / window.innerHeight,
    //   0.1,
    //   1000
    // );

    this.aspectRatio = window.innerWidth / window.innerHeight;
    this.wide = 18;
    this.camera = new THREE.OrthographicCamera(- this.wide * this.aspectRatio, this.wide * this.aspectRatio, this.wide, - this.wide, 0.1, 100);

    this.camera.position.set(0, 0, 20);

    this.scene = new THREE.Scene();

    this.canvas = null;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.clock = new THREE.Clock();

    this.resize();
    this.init();
  }

  init() {
    this.addCanvas();
    this.addEvents();
    this.makeInstancedStuff();
    this.render();
  }

  addCanvas() {
    this.canvas = this.renderer.domElement;
    document.body.appendChild(this.canvas);
  }

  addEvents() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  makeInstancedStuff() {
    const n = 10;

    const baseGeometry = new THREE.BoxGeometry(1);
    const instancedGeometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);
    const instanceCount = n * n * n;
    instancedGeometry.instanceCount = instanceCount;

    // Position attribute
    let aPosition = new Float32Array(instanceCount * 3);
    let i = 0;
    let padding = 1.5;
    let middle = (n - 1) / 2;

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        for (let z = 0; z < 10; z++) {
          aPosition[i + 0] = (x - middle) * padding;
          aPosition[i + 1] = (y - middle) * padding;
          aPosition[i + 2] = (z - middle) * padding;
  
          i+=3;
        }
      }
    }

    instancedGeometry.setAttribute('aPosition', new THREE.InstancedBufferAttribute(aPosition, 3));

    // Index attribute
    let aIndex = new Float32Array(instanceCount);

    for (let i = 0; i < instanceCount; i++) {
      aIndex[i] = i;
    }    

    instancedGeometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(aIndex, 1));
  
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      // wireframe: true,
    });
    this.mesh = new THREE.Mesh(instancedGeometry, material);
    this.mesh.rotation.set(Math.PI * 0.25, Math.PI * 0.25, Math.PI * 0);

    this.scene.add(this.mesh);
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.camera.aspect = window.innerWidth / window.innerHeight;
    this.aspectRatio = window.innerWidth / window.innerHeight;

    this.camera.left = -this.wide * this.aspectRatio;
    this.camera.right = this.wide * this.aspectRatio;
    this.camera.top = this.wide;
    this.camera.bottom = -this.wide;
    this.camera.updateProjectionMatrix();    
  }

  render() {
    this.controls.update();

    this.mesh.material.uniforms.uTime.value = this.clock.getElapsedTime();

    this.renderer.setAnimationLoop(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch();
