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
            // Clicked on empty space - try to move selected piece here
            if (checkersManager.getSelectedPieceIndex() >= 0) {
                // Cast ray to the board plane to get grid coordinates
                const boardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.9);
                const intersectPoint = new THREE.Vector3();
                raycaster.ray.intersectPlane(boardPlane, intersectPoint);
                
                // Round to nearest grid position
                const gridX = Math.round(intersectPoint.x);
                const gridZ = Math.round(intersectPoint.z);
                
                // Attempt to move piece
                const result = checkersManager.movePiece({ x: gridX, z: gridZ });
                
                if (!result.success && result.message) {
                    console.log('Move failed:', result.message);
                } else if (result.success) {
                    console.log('Move successful!');
                    if (result.captured && result.captured.length > 0) {
                        console.log('Captured pieces:', result.captured.length);
                    }
                    if (result.becameKing) {
                        console.log('Piece became a king!');
                    }
                }
            } else {
                // Deselect if no piece selected
                checkersManager.deselectPiece();
            }
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
                <h5>🎯 How to Play</h5>
                <p><strong>Click/Tap:</strong> Select your piece</p>
                <p><strong>Click Board:</strong> Move to that square</p>
                <p>• Blue sphere shows selected piece</p>
                <p id="current-player">• Current turn: <strong>Black</strong></p>
            </div>
            <div class="control-section">
                <h5>📋 Rules</h5>
                <p>• Move diagonally forward 1 space</p>
                <p>• First move can be 1 or 2 spaces</p>
                <p>• Must jump opponent when possible</p>
                <p>• Capture by jumping over opponent</p>
                <p>• Multi-jumps allowed</p>
                <p>• Reach opposite side to become King</p>
                <p>• Kings move backward and forward</p>
            </div>
            <div class="control-section">
                <h5>ℹ️ Board Setup</h5>
                <p>• Black pieces: Top (2 rows, all squares)</p>
                <p>• White pieces: Bottom (2 rows, all squares)</p>
                <p>• 16 pieces per side (8 per row)</p>
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
        
        // Update current player display
        const currentPlayerElement = document.getElementById('current-player');
        if (currentPlayerElement) {
            currentPlayerElement.innerHTML = `• Current: <strong>${checkersManager.getStatusMessage()}</strong>`;
        }
        
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
