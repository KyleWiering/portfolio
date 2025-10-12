// 3D Model Viewer
import * as THREE from 'three';
import { createPyramid } from './models/pyramid';
import { createCube } from './models/cube';
import { createSphere } from './models/sphere';

type ModelType = 'pyramid' | 'cube' | 'sphere';

/**
 * Create an isometric grid with dashed lines
 */
function createIsometricGrid(width: number, depth: number, spacing: number): THREE.Group {
    const gridGroup = new THREE.Group();
    
    // Grid configuration
    const gridColor = 0x808080; // Grey color
    const opacity = 0.3; // Transparent
    
    // Create material for dashed lines
    const lineMaterial = new THREE.LineDashedMaterial({
        color: gridColor,
        transparent: true,
        opacity: opacity,
        dashSize: 0.1,
        gapSize: 0.1,
        linewidth: 1
    });
    
    const halfWidth = (width * spacing) / 2;
    const halfDepth = (depth * spacing) / 2;
    
    // Create lines parallel to X-axis
    for (let z = -halfDepth; z <= halfDepth; z += spacing) {
        const points = [];
        points.push(new THREE.Vector3(-halfWidth, 0, z));
        points.push(new THREE.Vector3(halfWidth, 0, z));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        line.computeLineDistances(); // Required for dashed lines
        gridGroup.add(line);
    }
    
    // Create lines parallel to Z-axis
    for (let x = -halfWidth; x <= halfWidth; x += spacing) {
        const points = [];
        points.push(new THREE.Vector3(x, 0, -halfDepth));
        points.push(new THREE.Vector3(x, 0, halfDepth));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        line.computeLineDistances(); // Required for dashed lines
        gridGroup.add(line);
    }
    
    // Position the grid slightly below the models
    gridGroup.position.y = -2;
    
    // Rotate for isometric view (optional slight rotation for visual effect)
    gridGroup.rotation.x = 0;
    
    return gridGroup;
}

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
    scene.background = new THREE.Color(0x000000); // Black background

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

    // Create isometric grid
    const gridHelper = createIsometricGrid(20, 20, 1);
    scene.add(gridHelper);

    // State management
    let currentModel: THREE.Mesh | null = null;
    let currentModelType: ModelType = 'cube';
    let useTexture = false;
    
    // Grid movement state
    let gridPosition = { x: 0, z: 0 }; // Current position on grid
    const gridSpacing = 1; // Grid cell size
    const gridBounds = 10; // Half of grid size (20/2)

    // Function to update model position on grid
    function updateModelPosition(): void {
        if (currentModel) {
            currentModel.position.x = gridPosition.x * gridSpacing;
            currentModel.position.z = gridPosition.z * gridSpacing;
        }
    }

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
        updateModelPosition();
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

    // Touch controls for mobile navigation
    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 50; // Minimum swipe distance in pixels

    renderer.domElement.addEventListener('touchstart', (e: TouchEvent) => {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    renderer.domElement.addEventListener('touchend', (e: TouchEvent) => {
        if (e.changedTouches.length === 1) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Determine swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe (left/right)
                if (Math.abs(deltaX) > swipeThreshold) {
                    if (deltaX > 0) {
                        // Swipe right - move right
                        if (gridPosition.x < gridBounds) {
                            gridPosition.x += 1;
                            updateModelPosition();
                        }
                    } else {
                        // Swipe left - move left
                        if (gridPosition.x > -gridBounds) {
                            gridPosition.x -= 1;
                            updateModelPosition();
                        }
                    }
                }
            } else {
                // Vertical swipe (back/forth)
                if (Math.abs(deltaY) > swipeThreshold) {
                    if (deltaY > 0) {
                        // Swipe down - move forward (closer)
                        if (gridPosition.z < gridBounds) {
                            gridPosition.z += 1;
                            updateModelPosition();
                        }
                    } else {
                        // Swipe up - move back (away)
                        if (gridPosition.z > -gridBounds) {
                            gridPosition.z -= 1;
                            updateModelPosition();
                        }
                    }
                }
            }
        }
    }, { passive: true });

    // Keyboard controls for desktop (arrow keys)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
        switch(e.key) {
            case 'ArrowLeft':
                if (gridPosition.x > -gridBounds) {
                    gridPosition.x -= 1;
                    updateModelPosition();
                }
                e.preventDefault();
                break;
            case 'ArrowRight':
                if (gridPosition.x < gridBounds) {
                    gridPosition.x += 1;
                    updateModelPosition();
                }
                e.preventDefault();
                break;
            case 'ArrowUp':
                if (gridPosition.z > -gridBounds) {
                    gridPosition.z -= 1;
                    updateModelPosition();
                }
                e.preventDefault();
                break;
            case 'ArrowDown':
                if (gridPosition.z < gridBounds) {
                    gridPosition.z += 1;
                    updateModelPosition();
                }
                e.preventDefault();
                break;
        }
    });

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
