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
            2000  // Increased far plane to see horizon
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
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d')!;
        
        // Base wood color - rich brown
        const gradient = context.createLinearGradient(0, 0, 512, 0);
        gradient.addColorStop(0, '#5c3317');
        gradient.addColorStop(0.5, '#6b4226');
        gradient.addColorStop(1, '#4a2511');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        
        // Add wood grain rings
        for (let i = 0; i < 8; i++) {
            const centerY = 256 + (Math.random() - 0.5) * 100;
            const maxRadius = 100 + Math.random() * 150;
            
            for (let radius = 10; radius < maxRadius; radius += 8 + Math.random() * 12) {
                const opacity = 0.1 + Math.random() * 0.3;
                context.strokeStyle = `rgba(30, 15, 5, ${opacity})`;
                context.lineWidth = 2 + Math.random() * 3;
                
                // Draw wavy ring
                context.beginPath();
                for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
                    const waviness = Math.sin(angle * 4) * 3;
                    const r = radius + waviness;
                    const x = 256 + Math.cos(angle) * r;
                    const y = centerY + Math.sin(angle) * r * 0.3;
                    
                    if (angle === 0) {
                        context.moveTo(x, y);
                    } else {
                        context.lineTo(x, y);
                    }
                }
                context.closePath();
                context.stroke();
            }
        }
        
        // Add horizontal grain lines
        for (let i = 0; i < 30; i++) {
            const y = Math.random() * 512;
            const darkness = 0.1 + Math.random() * 0.2;
            context.strokeStyle = `rgba(20, 10, 5, ${darkness})`;
            context.lineWidth = 0.5 + Math.random() * 1.5;
            
            context.beginPath();
            context.moveTo(0, y);
            
            // Wavy line
            for (let x = 0; x <= 512; x += 10) {
                const wave = Math.sin(x * 0.05) * 2;
                context.lineTo(x, y + wave);
            }
            context.stroke();
        }
        
        // Add knots and imperfections
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = 10 + Math.random() * 20;
            
            const knotGradient = context.createRadialGradient(x, y, 0, x, y, size);
            knotGradient.addColorStop(0, 'rgba(30, 15, 5, 0.5)');
            knotGradient.addColorStop(1, 'rgba(30, 15, 5, 0)');
            context.fillStyle = knotGradient;
            context.fillRect(x - size, y - size, size * 2, size * 2);
        }
        
        // Add texture noise for realism
        const imageData = context.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 10;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        context.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Create grassy field up to the horizon
     */
    private createGrassyField(): THREE.Mesh {
        const fieldSize = 500; // Much larger field extending to horizon
        const grassTexture = this.createGrassTexture();
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(100, 100); // More repetition for better appearance
        
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
        
        // Base grass color - darker, richer green
        context.fillStyle = '#2d5016';
        context.fillRect(0, 0, 256, 256);
        
        // Add variation with multiple shades of green
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const greenShade = Math.floor(Math.random() * 3);
            
            if (greenShade === 0) {
                context.fillStyle = '#3a6b1f';
            } else if (greenShade === 1) {
                context.fillStyle = '#4a8228';
            } else {
                context.fillStyle = '#1f3d0d';
            }
            
            // Random small patches
            const size = 1 + Math.random() * 3;
            context.fillRect(x, y, size, size);
        }
        
        // Add grass blades with varying colors
        for (let i = 0; i < 800; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const bladeHeight = 3 + Math.random() * 5;
            
            // Darker blades
            context.fillStyle = `rgba(20, 60, 10, ${0.6 + Math.random() * 0.4})`;
            context.fillRect(x, y, 1, bladeHeight);
            
            // Lighter highlights on some blades
            if (Math.random() > 0.7) {
                context.fillStyle = `rgba(80, 120, 40, ${0.5 + Math.random() * 0.3})`;
                context.fillRect(x + 1, y, 1, bladeHeight * 0.7);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
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
