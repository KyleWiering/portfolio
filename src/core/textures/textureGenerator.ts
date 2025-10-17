/**
 * Texture generation utilities for 3D objects
 * Provides procedural texture creation for different object types
 */
import * as THREE from 'three';

/**
 * Create a gradient texture (used for cube)
 */
export function createGradientTexture(): THREE.Texture {
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

/**
 * Create a striped texture (used for sphere)
 */
export function createStripedTexture(): THREE.Texture {
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

/**
 * Create a checkered texture (used for pyramid)
 */
export function createCheckeredTexture(): THREE.Texture {
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
