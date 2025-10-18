// Checkers Renderer - Handles WebGL scene setup with overhead camera view
import * as THREE from 'three';
import { createCheckerboardTexture } from '../core/textures/textureGenerator';
import { BOARD_SIZE, DEFAULT_SHADOW_MAP_SIZE, ShadowMapConfig } from '../core/constants/boardConfig';

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
    // Create a checkerboard - each square is 1 unit to match isometric grid
    const geometry = new THREE.PlaneGeometry(BOARD_SIZE, BOARD_SIZE);
    
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
    private shadowMapSize: ShadowMapConfig; // Configurable shadow map size

    constructor(containerId: string, shadowMapSize: ShadowMapConfig = DEFAULT_SHADOW_MAP_SIZE) {
        this.shadowMapSize = shadowMapSize;
        const container = document.getElementById(containerId);
        
        if (!container) {
            throw new Error(`Container with id '${containerId}' not found`);
        }

        this.container = container;

        // Scene setup
        this.scene = new THREE.Scene();
        
        // Create sky gradient background
        this.createSkyGradient();

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
        
        // Add wood border around the gameboard
        const border = this.createWoodBorder();
        this.scene.add(border);
        
        // Add grassy field up to the horizon
        const grassyField = this.createGrassyField();
        this.scene.add(grassyField);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Set up zoom controls
        this.setupZoomControls();
    }

    /**
     * Create sky gradient background (cloud-free sky from horizon up)
     */
    private createSkyGradient(): void {
        // Create a canvas for the sky gradient
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 256;
        const context = canvas.getContext('2d')!;
        
        // Create gradient from horizon (light blue) to top (darker blue)
        const gradient = context.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue at horizon
        gradient.addColorStop(1, '#4A90E2'); // Deeper blue at top
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 2, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;
    }

    /**
     * Create wood border around the gameboard
     */
    private createWoodBorder(): THREE.Group {
        const borderGroup = new THREE.Group();
        const borderWidth = 0.5;
        const borderHeight = 0.3;
        const boardSize = BOARD_SIZE;
        
        // Create wood texture
        const woodTexture = this.createWoodTexture();
        const woodMaterial = new THREE.MeshStandardMaterial({ 
            map: woodTexture,
            color: 0x8B4513, // Brown wood color
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Create four border pieces (top, bottom, left, right)
        const borderThickness = boardSize + borderWidth * 2;
        
        // Top border
        const topBorder = new THREE.Mesh(
            new THREE.BoxGeometry(borderThickness, borderHeight, borderWidth),
            woodMaterial
        );
        topBorder.position.set(0, -1.9 + borderHeight/2, -boardSize/2 - borderWidth/2);
        topBorder.receiveShadow = true;
        borderGroup.add(topBorder);
        
        // Bottom border
        const bottomBorder = new THREE.Mesh(
            new THREE.BoxGeometry(borderThickness, borderHeight, borderWidth),
            woodMaterial
        );
        bottomBorder.position.set(0, -1.9 + borderHeight/2, boardSize/2 + borderWidth/2);
        bottomBorder.receiveShadow = true;
        borderGroup.add(bottomBorder);
        
        // Left border
        const leftBorder = new THREE.Mesh(
            new THREE.BoxGeometry(borderWidth, borderHeight, boardSize),
            woodMaterial
        );
        leftBorder.position.set(-boardSize/2 - borderWidth/2, -1.9 + borderHeight/2, 0);
        leftBorder.receiveShadow = true;
        borderGroup.add(leftBorder);
        
        // Right border
        const rightBorder = new THREE.Mesh(
            new THREE.BoxGeometry(borderWidth, borderHeight, boardSize),
            woodMaterial
        );
        rightBorder.position.set(boardSize/2 + borderWidth/2, -1.9 + borderHeight/2, 0);
        rightBorder.receiveShadow = true;
        borderGroup.add(rightBorder);
        
        return borderGroup;
    }

    /**
     * Create wood texture
     */
    private createWoodTexture(): THREE.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d')!;
        
        // Base wood color
        context.fillStyle = '#8B4513';
        context.fillRect(0, 0, 256, 256);
        
        // Add wood grain lines
        for (let i = 0; i < 10; i++) {
            const y = Math.random() * 256;
            const darkness = Math.random() * 0.3;
            context.strokeStyle = `rgba(0, 0, 0, ${darkness})`;
            context.lineWidth = 1 + Math.random() * 2;
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(256, y + Math.random() * 20 - 10);
            context.stroke();
        }
        
        return new THREE.CanvasTexture(canvas);
    }

    /**
     * Create grassy field up to the horizon
     */
    private createGrassyField(): THREE.Mesh {
        const fieldSize = 200; // Large field extending to horizon
        const grassTexture = this.createGrassTexture();
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(50, 50); // Repeat texture for better appearance
        
        const grassMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            color: 0x228B22, // Forest green
            roughness: 0.9,
            metalness: 0.0
        });
        
        const geometry = new THREE.PlaneGeometry(fieldSize, fieldSize);
        const field = new THREE.Mesh(geometry, grassMaterial);
        field.receiveShadow = true;
        field.rotation.x = -Math.PI / 2;
        field.position.y = -2.1; // Below the board and grid
        
        return field;
    }

    /**
     * Create grass texture
     */
    private createGrassTexture(): THREE.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d')!;
        
        // Base grass color
        context.fillStyle = '#228B22';
        context.fillRect(0, 0, 256, 256);
        
        // Add random grass blades
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const shade = Math.random() * 0.3;
            context.fillStyle = `rgba(0, 100, 0, ${shade})`;
            context.fillRect(x, y, 2, 4);
        }
        
        return new THREE.CanvasTexture(canvas);
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
        directionalLight.shadow.mapSize.width = this.shadowMapSize.width;
        directionalLight.shadow.mapSize.height = this.shadowMapSize.height;
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
