// Checkers Renderer - Handles WebGL scene setup with overhead camera view
import * as THREE from 'three';
import { createCheckerboardTexture } from '../core/textures/textureGenerator';
import { 
    BOARD_SIZE, 
    BOARD_Y_POSITION,
    GRID_Y_POSITION,
    GRID_SIZE,
    GRID_SPACING,
    GRID_COLOR,
    GRID_OPACITY,
    GRID_DASH_SIZE,
    GRID_GAP_SIZE,
    CAMERA_FOV,
    CAMERA_NEAR_PLANE,
    CAMERA_FAR_PLANE,
    CAMERA_INITIAL_Y,
    CAMERA_INITIAL_Z,
    CAMERA_TARGET_Y,
    MIN_ZOOM_DISTANCE,
    MAX_ZOOM_DISTANCE,
    ZOOM_SPEED,
    PAN_SPEED,
    BORDER_WIDTH,
    BORDER_HEIGHT,
    BORDER_COLOR,
    WATER_POOL_WIDTH,
    WATER_POOL_DEPTH,
    WATER_COLOR,
    WATER_OPACITY,
    WATERFALL_HEIGHT,
    WATERFALL_OPACITY,
    GRASS_FIELD_SIZE,
    GRASS_TEXTURE_REPEAT,
    GRASS_COLOR,
    GRASS_Y_POSITION,
    CRAG_COUNT,
    CRAG_COLOR,
    AMBIENT_LIGHT_COLOR,
    AMBIENT_LIGHT_INTENSITY,
    DIRECTIONAL_LIGHT_COLOR,
    DIRECTIONAL_LIGHT_INTENSITY,
    DIRECTIONAL_LIGHT_X,
    DIRECTIONAL_LIGHT_Y,
    DIRECTIONAL_LIGHT_Z,
    SHADOW_CAMERA_NEAR,
    SHADOW_CAMERA_FAR,
    SHADOW_CAMERA_SIZE,
    SHADOW_BIAS,
    DEFAULT_SHADOW_MAP_SIZE, 
    ShadowMapConfig 
} from '../core/constants/boardConfig';

/**
 * Create an isometric grid with dashed lines
 */
function createIsometricGrid(width: number, depth: number, spacing: number): THREE.Group {
    const gridGroup = new THREE.Group();
    
    // Create material for dashed lines
    const lineMaterial = new THREE.LineDashedMaterial({
        color: GRID_COLOR,
        transparent: true,
        opacity: GRID_OPACITY,
        dashSize: GRID_DASH_SIZE,
        gapSize: GRID_GAP_SIZE,
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
    gridGroup.position.y = GRID_Y_POSITION;
    
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
    plane.position.y = BOARD_Y_POSITION;
    
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
    private minZoom: number = MIN_ZOOM_DISTANCE;
    private maxZoom: number = MAX_ZOOM_DISTANCE;
    private zoomSpeed: number = ZOOM_SPEED;
    private lastTouchDistance: number = 0; // For pinch-to-zoom
    private shadowMapSize: ShadowMapConfig; // Configurable shadow map size
    private isPanning: boolean = false; // Is currently panning
    private lastPanX: number = 0; // Last pan X position
    private lastPanY: number = 0; // Last pan Y position
    private cameraTarget: THREE.Vector3 = new THREE.Vector3(0, CAMERA_TARGET_Y, 0);
    private panSpeed: number = PAN_SPEED;

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
            CAMERA_FOV,
            window.innerWidth / window.innerHeight,
            CAMERA_NEAR_PLANE,
            CAMERA_FAR_PLANE
        );
        
        // Position camera above the grid, looking down - zoomed in closer
        this.camera.position.set(0, CAMERA_INITIAL_Y, CAMERA_INITIAL_Z);
        this.camera.lookAt(0, CAMERA_TARGET_Y, 0);

        // Renderer setup with shadow support
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
        this.container.appendChild(this.renderer.domElement);

        // Add lighting
        this.setupLighting();

        // Add isometric grid (hidden)
        const gridHelper = createIsometricGrid(GRID_SIZE, GRID_SIZE, GRID_SPACING);
        gridHelper.visible = false; // Hide the grid
        this.scene.add(gridHelper);
        
        // Add checkerboard plane
        const checkerboard = createCheckerboardPlane();
        this.scene.add(checkerboard);
        
        // Add wood border around the gameboard
        const border = this.createWoodBorder();
        this.scene.add(border);
        
        // Grassy field hidden to show black background
        // const grassyField = this.createGrassyField();
        // this.scene.add(grassyField);
        
        // Add water pool around the board edges with waterfalls
        const waterPool = this.createWaterPool();
        this.scene.add(waterPool);
        
        // Add cragged edges around the board
        const craggedEdges = this.createCraggedEdges();
        this.scene.add(craggedEdges);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Set up zoom controls
        this.setupZoomControls();
        
        // Set up pan controls
        this.setupPanControls();
    }

    /**
     * Create sky gradient background (cloud-free sky from horizon up)
     */
    private createSkyGradient(): void {
        // Set the background to black for a classic checkers board appearance
        this.scene.background = new THREE.Color(0x000000);
    }

    /**
     * Create wood border around the gameboard
     */
    private createWoodBorder(): THREE.Group {
        const borderGroup = new THREE.Group();
        const boardSize = BOARD_SIZE;
        
        // Create wood texture
        const woodTexture = this.createWoodTexture();
        const woodMaterial = new THREE.MeshStandardMaterial({ 
            map: woodTexture,
            color: BORDER_COLOR,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Create four border pieces (top, bottom, left, right)
        const borderThickness = boardSize + BORDER_WIDTH * 2;
        
        // Top border
        const topBorder = new THREE.Mesh(
            new THREE.BoxGeometry(borderThickness, BORDER_HEIGHT, BORDER_WIDTH),
            woodMaterial
        );
        topBorder.position.set(0, BOARD_Y_POSITION + BORDER_HEIGHT/2, -boardSize/2 - BORDER_WIDTH/2);
        topBorder.receiveShadow = true;
        borderGroup.add(topBorder);
        
        // Bottom border
        const bottomBorder = new THREE.Mesh(
            new THREE.BoxGeometry(borderThickness, BORDER_HEIGHT, BORDER_WIDTH),
            woodMaterial
        );
        bottomBorder.position.set(0, BOARD_Y_POSITION + BORDER_HEIGHT/2, boardSize/2 + BORDER_WIDTH/2);
        bottomBorder.receiveShadow = true;
        borderGroup.add(bottomBorder);
        
        // Left border
        const leftBorder = new THREE.Mesh(
            new THREE.BoxGeometry(BORDER_WIDTH, BORDER_HEIGHT, boardSize),
            woodMaterial
        );
        leftBorder.position.set(-boardSize/2 - BORDER_WIDTH/2, BOARD_Y_POSITION + BORDER_HEIGHT/2, 0);
        leftBorder.receiveShadow = true;
        borderGroup.add(leftBorder);
        
        // Right border
        const rightBorder = new THREE.Mesh(
            new THREE.BoxGeometry(BORDER_WIDTH, BORDER_HEIGHT, boardSize),
            woodMaterial
        );
        rightBorder.position.set(boardSize/2 + BORDER_WIDTH/2, BOARD_Y_POSITION + BORDER_HEIGHT/2, 0);
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
        const grassTexture = this.createGrassTexture();
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(GRASS_TEXTURE_REPEAT, GRASS_TEXTURE_REPEAT);
        
        const grassMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            color: GRASS_COLOR,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const geometry = new THREE.PlaneGeometry(GRASS_FIELD_SIZE, GRASS_FIELD_SIZE);
        const field = new THREE.Mesh(geometry, grassMaterial);
        field.receiveShadow = true;
        field.rotation.x = -Math.PI / 2;
        field.position.y = GRASS_Y_POSITION;
        
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
     * Create water pool around the board edges
     */
    private createWaterPool(): THREE.Group {
        const poolGroup = new THREE.Group();
        const boardSize = BOARD_SIZE;
        
        // Create water material with transparency and reflection
        const waterTexture = this.createWaterTexture();
        const waterMaterial = new THREE.MeshStandardMaterial({
            map: waterTexture,
            color: WATER_COLOR,
            transparent: true,
            opacity: WATER_OPACITY,
            roughness: 0.1,
            metalness: 0.3,
            emissive: new THREE.Color(0x0066cc),
            emissiveIntensity: 0.2
        });
        
        const totalBoardWidth = boardSize + BORDER_WIDTH * 2;
        const outerEdge = totalBoardWidth / 2;
        const poolStart = outerEdge;
        const poolEnd = outerEdge + WATER_POOL_WIDTH;
        
        // Create four water strips around the board (top, bottom, left, right)
        // Top water strip
        const topWater = new THREE.Mesh(
            new THREE.PlaneGeometry(totalBoardWidth + WATER_POOL_WIDTH * 2, WATER_POOL_WIDTH),
            waterMaterial
        );
        topWater.rotation.x = -Math.PI / 2;
        topWater.position.set(0, GRID_Y_POSITION - WATER_POOL_DEPTH, -poolStart - WATER_POOL_WIDTH / 2);
        topWater.receiveShadow = true;
        poolGroup.add(topWater);
        
        // Bottom water strip
        const bottomWater = new THREE.Mesh(
            new THREE.PlaneGeometry(totalBoardWidth + WATER_POOL_WIDTH * 2, WATER_POOL_WIDTH),
            waterMaterial
        );
        bottomWater.rotation.x = -Math.PI / 2;
        bottomWater.position.set(0, GRID_Y_POSITION - WATER_POOL_DEPTH, poolStart + WATER_POOL_WIDTH / 2);
        bottomWater.receiveShadow = true;
        poolGroup.add(bottomWater);
        
        // Left water strip
        const leftWater = new THREE.Mesh(
            new THREE.PlaneGeometry(WATER_POOL_WIDTH, totalBoardWidth),
            waterMaterial
        );
        leftWater.rotation.x = -Math.PI / 2;
        leftWater.position.set(-poolStart - WATER_POOL_WIDTH / 2, GRID_Y_POSITION - WATER_POOL_DEPTH, 0);
        leftWater.receiveShadow = true;
        poolGroup.add(leftWater);
        
        // Right water strip
        const rightWater = new THREE.Mesh(
            new THREE.PlaneGeometry(WATER_POOL_WIDTH, totalBoardWidth),
            waterMaterial
        );
        rightWater.rotation.x = -Math.PI / 2;
        rightWater.position.set(poolStart + WATER_POOL_WIDTH / 2, GRID_Y_POSITION - WATER_POOL_DEPTH, 0);
        rightWater.receiveShadow = true;
        poolGroup.add(rightWater);
        
        // Add waterfall effects at the edges
        this.addWaterfalls(poolGroup, poolEnd);
        
        return poolGroup;
    }

    /**
     * Create water texture
     */
    private createWaterTexture(): THREE.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d')!;
        
        // Base water color - blue with variations
        const gradient = context.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#1e90ff');
        gradient.addColorStop(0.5, '#4169e1');
        gradient.addColorStop(1, '#0066cc');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        
        // Add water ripples
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = 5 + Math.random() * 20;
            
            const rippleGradient = context.createRadialGradient(x, y, 0, x, y, radius);
            rippleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            rippleGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
            rippleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            context.fillStyle = rippleGradient;
            context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    /**
     * Add fence/wall at the edges connecting the rocks
     */
    private addWaterfalls(poolGroup: THREE.Group, poolEnd: number): void {
        // Create stone wall material to match the cragged edges
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: CRAG_COLOR,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const boardSize = BOARD_SIZE;
        const totalBoardWidth = boardSize + BORDER_WIDTH * 2;
        const wallHeight = 1.5; // Solid wall height
        const wallThickness = 0.3; // Wall thickness
        
        // Top wall
        const topWall = new THREE.Mesh(
            new THREE.BoxGeometry(totalBoardWidth + WATER_POOL_WIDTH * 2, wallHeight, wallThickness),
            wallMaterial
        );
        topWall.position.set(0, GRID_Y_POSITION + wallHeight / 2, -poolEnd);
        topWall.castShadow = true;
        topWall.receiveShadow = true;
        poolGroup.add(topWall);
        
        // Bottom wall
        const bottomWall = new THREE.Mesh(
            new THREE.BoxGeometry(totalBoardWidth + WATER_POOL_WIDTH * 2, wallHeight, wallThickness),
            wallMaterial
        );
        bottomWall.position.set(0, GRID_Y_POSITION + wallHeight / 2, poolEnd);
        bottomWall.castShadow = true;
        bottomWall.receiveShadow = true;
        poolGroup.add(bottomWall);
        
        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThickness, wallHeight, totalBoardWidth + WATER_POOL_WIDTH * 2),
            wallMaterial
        );
        leftWall.position.set(-poolEnd, GRID_Y_POSITION + wallHeight / 2, 0);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        poolGroup.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThickness, wallHeight, totalBoardWidth + WATER_POOL_WIDTH * 2),
            wallMaterial
        );
        rightWall.position.set(poolEnd, GRID_Y_POSITION + wallHeight / 2, 0);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        poolGroup.add(rightWall);
    }

    /**
     * Create cragged edges around the board
     */
    private createCraggedEdges(): THREE.Group {
        const cragGroup = new THREE.Group();
        const boardSize = BOARD_SIZE;
        const edgePosition = (boardSize + BORDER_WIDTH * 2) / 2 + WATER_POOL_WIDTH;
        
        // Create stone/rock material for cragged edges
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: CRAG_COLOR,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Create random cragged rocks around the perimeter
        const numCrags = CRAG_COUNT;
        for (let i = 0; i < numCrags; i++) {
            const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
            let x = 0, z = 0;
            
            switch(side) {
                case 0: // Top
                    x = (Math.random() - 0.5) * (boardSize + WATER_POOL_WIDTH * 2);
                    z = -edgePosition + (Math.random() - 0.5) * 2;
                    break;
                case 1: // Right
                    x = edgePosition + (Math.random() - 0.5) * 2;
                    z = (Math.random() - 0.5) * (boardSize + WATER_POOL_WIDTH * 2);
                    break;
                case 2: // Bottom
                    x = (Math.random() - 0.5) * (boardSize + WATER_POOL_WIDTH * 2);
                    z = edgePosition + (Math.random() - 0.5) * 2;
                    break;
                case 3: // Left
                    x = -edgePosition + (Math.random() - 0.5) * 2;
                    z = (Math.random() - 0.5) * (boardSize + WATER_POOL_WIDTH * 2);
                    break;
            }
            
            // Create irregular rock shapes using boxes with random sizes
            const width = 0.3 + Math.random() * 0.5;
            const height = 0.5 + Math.random() * 1.5;
            const depth = 0.3 + Math.random() * 0.5;
            
            const crag = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth),
                stoneMaterial
            );
            
            crag.position.set(x, GRID_Y_POSITION + height / 2, z);
            crag.rotation.y = Math.random() * Math.PI * 2;
            crag.castShadow = true;
            crag.receiveShadow = true;
            
            cragGroup.add(crag);
        }
        
        return cragGroup;
    }

    /**
     * Set up scene lighting with shadows
     */
    private setupLighting(): void {
        // Ambient light for overall scene illumination
        const ambientLight = new THREE.AmbientLight(AMBIENT_LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY);
        this.scene.add(ambientLight);

        // Directional light from above-right to create shadows
        const directionalLight = new THREE.DirectionalLight(DIRECTIONAL_LIGHT_COLOR, DIRECTIONAL_LIGHT_INTENSITY);
        directionalLight.position.set(DIRECTIONAL_LIGHT_X, DIRECTIONAL_LIGHT_Y, DIRECTIONAL_LIGHT_Z);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = this.shadowMapSize.width;
        directionalLight.shadow.mapSize.height = this.shadowMapSize.height;
        directionalLight.shadow.camera.near = SHADOW_CAMERA_NEAR;
        directionalLight.shadow.camera.far = SHADOW_CAMERA_FAR;
        directionalLight.shadow.camera.left = -SHADOW_CAMERA_SIZE;
        directionalLight.shadow.camera.right = SHADOW_CAMERA_SIZE;
        directionalLight.shadow.camera.top = SHADOW_CAMERA_SIZE;
        directionalLight.shadow.camera.bottom = -SHADOW_CAMERA_SIZE;
        directionalLight.shadow.bias = SHADOW_BIAS;
        
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
     * Enable or disable panning
     */
    public setPanningEnabled(enabled: boolean): void {
        this.isPanning = enabled;
    }

    /**
     * Set up pan controls for mouse drag
     */
    private setupPanControls(): void {
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;

        // Mouse pan controls
        this.renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => {
            // Only pan with right mouse button or middle mouse button
            if (e.button === 1 || e.button === 2) {
                e.preventDefault();
                isDragging = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                this.lastPanX = e.clientX;
                this.lastPanY = e.clientY;
            }
        });

        this.renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => {
            if (isDragging) {
                e.preventDefault();
                const deltaX = e.clientX - this.lastPanX;
                const deltaY = e.clientY - this.lastPanY;
                this.pan(deltaX, deltaY);
                this.lastPanX = e.clientX;
                this.lastPanY = e.clientY;
            }
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Prevent context menu on right click
        this.renderer.domElement.addEventListener('contextmenu', (e: Event) => {
            e.preventDefault();
        });

        // Touch pan controls (two-finger pan when not pinching)
        let touchPanStartX = 0;
        let touchPanStartY = 0;
        let isTouchPanning = false;

        this.renderer.domElement.addEventListener('touchmove', (e: TouchEvent) => {
            if (e.touches.length === 2) {
                // Calculate midpoint for panning
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

                if (!isTouchPanning) {
                    isTouchPanning = true;
                    touchPanStartX = midX;
                    touchPanStartY = midY;
                } else {
                    const deltaX = midX - touchPanStartX;
                    const deltaY = midY - touchPanStartY;
                    this.pan(deltaX * 0.5, deltaY * 0.5);
                    touchPanStartX = midX;
                    touchPanStartY = midY;
                }
            }
        });

        this.renderer.domElement.addEventListener('touchend', () => {
            isTouchPanning = false;
        });
    }

    /**
     * Pan the camera
     * @param deltaX - Horizontal pan amount
     * @param deltaY - Vertical pan amount
     */
    private pan(deltaX: number, deltaY: number): void {
        // Get the camera's right and up vectors
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        
        this.camera.getWorldDirection(right);
        right.cross(this.camera.up).normalize();
        up.copy(this.camera.up).normalize();

        // Calculate pan amount based on camera distance
        const distance = this.camera.position.distanceTo(this.cameraTarget);
        const panAmount = distance * this.panSpeed;

        // Pan the target
        this.cameraTarget.addScaledVector(right, -deltaX * panAmount);
        this.cameraTarget.addScaledVector(up, deltaY * panAmount);

        // Update camera to look at new target
        this.camera.lookAt(this.cameraTarget);
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
        
        // Keep looking at the target point
        this.camera.lookAt(this.cameraTarget);
    }
}
