let blockWidth = 200;
if (window.screen.width < 400) { // Адаптивность размера игры для мобильных устройств
    blockWidth = 100;
}
export const BLOCK_WIDTH = blockWidth;
export const FIGURE_WIDTH = 14;
export const GAME_WIDTH = 3;
export const PLAYERS_COLORS = {
    '1': '#ee1919',
    '2': '#1a26cd',
}