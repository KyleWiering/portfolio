// 3D Model Viewer
import * as THREE from 'three';
import { createPyramid } from './models/pyramid';
import { createCube } from './models/cube';
import { createSphere } from './models/sphere';

type ModelType = 'pyramid' | 'cube' | 'sphere';

/**
 * Initialize the 3D model viewer scene
 */
function initModelViewer(): void {
    const container = document.getElementById('game-container');
    
    if (!container) {
        console.error('Game container not found');
        return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Dark blue background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Add lighting for better visual effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // State management
    let currentModel: THREE.Mesh | null = null;
    let currentModelType: ModelType = 'cube';
    let useTexture = false;

    // Function to create and display model
    function displayModel(modelType: ModelType, withTexture: boolean): void {
        // Remove current model if exists
        if (currentModel) {
            scene.remove(currentModel);
            currentModel.geometry.dispose();
            if (Array.isArray(currentModel.material)) {
                currentModel.material.forEach((m: THREE.Material) => m.dispose());
            } else {
                currentModel.material.dispose();
            }
        }

        // Create new model based on type
        const config = { useTexture: withTexture, color: undefined };
        
        switch (modelType) {
            case 'pyramid':
                currentModel = createPyramid(config);
                break;
            case 'cube':
                currentModel = createCube(config);
                break;
            case 'sphere':
                currentModel = createSphere(config);
                break;
        }

        scene.add(currentModel);
        currentModelType = modelType;
    }

    // Initialize with cube
    displayModel('cube', false);

    // Set up model selection buttons
    const modelButtons = document.querySelectorAll('.model-selector button');
    modelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modelType = button.getAttribute('data-model') as ModelType;
            if (modelType) {
                // Update active state
                modelButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Display selected model
                displayModel(modelType, useTexture);
            }
        });
    });

    // Set up texture toggle
    const textureToggle = document.getElementById('texture-toggle') as HTMLInputElement;
    if (textureToggle) {
        textureToggle.addEventListener('change', () => {
            useTexture = textureToggle.checked;
            displayModel(currentModelType, useTexture);
        });
    }

    // Animation loop
    function animate(): void {
        requestAnimationFrame(animate);

        // Rotate the model
        if (currentModel) {
            currentModel.rotation.x += 0.01;
            currentModel.rotation.y += 0.01;
        }

        renderer.render(scene, camera);
    }

    // Handle window resize
    function onWindowResize(): void {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize);

    // Start animation
    animate();

    // Hide loader after scene is ready
    const loader = document.querySelector('.loader') as HTMLElement;
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initModelViewer);
} else {
    initModelViewer();
}
