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
 * Hockey puck dimensions
 */
export const PUCK_COVERAGE = 0.9; // Pucks cover 90% of the square
export const PUCK_RADIUS = PUCK_COVERAGE / 2; // 0.45 units
export const PUCK_HEIGHT = 0.15; // Short height like a real hockey puck
export const PUCK_RADIAL_SEGMENTS = 32; // Smooth circular appearance

/**
 * Board positioning
 */
export const GRID_Y_POSITION = -2; // Y position of the isometric grid
export const BOARD_Y_POSITION = -1.9; // Y position of the checkerboard plane
export const PUCK_Y_OFFSET = PUCK_HEIGHT / 2; // Offset to place puck on board surface

/**
 * Selection indicator positioning
 */
export const SELECTION_INDICATOR_HEIGHT_OFFSET = 1.0; // Height above piece for selection indicator

/**
 * Camera configuration
 */
export const CAMERA_FOV = 75; // Field of view in degrees
export const CAMERA_NEAR_PLANE = 0.1; // Near clipping plane
export const CAMERA_FAR_PLANE = 2000; // Far clipping plane to see horizon
export const CAMERA_INITIAL_Y = 8; // Initial camera Y position
export const CAMERA_INITIAL_Z = 4; // Initial camera Z position
export const CAMERA_TARGET_Y = -1; // Camera look-at target Y position

/**
 * Zoom configuration
 */
export const MIN_ZOOM_DISTANCE = 6; // Minimum zoom distance
export const MAX_ZOOM_DISTANCE = 12; // Maximum zoom distance
export const ZOOM_SPEED = 0.5; // Zoom speed for wheel

/**
 * Pan configuration
 */
export const PAN_SPEED = 0.01; // Pan speed multiplier

/**
 * Grid configuration
 */
export const GRID_SIZE = 20; // Grid size (20x20)
export const GRID_SPACING = 1; // Grid spacing in units
export const GRID_COLOR = 0x808080; // Grey color
export const GRID_OPACITY = 0.3; // Grid opacity
export const GRID_DASH_SIZE = 0.1; // Dash size for grid lines
export const GRID_GAP_SIZE = 0.1; // Gap size for grid lines

/**
 * Border configuration
 */
export const BORDER_WIDTH = 0.5; // Width of wood border
export const BORDER_HEIGHT = 0.3; // Height of wood border
export const BORDER_COLOR = 0x8B4513; // Brown wood color

/**
 * Water pool configuration
 */
export const WATER_POOL_WIDTH = 3; // Width of water pool around board
export const WATER_POOL_DEPTH = 1; // Depth below the board
export const WATER_COLOR = 0x1e90ff; // Dodger blue
export const WATER_OPACITY = 0.7; // Water transparency
export const WATERFALL_HEIGHT = 2; // Height of waterfall
export const WATERFALL_OPACITY = 0.5; // Waterfall transparency

/**
 * Grassy field configuration
 */
export const GRASS_FIELD_SIZE = 500; // Large field extending to horizon
export const GRASS_TEXTURE_REPEAT = 100; // Texture repeat count
export const GRASS_COLOR = 0x228B22; // Forest green
export const GRASS_Y_POSITION = -2.1; // Below the board and grid

/**
 * Cragged edges configuration
 */
export const CRAG_COUNT = 40; // Number of cragged rocks
export const CRAG_COLOR = 0x696969; // Dim gray

/**
 * Lighting configuration
 */
export const AMBIENT_LIGHT_COLOR = 0xffffff; // White light
export const AMBIENT_LIGHT_INTENSITY = 0.5; // Increased ambient intensity for better visibility
export const DIRECTIONAL_LIGHT_COLOR = 0xffffff; // White light
export const DIRECTIONAL_LIGHT_INTENSITY = 1.0; // Increased main light intensity
export const DIRECTIONAL_LIGHT_X = 8; // Light X position
export const DIRECTIONAL_LIGHT_Y = 12; // Light Y position
export const DIRECTIONAL_LIGHT_Z = 8; // Light Z position
export const SHADOW_CAMERA_NEAR = 0.5; // Shadow camera near plane
export const SHADOW_CAMERA_FAR = 30; // Shadow camera far plane
export const SHADOW_CAMERA_SIZE = 12; // Shadow camera bounds
export const SHADOW_BIAS = -0.0001; // Shadow bias to prevent artifacts

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
