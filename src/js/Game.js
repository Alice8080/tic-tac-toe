import { BLOCK_WIDTH, GAME_WIDTH, PLAYERS_COLORS } from './constants.js';
import { nextMove, randomCoordinate, getGame, drawMove } from './functions.js';

const player = document.getElementById('player');
const winner = document.getElementById('winner');
const final = document.getElementById('final');

export class Game {
    constructor(newGame, computerGame, difficulty, firstMove) {
        const savedGame = getGame(); // Получение сохраненной игры из localStorage
        if (!savedGame || (savedGame && savedGame.isFinal) || newGame) { // Если сохраненной игры нет, либо она завершена, начинается новая игра
            this.game = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];
            this.player = 1;
            this.isFinal = false;
            this.winner = undefined;
            this.firstCoordinate = [];
            this.moveNumber = 0;
            this.computerGame = computerGame;
            this.firstMove = firstMove;
            this.difficulty = difficulty; // low - рандомные ходы компьютера, high - не рандомные ходы компьютера
            if (this.computerGame && this.firstMove === 'computer') {
                if (this.difficulty === 'high') {
                    this.game[1][1] = 1;
                    drawMove(1, 1, 1);
                    this.moveNumber += 1;
                    this.player = 2;
                } else {
                    const coordinates = [];
                    for (let y = 0; y < this.game.length; y++) {
                        for (let x = 0; x < this.game[y].length; x++) {
                            coordinates.push([y, x]);
                        } 
                    }
                    const [y, x] = randomCoordinate(coordinates);
                    this.game[y][x] = 1;
                    drawMove(y, x, 1);
                    this.moveNumber += 1;
                    this.player = 2;
                }
            }
            this.saveGame();
        } else { // Иначе загружается и отображается сохраненная
            this.game = savedGame.game;
            this.player = savedGame.player;
            this.isFinal = savedGame.isFinal;
            this.winner = savedGame.winner;
            this.computerGame = savedGame.computerGame;
            this.difficulty = savedGame.difficulty;
            this.moveNumber = savedGame.moveNumber;
            this.firstMove = savedGame.firstMove;
            this.firstCoordinate = savedGame.firstCoordinate;
            this.render();
        }

        this.renderPlayer(); // Отображение информации о том, чей сейчас ход
    }

    move(y, x) { // Ход игрока 
        if (!this.isFinal) { // Если игра еще не закончена
            let gameY, gameX; // Определяем координаты, куда сходил игрок
            if (x >= 0 && x <= BLOCK_WIDTH) { // Первая колонка
                gameX = 0;
            } else if (x > BLOCK_WIDTH && x <= BLOCK_WIDTH * 2) { // Вторая колонка
                gameX = 1;
            } else if (x > BLOCK_WIDTH * 2 && x <= BLOCK_WIDTH * 3) { // Третья колонка
                gameX = 2;
            }

            if (y >= 0 && y <= BLOCK_WIDTH) { // Первый ряд
                gameY = 0;
            } else if (y > BLOCK_WIDTH && y <= BLOCK_WIDTH * 2) { // Второй ряд
                gameY = 1;
            } else if (y > BLOCK_WIDTH * 2 && y <= BLOCK_WIDTH * 3) { // Третий ряд
                gameY = 2;
            }

            if (gameX !== undefined && gameY !== undefined && !this.game[gameY][gameX]) {
                this.moveNumber += 1;
                if (this.moveNumber === 1) {
                    this.firstCoordinate = [gameY, gameX];
                }

                this.game[gameY][gameX] = this.player;  // Меняем положение на игровом поле
                drawMove(gameY, gameX, this.player); // Отображаем на странице ход игрока
                this.isEnd(); // Проверяем, закончена ли игра после хода игрока

                if (this.isFinal) {
                    this.final();
                } else { // Если игра не закончена
                    if (this.computerGame) { // Если игра с компьютером
                        const freePlaces = []; // Находим все пустые места, куда можно сходить
                        for (let y = 0; y < GAME_WIDTH; y++) {
                            for (let x = 0; x < GAME_WIDTH; x++) {
                                if (!this.game[y][x]) {
                                    freePlaces.push([y, x]);
                                }
                            }
                        }
                        let y, x;
                        if (this.difficulty === 'low') {
                            [y, x] = randomCoordinate(freePlaces);
                        } else {
                            const computerPlayer = this.player === 1 ? 2 : 1;
                            [y, x] = nextMove(this.game, this.moveNumber, [gameY, gameX], this.firstCoordinate, computerPlayer);
                        }

                        const computerMove = this.firstMove === 'computer' ? 1 : 2;
                        this.game[y][x] = computerMove;
                        drawMove(y, x, computerMove); // Отображаем на странице ход  компьютера
                        this.isEnd(computerMove); // Проверяем, закончена ли игра после хода компьютера

                        if (this.isFinal) {
                            this.final();
                        }
                    } else { // Если игра с человеком
                        this.player = this.player === 1 ? 2 : 1; // Меняем игрока на следующего
                        this.renderPlayer();
                    }
                }
                this.saveGame(); // Сохраняем игру в localStorage
            }
        }
    }

    isEnd(player = this.player) {
        let totalFilled = 0;
        for (let i = 0; i < GAME_WIDTH; i++) {
            let filledItems = 0;
            for (let j = 0; j < GAME_WIDTH; j++) {
                if (this.game[j][i] === player) {
                    filledItems++;
                }
                if (this.game[i][j]) {
                    totalFilled++;
                }
            }
            const filledDiagonal = (this.game[0][0] === player && this.game[1][1] === player && this.game[2][2] === player)
                || (this.game[0][2] === player && this.game[1][1] === player && this.game[2][0] === player);

            const filledRow = this.game[i].every(item => item === player);
            const filledColumn = filledItems === 3;
            const filledAll = totalFilled === 9;

            // Если игрок заполнил своими фигурами ряд, колонку или диагональ, игра заканчивается
            if (filledRow || filledColumn || filledDiagonal) {
                this.winner = player; // Определение победителя
                this.isFinal = true;
            }

            // Если свободных клеток не осталось, игра заканчивается
            if (filledAll) {
                this.isFinal = true;
            }
        }
    }

    final() {
        if (this.winner) {
            if (this.computerGame && this.player !== this.firstMove) {
                winner.textContent = 'Победил компьютер';
            } else {
                winner.textContent = `Победил игрок ${this.winner}`;
            }
            winner.style.backgroundColor = PLAYERS_COLORS[this.winner];
        } else {
            winner.textContent = `Результат игры: ничья`;
            winner.style.backgroundColor = '#1d1d1d';
        }
        final.textContent = 'Игра окончена';
        player.textContent = '';
    }

    saveGame() {
        const data = JSON.stringify({
            game: this.game,
            player: this.player,
            isFinal: this.isFinal,
            winner: this.winner,
            computerGame: this.computerGame,
            difficulty: this.difficulty,
            moveNumber: this.moveNumber,
            firstCoordinate: this.firstCoordinate,
            firstMove: this.firstMove,
        });
        localStorage.setItem('tic-tac-toe', data);
    }

    renderPlayer() { // Отображение информации о том, чей сейчас ход
        player.textContent = `Ходит игрок ${this.player}`;
        player.style.backgroundColor = PLAYERS_COLORS[this.player];
    }

    render() { // Отображение сохраненной игры на поле
        for (let y = 0; y < GAME_WIDTH; y++) {
            for (let x = 0; x < GAME_WIDTH; x++) {
                if (this.game[y][x]) {
                    drawMove(y, x, this.game[y][x]); // Отображаем на странице ход игрока
                }
            }
        }
        this.renderPlayer();
    }
}