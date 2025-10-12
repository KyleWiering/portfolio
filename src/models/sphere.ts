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
    
    // Create a striped pattern
    context.fillStyle = '#10b981';
    context.fillRect(0, 0, 256, 256);
    
    context.fillStyle = '#34d399';
    for (let i = 0; i < 256; i += 20) {
        context.fillRect(0, i, 256, 10);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export function createSphere(config: ModelConfig): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    
    let material: THREE.Material;
    
    if (config.useTexture) {
        const texture = createProceduralTexture();
        material = new THREE.MeshStandardMaterial({ map: texture });
    } else {
        const color = config.color || 0x10b981; // Green as default
        material = new THREE.MeshStandardMaterial({ color });
    }
    
    return new THREE.Mesh(geometry, material);
}
