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
    // Create an 8x8 checkerboard - 8 units to align with grid spacing of 1 unit per square
    const boardSize = 8; // 8 units, each square is 1 unit to match isometric grid
    const geometry = new THREE.PlaneGeometry(boardSize, boardSize);
    
    // Apply checkerboard texture
    const texture = createCheckerboardTexture();
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide
    });
    
    const plane = new THREE.Mesh(geometry, material);
    
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

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
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
    }

    /**
     * Set up scene lighting
     */
    private setupLighting(): void {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 10, 5);
        this.scene.add(pointLight);
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
}
