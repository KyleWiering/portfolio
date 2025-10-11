import * as THREE from 'three';

export interface ModelConfig {
    useTexture: boolean;
    color?: number;
    textureUrl?: string;
}

function createProceduralTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    // Create a checkered pattern
    const tileSize = 32;
    for (let y = 0; y < 256; y += tileSize) {
        for (let x = 0; x < 256; x += tileSize) {
            const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
            context.fillStyle = isEven ? '#f59e0b' : '#fb923c';
            context.fillRect(x, y, tileSize, tileSize);
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export function createPyramid(config: ModelConfig): THREE.Mesh {
    const geometry = new THREE.ConeGeometry(1.5, 2.5, 4);
    
    let material: THREE.Material;
    
    if (config.useTexture) {
        const texture = createProceduralTexture();
        material = new THREE.MeshStandardMaterial({ map: texture });
    } else {
        const color = config.color || 0xf59e0b; // Amber as default
        material = new THREE.MeshStandardMaterial({ color });
    }
    
    return new THREE.Mesh(geometry, material);
}
