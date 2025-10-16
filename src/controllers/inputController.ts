// Input Controller - Handles keyboard and touch input
import * as THREE from 'three';

export class InputController {
    private onMove?: (direction: 'left' | 'right' | 'forward' | 'backward') => void;
    private onTap?: (x: number, y: number) => void;
    private canvas: HTMLCanvasElement;
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    private touchStartTime: number = 0;
    private swipeThreshold: number = 50; // Minimum swipe distance in pixels
    private tapThreshold: number = 300; // Maximum time for a tap in milliseconds

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
     * Set callback for tap events
     */
    public onTapEvent(callback: (x: number, y: number) => void): void {
        this.onTap = callback;
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
                this.touchStartTime = Date.now();
            }
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e: TouchEvent) => {
            if (e.changedTouches.length === 1) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndTime = Date.now();
                
                const deltaX = touchEndX - this.touchStartX;
                const deltaY = touchEndY - this.touchStartY;
                const deltaTime = touchEndTime - this.touchStartTime;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Check if this is a tap (short duration and small movement)
                if (distance < 10 && deltaTime < this.tapThreshold) {
                    // This is a tap
                    if (this.onTap) {
                        this.onTap(touchEndX, touchEndY);
                    }
                } else if (this.onMove) {
                    // This is a swipe - determine direction
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
            }
        }, { passive: true });
    }
}
