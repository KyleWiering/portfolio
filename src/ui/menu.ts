// Menu UI Controller - Handles menu interactions and settings panel
export class MenuController {
    private settingsPanel: HTMLElement | null;
    private settingsButton: HTMLElement | null;
    private closeSettingsButton: HTMLElement | null;
    private textureToggle: HTMLInputElement | null;
    private modelButtons: NodeListOf<Element>;
    
    private onModelSelect?: (modelType: string) => void;
    private onTextureToggle?: (useTexture: boolean) => void;

    constructor() {
        this.settingsPanel = document.getElementById('settings-panel');
        this.settingsButton = document.getElementById('settings-button');
        this.closeSettingsButton = document.getElementById('close-settings');
        this.textureToggle = document.getElementById('texture-toggle') as HTMLInputElement;
        this.modelButtons = document.querySelectorAll('.menu-section button[data-model]');
    }

    /**
     * Initialize menu event listeners
     */
    public initialize(): void {
        this.setupModelButtons();
        this.setupTextureToggle();
        this.setupSettingsPanel();
    }

    /**
     * Set callback for model selection
     */
    public onModelChange(callback: (modelType: string) => void): void {
        this.onModelSelect = callback;
    }

    /**
     * Set callback for texture toggle
     */
    public onTextureChange(callback: (useTexture: boolean) => void): void {
        this.onTextureToggle = callback;
    }

    /**
     * Update active model button
     */
    public setActiveModel(modelType: string): void {
        this.modelButtons.forEach(btn => {
            if (btn.getAttribute('data-model') === modelType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Set up model selection buttons
     */
    private setupModelButtons(): void {
        this.modelButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modelType = button.getAttribute('data-model');
                if (modelType && this.onModelSelect) {
                    this.setActiveModel(modelType);
                    this.onModelSelect(modelType);
                }
            });
        });
    }

    /**
     * Set up texture toggle
     */
    private setupTextureToggle(): void {
        if (this.textureToggle) {
            this.textureToggle.addEventListener('change', () => {
                if (this.onTextureToggle) {
                    this.onTextureToggle(this.textureToggle!.checked);
                }
            });
        }
    }

    /**
     * Set up settings panel toggle and close functionality
     */
    private setupSettingsPanel(): void {
        if (this.settingsButton && this.settingsPanel) {
            this.settingsButton.addEventListener('click', () => {
                this.showSettings();
            });
        }

        if (this.closeSettingsButton && this.settingsPanel) {
            this.closeSettingsButton.addEventListener('click', () => {
                this.hideSettings();
            });
        }
    }

    /**
     * Allow closing settings panel from external click
     */
    public registerCanvasClickHandler(canvas: HTMLCanvasElement): void {
        if (this.settingsPanel) {
            canvas.addEventListener('click', (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                // Only close if clicking on the canvas itself
                if (!this.settingsPanel!.contains(target) && 
                    !this.settingsButton?.contains(target) && 
                    this.settingsPanel!.style.display === 'block' &&
                    target === canvas) {
                    this.hideSettings();
                }
            });
        }
    }

    /**
     * Show settings panel
     */
    private showSettings(): void {
        if (this.settingsPanel) {
            this.settingsPanel.style.display = 'block';
        }
    }

    /**
     * Hide settings panel
     */
    private hideSettings(): void {
        if (this.settingsPanel) {
            this.settingsPanel.style.display = 'none';
        }
    }
}
