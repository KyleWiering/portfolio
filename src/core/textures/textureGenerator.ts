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
    
    // Create a 10x10 checkerboard pattern
    const tileSize = 51.2; // 512/10 = 51.2 pixels per square
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
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

/**
 * Create a circular pattern texture for hockey pucks
 */
export function createCircularPuckTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    
    const centerX = 256;
    const centerY = 256;
    const maxRadius = 256;
    
    // Create concentric circles pattern
    for (let radius = maxRadius; radius > 0; radius -= 8) {
        const intensity = 1 - (radius / maxRadius) * 0.3; // Lighter towards center
        const grayValue = Math.floor(128 * intensity);
        context.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.fill();
    }
    
    // Add fine circular grooves for realism
    for (let radius = 20; radius < maxRadius; radius += 16) {
        context.strokeStyle = `rgba(0, 0, 0, 0.15)`;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.stroke();
    }
    
    // Add subtle radial lines from center
    const numLines = 32;
    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        const startRadius = 10;
        const endRadius = maxRadius;
        
        context.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(
            centerX + Math.cos(angle) * startRadius,
            centerY + Math.sin(angle) * startRadius
        );
        context.lineTo(
            centerX + Math.cos(angle) * endRadius,
            centerY + Math.sin(angle) * endRadius
        );
        context.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

/**
 * Create a blonde beachwood texture for light checkers pieces
 */
export function createBeachwoodTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    
    // Base beachwood color - light blonde/tan with more variation
    const gradient = context.createLinearGradient(0, 0, 512, 0);
    gradient.addColorStop(0, '#f5deb3'); // Wheat color
    gradient.addColorStop(0.3, '#ead5a7');
    gradient.addColorStop(0.6, '#d4bc8e');
    gradient.addColorStop(1, '#c9a96e');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    // Add more pronounced wood grain - darker, more visible lines
    for (let i = 0; i < 60; i++) {
        const y = Math.random() * 512;
        const darkness = 0.1 + Math.random() * 0.2;
        context.strokeStyle = `rgba(139, 115, 85, ${darkness})`;
        context.lineWidth = 0.8 + Math.random() * 1.5;
        
        context.beginPath();
        context.moveTo(0, y);
        
        // Wavy grain line with more variation
        for (let x = 0; x <= 512; x += 6) {
            const wave = Math.sin(x * 0.03 + Math.random() * 2) * 4;
            context.lineTo(x, y + wave);
        }
        context.stroke();
    }
    
    // Add more visible growth rings for circular pattern (for top of puck)
    const centerX = 256;
    const centerY = 256;
    for (let radius = 30; radius < 300; radius += 20 + Math.random() * 12) {
        const opacity = 0.08 + Math.random() * 0.15;
        context.strokeStyle = `rgba(160, 130, 90, ${opacity})`;
        context.lineWidth = 1.5 + Math.random() * 2.5;
        
        context.beginPath();
        // Irregular ellipse for natural wood rings
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
            const waviness = Math.sin(angle * 5) * 10;
            const r = radius + waviness + Math.random() * 6;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r * 0.8; // Elliptical
            
            if (angle === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.closePath();
        context.stroke();
    }
    
    // Add wood knots for more character
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = 8 + Math.random() * 15;
        
        // Darker knot center
        const knotGradient = context.createRadialGradient(x, y, 0, x, y, size);
        knotGradient.addColorStop(0, 'rgba(100, 70, 40, 0.4)');
        knotGradient.addColorStop(0.5, 'rgba(120, 90, 60, 0.2)');
        knotGradient.addColorStop(1, 'rgba(140, 110, 80, 0)');
        context.fillStyle = knotGradient;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
        
        // Knot rings
        for (let r = 2; r < size; r += 3) {
            context.strokeStyle = `rgba(90, 60, 30, ${0.1 + Math.random() * 0.1})`;
            context.lineWidth = 1;
            context.beginPath();
            context.arc(x, y, r, 0, Math.PI * 2);
            context.stroke();
        }
    }
    
    // Add more texture noise for realism
    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 12;
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
 * Create a dark ebony wood texture for dark checkers pieces
 */
export function createEbonyTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    
    // Base ebony color - very dark brown/black
    const gradient = context.createLinearGradient(0, 0, 512, 0);
    gradient.addColorStop(0, '#1a0f0a'); // Very dark brown
    gradient.addColorStop(0.5, '#2b1810');
    gradient.addColorStop(1, '#0f0805');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    // Add subtle wood grain - very dark lines
    for (let i = 0; i < 35; i++) {
        const y = Math.random() * 512;
        const darkness = 0.15 + Math.random() * 0.2;
        context.strokeStyle = `rgba(0, 0, 0, ${darkness})`;
        context.lineWidth = 0.5 + Math.random() * 1.5;
        
        context.beginPath();
        context.moveTo(0, y);
        
        // Wavy grain line
        for (let x = 0; x <= 512; x += 8) {
            const wave = Math.sin(x * 0.025 + Math.random() * 2) * 4;
            context.lineTo(x, y + wave);
        }
        context.stroke();
    }
    
    // Add very subtle lighter streaks for depth
    for (let i = 0; i < 15; i++) {
        const y = Math.random() * 512;
        context.strokeStyle = `rgba(80, 50, 30, ${0.05 + Math.random() * 0.1})`;
        context.lineWidth = 1 + Math.random() * 2;
        
        context.beginPath();
        context.moveTo(0, y);
        for (let x = 0; x <= 512; x += 10) {
            const wave = Math.sin(x * 0.02) * 2;
            context.lineTo(x, y + wave);
        }
        context.stroke();
    }
    
    // Add growth rings for circular pattern (for top of puck)
    const centerX = 256;
    const centerY = 256;
    for (let radius = 40; radius < 280; radius += 30 + Math.random() * 20) {
        const opacity = 0.08 + Math.random() * 0.12;
        context.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
        context.lineWidth = 1 + Math.random() * 2;
        
        context.beginPath();
        // Irregular ellipse for natural wood rings
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
            const waviness = Math.sin(angle * 6) * 6;
            const r = radius + waviness + Math.random() * 4;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r * 0.85; // Elliptical
            
            if (angle === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.closePath();
        context.stroke();
    }
    
    // Add subtle texture noise
    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 6;
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
