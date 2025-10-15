// 3D Model Viewer - Main Application Entry Point
// Separation of Concerns:
// - SceneRenderer: Handles WebGL scene setup and rendering
// - ModelManager: Manages model lifecycle and grid positioning

import { SceneRenderer } from './rendering/sceneRenderer';
import { ModelManager } from './managers/modelManager';

/**
 * Initialize the 3D model viewer application
 */
function initModelViewer(): void {
    // Initialize renderer (handles scene, camera, lighting, grid)
    const renderer = new SceneRenderer('game-container');
    
    // Initialize model manager (handles model creation and positioning)
    const modelManager = new ModelManager(renderer.getScene());
    
    // Set up texture toggle functionality
    const textureToggle = document.getElementById('texture-toggle') as HTMLInputElement;
    if (textureToggle) {
        textureToggle.addEventListener('change', (e) => {
            const useTexture = (e.target as HTMLInputElement).checked;
            modelManager.displayAllModels(useTexture);
        });
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
    
    // Display all models (pyramid, cube, sphere) on the grid
    modelManager.displayAllModels(false);

    // Animation loop
    function animate(): void {
        requestAnimationFrame(animate);
        
        // Rotate all models
        modelManager.rotateModels();
        
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
    document.addEventListener("DOMContentLoaded", initModelViewer);
} else {
    initModelViewer();
}
