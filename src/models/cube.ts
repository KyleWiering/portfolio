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
    
    // Create a gradient pattern
    const gradient = context.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(0.5, '#7c3aed');
    gradient.addColorStop(1, '#db2777');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export function createCube(config: ModelConfig): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    let material: THREE.Material;
    
    if (config.useTexture) {
        const texture = createProceduralTexture();
        material = new THREE.MeshStandardMaterial({ map: texture });
    } else {
        const color = config.color || 0x2563eb; // Blue as default
        material = new THREE.MeshStandardMaterial({ color });
    }
    
    return new THREE.Mesh(geometry, material);
}
