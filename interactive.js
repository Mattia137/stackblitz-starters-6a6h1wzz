import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Scene Setup
const scene = new THREE.Scene();
// Fog to give depth if needed, but for wireframe maybe not.
// scene.fog = new THREE.FogExp2(0x000000, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Important for post-processing colors
renderer.toneMapping = THREE.ReinhardToneMapping;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Post-Processing (Bloom)
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3, // strength
    0.8, // radius
    0.0  // threshold
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Mouse State
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001; // Scale down sensitivity
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

// Load Mesh
const loader = new OBJLoader();
const meshUrl = 'https://raw.githubusercontent.com/Mattia137/portfolio-2026/main/MESH-TEST-TD-PROGRAM-4.obj';

let loadedMeshGroup;

loader.load(meshUrl, (obj) => {
    loadedMeshGroup = obj;

    // Process geometry
    obj.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry;
            geometry.center(); // Center geometry at (0,0,0)

            // Calculate vertex colors for gradient
            // Earth (Cyan/Blue) -> Mars (Orange/Red)
            const count = geometry.attributes.position.count;
            geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));

            const positions = geometry.attributes.position;
            const colors = geometry.attributes.color;

            // Find bounds to normalize gradient
            geometry.computeBoundingBox();
            const minY = geometry.boundingBox.min.y;
            const maxY = geometry.boundingBox.max.y;
            const rangeY = maxY - minY || 1; // Avoid division by zero

            const colorEarth = new THREE.Color(0x00ffff); // Cyan
            const colorMars = new THREE.Color(0xff4500);  // OrangeRed
            const tempColor = new THREE.Color();

            for (let i = 0; i < count; i++) {
                const y = positions.getY(i);
                const alpha = (y - minY) / rangeY; // 0.0 to 1.0

                // Mix colors
                tempColor.copy(colorEarth).lerp(colorMars, alpha);

                colors.setXYZ(i, tempColor.r, tempColor.g, tempColor.b);
            }

            // Material
            child.material = new THREE.MeshBasicMaterial({
                wireframe: true,
                vertexColors: true,
                transparent: true,
                opacity: 0.3
            });
        }
    });

    // Auto-scale to fit view roughly
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
        const scale = 3.5 / maxDim; // Fit within radius ~3.5
        obj.scale.set(scale, scale, scale);
    }

    scene.add(obj);

}, undefined, (error) => {
    console.error('An error happened loading the OBJ:', error);
});


// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (loadedMeshGroup) {
        // Smooth rotation towards mouse position
        loadedMeshGroup.rotation.y += (mouseX * 5 - loadedMeshGroup.rotation.y) * 0.05;
        loadedMeshGroup.rotation.x += (mouseY * 5 - loadedMeshGroup.rotation.x) * 0.05;

        // Add a slow constant spin "to feel alive"
        loadedMeshGroup.rotation.z += 0.002;
    }

    composer.render();
}

// Handle Resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
});

animate();
