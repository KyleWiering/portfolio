// Checkers Renderer - Handles WebGL scene setup with overhead camera view
import * as THREE from 'three';
import { createCheckerboardTexture } from '../core/textures/textureGenerator';

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
    
    return gridGroup;
}

/**
 * Create a checkerboard plane with black and white squares
 */
function createCheckerboardPlane(): THREE.Mesh {
    // Create a 10x10 checkerboard - 10 units to align with grid spacing of 1 unit per square
    const boardSize = 10; // 10 units, each square is 1 unit to match isometric grid
    const geometry = new THREE.PlaneGeometry(boardSize, boardSize);
    
    // Apply checkerboard texture
    const texture = createCheckerboardTexture();
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide
    });
    
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true; // Enable receiving shadows
    
    // Rotate to be horizontal and position slightly above the grid
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.9; // Just above the grid at y=-2
    
    return plane;
}

/**
 * CheckersRenderer - Manages WebGL scene with overhead camera view for checkers
 */
export class CheckersRenderer {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private container: HTMLElement;
    private minZoom: number = 6;  // Minimum zoom distance
    private maxZoom: number = 12; // Maximum zoom distance
    private zoomSpeed: number = 0.5; // Zoom speed for wheel
    private lastTouchDistance: number = 0; // For pinch-to-zoom

    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            throw new Error(`Container with id '${containerId}' not found`);
        }

        this.container = container;

        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); // Black background

        // Camera setup - positioned above looking down
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Position camera above the grid, looking down - zoomed in closer
        this.camera.position.set(0, 8, 4);
        this.camera.lookAt(0, -1, 0);

        // Renderer setup with shadow support
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
        this.container.appendChild(this.renderer.domElement);

        // Add lighting
        this.setupLighting();

        // Add isometric grid
        const gridHelper = createIsometricGrid(20, 20, 1);
        this.scene.add(gridHelper);
        
        // Add checkerboard plane
        const checkerboard = createCheckerboardPlane();
        this.scene.add(checkerboard);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Set up zoom controls
        this.setupZoomControls();
    }

    /**
     * Set up scene lighting with shadows
     */
    private setupLighting(): void {
        // Ambient light for overall scene illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        // Directional light from above-right to create shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(8, 12, 8);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 30;
        directionalLight.shadow.camera.left = -12;
        directionalLight.shadow.camera.right = 12;
        directionalLight.shadow.camera.top = 12;
        directionalLight.shadow.camera.bottom = -12;
        directionalLight.shadow.bias = -0.0001;
        
        this.scene.add(directionalLight);
    }

    /**
     * Handle window resize
     */
    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Render the scene
     */
    public render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Get the scene
     */
    public getScene(): THREE.Scene {
        return this.scene;
    }

    /**
     * Get the renderer canvas
     */
    public getCanvas(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    /**
     * Get the camera
     */
    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    /**
     * Set up zoom controls for mouse wheel and pinch-to-zoom
     */
    private setupZoomControls(): void {
        // Mouse wheel zoom for desktop
        this.renderer.domElement.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            
            // Determine zoom direction
            const delta = e.deltaY > 0 ? 1 : -1;
            this.zoom(delta * this.zoomSpeed);
        }, { passive: false });

        // Touch events for pinch-to-zoom on mobile
        this.renderer.domElement.addEventListener('touchstart', (e: TouchEvent) => {
            if (e.touches.length === 2) {
                // Calculate initial distance between two fingers
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                this.lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: true });

        this.renderer.domElement.addEventListener('touchmove', (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                
                // Calculate current distance between two fingers
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);
                
                if (this.lastTouchDistance > 0) {
                    // Calculate zoom based on pinch distance change
                    const delta = (this.lastTouchDistance - currentDistance) * 0.02;
                    this.zoom(delta);
                }
                
                this.lastTouchDistance = currentDistance;
            }
        }, { passive: false });

        this.renderer.domElement.addEventListener('touchend', (e: TouchEvent) => {
            if (e.touches.length < 2) {
                this.lastTouchDistance = 0;
            }
        }, { passive: true });
    }

    /**
     * Zoom the camera in or out
     * @param delta - Positive values zoom out, negative values zoom in
     */
    private zoom(delta: number): void {
        // Calculate current distance from camera to target
        const currentY = this.camera.position.y;
        const currentZ = this.camera.position.z;
        const currentDistance = Math.sqrt(currentY * currentY + currentZ * currentZ);
        
        // Calculate new distance
        let newDistance = currentDistance + delta;
        newDistance = Math.max(this.minZoom, Math.min(this.maxZoom, newDistance));
        
        // Calculate the ratio to scale the position
        const ratio = newDistance / currentDistance;
        
        // Update camera position while maintaining the angle
        this.camera.position.y = currentY * ratio;
        this.camera.position.z = currentZ * ratio;
        
        // Keep looking at the same point
        this.camera.lookAt(0, -1, 0);
    }
}
