// 3D Model Viewer - Main Application Entry Point
// Separation of Concerns:
// - SceneRenderer: Handles WebGL scene setup and rendering
// - ModelManager: Manages model lifecycle and grid positioning
// - InputController: Handles keyboard and touch input

import { SceneRenderer } from './rendering/sceneRenderer';
import { ModelManager } from './managers/modelManager';
import { InputController } from './controllers/inputController';

/**
 * Initialize the 3D model viewer application
 */
function initModelViewer(): void {
    // Initialize renderer (handles scene, camera, lighting, grid)
    const renderer = new SceneRenderer('game-container');
    
    // Initialize model manager (handles model creation and positioning)
    const modelManager = new ModelManager(renderer.getScene());
    
    // Initialize input controller (handles keyboard and touch input)
    const inputController = new InputController(renderer.getCanvas());
    
    // Set up input callbacks
    inputController.onMovement((direction) => {
        modelManager.moveSelectedModel(direction);
        updateSelectedModelDisplay();
    });
    
    // Initialize input controller
    inputController.initialize();
    
    // Set up texture toggle functionality
    const textureToggle = document.getElementById('texture-toggle') as HTMLInputElement;
    if (textureToggle) {
        textureToggle.addEventListener('change', (e) => {
            const useTexture = (e.target as HTMLInputElement).checked;
            modelManager.displayAllModels(useTexture);
            updateSelectedModelDisplay();
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

    // Set up model selection buttons
    const prevModelButton = document.getElementById('prev-model');
    const nextModelButton = document.getElementById('next-model');

    if (prevModelButton) {
        prevModelButton.addEventListener('click', () => {
            modelManager.selectPreviousModel();
            updateSelectedModelDisplay();
        });
    }

    if (nextModelButton) {
        nextModelButton.addEventListener('click', () => {
            modelManager.selectNextModel();
            updateSelectedModelDisplay();
        });
    }

    // Function to update the selected model display
    function updateSelectedModelDisplay(): void {
        const selectedModelText = document.getElementById('selected-model-text');
        if (selectedModelText) {
            const modelType = modelManager.getSelectedModelType();
            const icons = {
                'pyramid': '🔺',
                'cube': '🔲',
                'sphere': '🔵'
            };
            const modelName = modelType.charAt(0).toUpperCase() + modelType.slice(1);
            selectedModelText.textContent = `${icons[modelType]} ${modelName}`;
        }
    }
    
    // Display all models (pyramid, cube, sphere) on the grid
    modelManager.displayAllModels(false);
    updateSelectedModelDisplay();

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
