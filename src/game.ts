// 3D Browser Game - Spinning Cube Loader
import * as THREE from 'three';

/**
 * Initialize the 3D cube scene
 */
function initCubeScene(): void {
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

    // Create the spinning cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Create gradient-like material using multiple colors
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0x2563eb }), // Blue
        new THREE.MeshBasicMaterial({ color: 0x7c3aed }), // Purple
        new THREE.MeshBasicMaterial({ color: 0xdb2777 }), // Pink
        new THREE.MeshBasicMaterial({ color: 0xf59e0b }), // Amber
        new THREE.MeshBasicMaterial({ color: 0x10b981 }), // Green
        new THREE.MeshBasicMaterial({ color: 0x06b6d4 })  // Cyan
    ];
    
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // Add lighting for better visual effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation loop
    function animate(): void {
        requestAnimationFrame(animate);

        // Rotate the cube
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

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
    document.addEventListener("DOMContentLoaded", initCubeScene);
} else {
    initCubeScene();
}
