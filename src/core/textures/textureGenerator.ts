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

/**
 * Create a black and white checkerboard texture for the game board
 */
export function createCheckerboardTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    
    // Create an 8x8 checkerboard pattern (standard checkers board)
    const tileSize = 64; // 512/8 = 64 pixels per square
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const isEven = (x + y) % 2 === 0;
            context.fillStyle = isEven ? '#ffffff' : '#000000';
            context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

/**
 * Create a brick facade texture for pyramid pieces
 */
export function createBrickTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    // Base brick color (reddish-brown)
    context.fillStyle = '#8b4513';
    context.fillRect(0, 0, 256, 256);
    
    // Brick dimensions
    const brickWidth = 32;
    const brickHeight = 16;
    const mortarWidth = 2;
    
    // Mortar color (light gray)
    context.fillStyle = '#c0c0c0';
    
    // Draw horizontal mortar lines
    for (let y = 0; y < 256; y += brickHeight) {
        context.fillRect(0, y, 256, mortarWidth);
    }
    
    // Draw vertical mortar lines with offset every other row
    for (let row = 0; row < 256 / brickHeight; row++) {
        const y = row * brickHeight;
        const offset = (row % 2) * (brickWidth / 2);
        
        for (let x = -brickWidth / 2; x < 256 + brickWidth; x += brickWidth) {
            context.fillRect(x + offset, y, mortarWidth, brickHeight);
        }
    }
    
    // Add some texture variation to bricks
    context.fillStyle = 'rgba(139, 69, 19, 0.3)';
    for (let y = mortarWidth; y < 256; y += brickHeight) {
        for (let x = mortarWidth; x < 256; x += brickWidth) {
            const row = Math.floor(y / brickHeight);
            const offset = (row % 2) * (brickWidth / 2);
            const brickX = x + offset;
            
            // Random darker spots on bricks
            if (Math.random() > 0.7) {
                context.fillRect(
                    brickX + Math.random() * (brickWidth - mortarWidth * 2),
                    y + Math.random() * (brickHeight - mortarWidth * 2),
                    4, 4
                );
            }
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}
