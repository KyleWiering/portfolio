// Input Controller - Handles keyboard and touch input
export class InputController {
    private onMove?: (direction: 'left' | 'right' | 'forward' | 'backward') => void;
    private canvas: HTMLCanvasElement;
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    private swipeThreshold: number = 50; // Minimum swipe distance in pixels

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    /**
     * Initialize input listeners
     */
    public initialize(): void {
        this.setupKeyboardControls();
        this.setupTouchControls();
    }

    /**
     * Set callback for movement
     */
    public onMovement(callback: (direction: 'left' | 'right' | 'forward' | 'backward') => void): void {
        this.onMove = callback;
    }

    /**
     * Set up keyboard controls for desktop (arrow keys)
     */
    private setupKeyboardControls(): void {
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.onMove) return;

            switch(e.key) {
                case 'ArrowLeft':
                    this.onMove('left');
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.onMove('right');
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.onMove('forward');
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.onMove('backward');
                    e.preventDefault();
                    break;
            }
        });
    }

    /**
     * Set up touch controls for mobile navigation
     */
    private setupTouchControls(): void {
        this.canvas.addEventListener('touchstart', (e: TouchEvent) => {
            if (e.touches.length === 1) {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e: TouchEvent) => {
            if (e.changedTouches.length === 1 && this.onMove) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const deltaX = touchEndX - this.touchStartX;
                const deltaY = touchEndY - this.touchStartY;
                
                // Determine swipe direction
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe (left/right)
                    if (Math.abs(deltaX) > this.swipeThreshold) {
                        if (deltaX > 0) {
                            // Swipe right - move right
                            this.onMove('right');
                        } else {
                            // Swipe left - move left
                            this.onMove('left');
                        }
                    }
                } else {
                    // Vertical swipe (forward/backward)
                    if (Math.abs(deltaY) > this.swipeThreshold) {
                        if (deltaY > 0) {
                            // Swipe down - move backward (closer)
                            this.onMove('backward');
                        } else {
                            // Swipe up - move forward (away)
                            this.onMove('forward');
                        }
                    }
                }
            }
        }, { passive: true });
    }
}
