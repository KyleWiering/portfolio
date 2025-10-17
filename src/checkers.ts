// Checkers - 3D Checkers Game
// Main application entry point for the checkers viewer

import * as THREE from 'three';
import { CheckersRenderer } from './rendering/checkersRenderer';
import { CheckersManager } from './managers/checkersManager';
import { InputController } from './controllers/inputController';

/**
 * Initialize the checkers application
 */
function initCheckers(): void {
    // Initialize renderer with overhead camera view
    const renderer = new CheckersRenderer('game-container');
    
    // Initialize checkers manager
    const checkersManager = new CheckersManager(renderer.getScene());
    
    // Initialize input controller for piece selection via tap/click
    const inputController = new InputController(renderer.getCanvas());
    
    // Set up tap event for piece selection via raycasting
    inputController.onTapEvent((x: number, y: number) => {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        // Convert screen coordinates to normalized device coordinates (-1 to +1)
        const canvas = renderer.getCanvas();
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
        
        // Update the raycaster with the camera and mouse position
        raycaster.setFromCamera(mouse, renderer.getCamera());
        
        // Get all piece meshes for raycasting
        const pieceMeshes = checkersManager.getPieceMeshes();
        
        // Check for intersections (recursive=true to check children)
        const intersects = raycaster.intersectObjects(pieceMeshes, true);
        
        if (intersects.length > 0) {
            // Find the index of the intersected piece
            const intersectedMesh = intersects[0].object;
            const pieceIndex = pieceMeshes.indexOf(intersectedMesh as THREE.Mesh);
            
            if (pieceIndex !== -1) {
                checkersManager.selectPieceByIndex(pieceIndex);
            }
        } else {
            // Clicked on empty space - deselect
            checkersManager.deselectPiece();
        }
    });
    
    // Initialize input controller
    inputController.initialize();
    
    // Remove the texture toggle and model navigation from this version
    // Hide menu sections that don't apply to checkers
    const menuSection = document.querySelector('.menu-section');
    if (menuSection) {
        menuSection.remove();
    }
    
    // Update settings panel for checkers-specific controls
    const settingsContent = document.querySelector('.settings-content');
    if (settingsContent) {
        settingsContent.innerHTML = `
            <div class="control-section">
                <h5>🎯 Piece Selection</h5>
                <p><strong>Click/Tap:</strong> Select a checkers piece</p>
                <p>• Blue sphere appears above selected piece</p>
                <p>• Click empty space to deselect</p>
            </div>
            <div class="control-section">
                <h5>ℹ️ Board Information</h5>
                <p>• Black pieces: Left side (2 rows)</p>
                <p>• White pieces: Right side (2 rows)</p>
                <p>• Pieces do not rotate</p>
                <p>• Camera positioned overhead</p>
            </div>
        `;
    }

    // Set up settings panel
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettingsButton = document.getElementById('close-settings');

    if (settingsButton && settingsPanel) {
        settingsButton.addEventListener('click', () => {
            settingsPanel.style.display = 'block';
        });
    }

    if (closeSettingsButton && settingsPanel) {
        closeSettingsButton.addEventListener('click', () => {
            settingsPanel.style.display = 'none';
        });
    }

    // Initialize the checkers board
    checkersManager.initializeBoard();

    // Animation loop
    function animate(): void {
        requestAnimationFrame(animate);
        
        // Animate pieces (currently does nothing since rotation is disabled)
        checkersManager.animatePieces();
        
        // Render the scene
        renderer.render();
    }

    // Start animation
    animate();

    // Hide loader after scene is ready
    const loader = document.querySelector('.loader') as HTMLElement;
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCheckers);
} else {
    initCheckers();
}
