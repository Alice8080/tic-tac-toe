import { BLOCK_WIDTH, FIGURE_WIDTH, PLAYERS_COLORS } from './constants.js';
import { Game } from './Game.js';

const gameBoard = document.getElementById('game');
const ctx = gameBoard.getContext("2d");
const winner = document.getElementById('winner');
const final = document.getElementById('final');
const newGameBtn = document.getElementById('new-game');
const players = document.querySelector('.game__players');
const difficulty = document.querySelector('.game__difficulty');
const firstMove = document.querySelector('.game__first-move');
const score = document.querySelector('.game__score');

export function nextMove(game, moveNumber, coordinate, firstCoordinate, computerPlayer) { // Определение следующего хода при высокой сложности игры
    const [opponentY, opponentX] = coordinate;
    const opponentPosition = getPosition(opponentY, opponentX);
    const [firstY, firstX] = firstCoordinate;
    const firstPosition = getPosition(firstY, firstX);
    let y;
    let x;
    switch (moveNumber) {
        case 1:
            if (opponentPosition === 'center') { // Если игрок сходил в центр, сходить в угол
                y = 0;
                x = 2;
            } else { // Иначе сходить в центр
                y = 1;
                x = 1;
            }
            break;
        case 2:
            if (firstPosition === 'center' || computerPlayer === 1) { 
                if (!game[2][0]) {
                    y = 2;
                    x = 0;
                } else {
                    y = 2;
                    x = 2;
                }
            } else if (firstPosition === 'corner') {
                // Если крестики сделали первый ход в угол, следующим ходом занять угол, противоположный первому ходу крестиков, 
                // а если это невозможно — пойти на сторону
                y = firstY === 0 ? 2 : 0;
                x = firstX === 0 ? 2 : 0;

                if (game[y][x]) {
                    y = 1;
                    x = 0;
                }
            } else { // Если крестики сделали первый ход на сторону, отвечать в зависимости от второго хода крестиков
                if (opponentPosition === 'corner') { // Если следующий ход крестиков — в угол, занять противоположный угол
                    y = opponentY === 0 ? 2 : 0;
                    x = opponentX === 0 ? 2 : 0;
                } else if (opponentPosition === 'side') {
                    // Если следующий ход крестиков — на сторону рядом с их первым ходом, пойти в угол рядом с обоими крестиками
                    if (game[0][1] === 1 && game[1][0] === 1) {
                        y = 0;
                        x = 0;
                    } else if (game[0][1] === 1 && game[1][2] === 1) {
                        y = 0;
                        x = 2;
                    } else if (game[1][2] === 1 && game[2][1] === 1) {
                        y = 2;
                        x = 2;
                    } else if (game[2][1] === 1 && game[1][0] === 1) {
                        y = 2;
                        x = 0;
                    } else { // Если следующий ход крестиков — на противоположную сторону, пойти в любой угол
                        x = 0;
                        y = 0;
                    }
                }
            }
            break;
        default:
            [y, x] = bestCoordinate(game, computerPlayer);
            break;
    }
    return [y, x];
}

function bestCoordinate(game, computerPlayer) {
    const player = computerPlayer === 1 ? 2 : 1;
    const winCoordinates = [];
    const opponentWinCoordinates = [];
    const freeCoordinates = [];

    const lines = {
        'rows': [],
        'columns': [],
        'diagonals': []
    }
    for (let y = 0; y < game.length; y++) {
        const row = game[y];
        lines.rows[y] = row;

        const col = [];
        for (let x = 0; x < row.length; x++) {
            col.push(game[x][y]);

            if (!game[y][x]) {
                freeCoordinates.push([y, x]);
            }
        }
        lines.columns[y] = col;
    }
    lines.diagonals[0] = [game[0][0], game[1][1], game[2][2]];
    lines.diagonals[1] = [game[0][2], game[1][1], game[2][0]];

    for (let [lineName, lineItems] of Object.entries(lines)) {
        for (let lineID = 0; lineID < lineItems.length; lineID++) {
            const line = lineItems[lineID];
            const opponentMoves = line.filter(item => item === player).length;
            const moves = line.filter(item => item === computerPlayer).length;
            const freePlaces = line.filter(item => item === 0).length;
            if (freePlaces === 1) { // Если в ряду, колонке или диагонали осталось 1 свободное место (компьютер или игрок может победить в следующем ходу)
                const freePlace = line.indexOf(0);
                let coordinate; // Определяем координату свободного места
                if (lineName === 'rows') { // Если свободное место в ряду
                    coordinate = [lineID, freePlace];
                } else if (lineName === 'columns') { // Если свободное место в колонке
                    coordinate = [freePlace, lineID];
                } else { // Если свободное место в диагонали
                    if (lineID === 0) {
                        coordinate = [freePlace, freePlace];
                    } else {
                        if (freePlace === 0) {
                            coordinate = [0, 2];
                        } else if (freePlace === 1) {
                            coordinate = [1, 1];
                        } else {
                            coordinate = [2, 0];
                        }
                    }
                }
                if (moves === 2) { // Если в ряду 2 хода компьютера
                    winCoordinates.push(coordinate)
                } else if (opponentMoves === 2) { // Если в ряду 2 хода игрока
                    opponentWinCoordinates.push(coordinate);
                }
            }
        }
    }

    if (winCoordinates.length > 0) { // Если можно выиграть следующим ходом
        return randomCoordinate(winCoordinates);
    } else if (opponentWinCoordinates.length > 0) { // Если можно не дать выиграть оппоненту в его следующем ходу
        return randomCoordinate(opponentWinCoordinates);
    } else { // Если первые два условия не срабатывают, сходить в любое свободное место
        return randomCoordinate(freeCoordinates);
    }
}

export function randomCoordinate(array) { // Рандомная координата из массива
    const count = array.length;
    const random = Math.random() * count;
    const coordinate = array[Math.floor(random)];
    return coordinate;
}

export function getGame() { // Получить сохраненную в localStorage игру
    const data = localStorage.getItem('tic-tac-toe');
    return JSON.parse(data);
}

export function drawMove(y, x, player) { // Отрисовка хода игрока на поле
    const color = PLAYERS_COLORS[player]; // Определение цвета фигуры игрока
    if (player === 1) { // Ход игрока 1 (ходит крестиками)
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo((x * BLOCK_WIDTH) + FIGURE_WIDTH, (y * BLOCK_WIDTH) + FIGURE_WIDTH);
        ctx.lineWidth = FIGURE_WIDTH;
        ctx.lineTo((x * BLOCK_WIDTH) + BLOCK_WIDTH - FIGURE_WIDTH, (y * BLOCK_WIDTH) + BLOCK_WIDTH - FIGURE_WIDTH);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo((x * BLOCK_WIDTH) + BLOCK_WIDTH - FIGURE_WIDTH, (y * BLOCK_WIDTH) + FIGURE_WIDTH);
        ctx.lineWidth = FIGURE_WIDTH;
        ctx.lineTo((x * BLOCK_WIDTH) + FIGURE_WIDTH, (y * BLOCK_WIDTH) + BLOCK_WIDTH - FIGURE_WIDTH);
        ctx.stroke();
    } else if (player === 2) { // Ход игрока 2 (ходит ноликами)
        const ellipseY = (y * BLOCK_WIDTH) + BLOCK_WIDTH / 2;
        const ellipseX = (x * BLOCK_WIDTH) + BLOCK_WIDTH / 2;
        const ellipseWidth = 75;
        ctx.beginPath();
        ctx.ellipse(ellipseX, ellipseY, ellipseWidth, ellipseWidth, Math.PI / 4, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

function renderGame() { // Отображение игрового поля
    gameBoard.width = BLOCK_WIDTH * 3;
    gameBoard.height = BLOCK_WIDTH * 3;
    if (gameBoard.getContext) { // Отображаем разметку игры
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                const color = '#303030';
                ctx.fillStyle = color;
                ctx.fillRect(x * BLOCK_WIDTH, y * BLOCK_WIDTH, BLOCK_WIDTH, BLOCK_WIDTH);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#3b3b3b";
                ctx.strokeRect(x * BLOCK_WIDTH, y * BLOCK_WIDTH, BLOCK_WIDTH, BLOCK_WIDTH);
            }
        }
    }
}

function startGame(arg) { // Начать новую игру
    newGameBtn.style.display = 'flex';
    score.style.display = 'block';
    const { newGame, computerGame, difficulty, firstMove } = arg;
    winner.textContent = ''; // Удаляем информацию о финале прошлой игры
    final.textContent = '';
    renderGame();
    const game = new Game(newGame, computerGame, difficulty, firstMove); // Создание объекта игры
    gameBoard.onclick = (e) => { // При нажатии на игровое поле происходит ход 
        const x = e.offsetX;
        const y = e.offsetY;
        game.move(y, x);
    };
    // При начале игры с помощью кнопки "Новая игра" всегда создается пустое поле и не учитывается сохраненная игра, поэтому флаг newGame равен true
    newGameBtn.onclick = () => {
        choiceOptions({ newGame: true });
    };
}

function getPosition(y, x) {
    if (y === 1 && x === 1) {
        return 'center';
    } else if ((y === 0 && x === 0) || (y === 0 && x === 2) || (y === 2 && x === 2) || (y === 2 && x === 0)) {
        return 'corner';
    } else {
        return 'side';
    }
}

export function choiceOptions(arg) { // Выбор опций игры
    const savedGame = getGame(); // Получение сохраненной игры из localStorage
    if (!savedGame || (savedGame && savedGame.isFinal) || arg.newGame) {
        gameBoard.style.display = 'none';
        score.style.display = 'none';
        players.style.display = 'block';
        const options = arg;
        document.getElementById('players-game').addEventListener('click', () => {
            options.computerGame = false;
            options.difficulty = undefined;
            players.style.display = 'none';
            gameBoard.style.display = 'block';
            startGame(options);
        });
        document.getElementById('computer-game').addEventListener('click', () => {
            options.computerGame = true;
            players.style.display = 'none';
            firstMove.style.display = 'block';
        });

        document.getElementById('first-human').addEventListener('click', () => {
            options.firstMove = 'human';
            firstMove.style.display = 'none';
            difficulty.style.display = 'block';
        });
        document.getElementById('first-computer').addEventListener('click', () => {
            options.firstMove = 'computer';
            firstMove.style.display = 'none';
            difficulty.style.display = 'block';
        });

        document.getElementById('difficulty-low').addEventListener('click', () => {
            options.difficulty = 'low';
            difficulty.style.display = 'none';
            gameBoard.style.display = 'block';
            startGame(options);
        });
        document.getElementById('difficulty-high').addEventListener('click', () => {
            options.difficulty = 'high';
            difficulty.style.display = 'none';
            gameBoard.style.display = 'block';
            startGame(options);
        });
    } else {
        startGame({ newGame: false, computerGame: savedGame.computerGame, difficulty: savedGame.computerGame });
    }
}