/**
 * Shared constants for the checkers board configuration
 * These constants ensure consistency across the application
 */

/**
 * Board dimensions and layout
 */
export const BOARD_SIZE = 10; // 10x10 checkerboard
export const BOARD_HALF_SIZE = BOARD_SIZE / 2; // Half the board size (5)
export const TILE_SIZE = 1; // Each tile is 1 unit
export const BOARD_MIN = -BOARD_HALF_SIZE + 0.5; // -4.5
export const BOARD_MAX = BOARD_HALF_SIZE - 0.5; // 4.5

/**
 * Piece placement configuration
 */
export const PIECES_PER_SIDE_ROWS = 4; // Number of rows for each side's pieces
export const WHITE_PIECE_START_ROW = BOARD_SIZE - PIECES_PER_SIDE_ROWS; // Row 6 for 10x10 board

/**
 * Rendering configuration
 */
export interface ShadowMapConfig {
    width: number;
    height: number;
}

export const DEFAULT_SHADOW_MAP_SIZE: ShadowMapConfig = {
    width: 2048,
    height: 2048
};
