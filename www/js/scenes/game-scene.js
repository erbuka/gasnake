"use strict";

const GameStates = {
    Playing: 0,
    Paused: 1
}

const GridValues = {
    Empty: 0,
    Wall: 1,
    Snake: 2,
    Fruit: 3
}

const Directions = {
    Left: new Vec2(-1, 0),
    Right: new Vec2(1, 0),
    Up: new Vec2(0, -1),
    Down: new Vec2(0, 1)
}

class GameScene extends Scene {

    constructor(app) {
        super(app);

        this.gridHeight = app.viewport.height;
        this.gridWidth = app.viewport.width;

        this.initializeGame();
        this.addRenderFunction(this.renderGameField.bind(this));

    }

    initializeGame() {

        let center = new Vec2(this.gridWidth / 2, this.gridHeight / 2).floor();

        this.gameState = GameStates.Playing;

        this.direction = new Vec2().copy(Directions.Right);
        this.speed = 4;
        this.speedTimer = 0;
        this.nextDirection = null;

        this.grid = new Array(this.gridWidth * this.gridHeight).fill(GridValues.Empty);
        this.setGrid(center.x, center.y, GridValues.Snake);
        for (let y = 0; y < this.gridHeight; y++) {
            this.setGrid(0, y, GridValues.Wall);
            this.setGrid(this.gridWidth - 1, y, GridValues.Wall);
        }
        for (let x = 0; x < this.gridWidth; x++) {
            this.setGrid(x, 0, GridValues.Wall);
            this.setGrid(x, this.gridHeight - 1, GridValues.Wall)
        }

        this.snake = [new Vec2().copy(center)];
        this.generateFruit();

    }

    generateFruit() {
        let freeCells = this.grid.map((v, i) => v === GridValues.Empty ? i : -1).filter(v => v !== -1);
        let idx = freeCells[Math.floor(Math.random() * freeCells.length)];
        this.grid[idx] = GridValues.Fruit;
    }

    setGrid(x, y, v) {
        this.grid[y * this.gridWidth + x] = v;
    }

    getGrid(x, y) {
        return this.grid[y * this.gridWidth + x];
    }

    onKeyPress(evt) {
        switch (evt.code) {
            case "KeyA": this.go(Directions.Left); break;
            case "KeyD": this.go(Directions.Right); break;
            case "KeyW": this.go(Directions.Up); break;
            case "KeyS": this.go(Directions.Down); break;
        }
    }

    onSwipe(evt) {
        switch (evt.type) {
            case "swipeleft": this.go(Directions.Left); break;
            case "swiperight": this.go(Directions.Right); break;
            case "swipeup": this.go(Directions.Up); break;
            case "swipedown": this.go(Directions.Down); break;
        }
    }

    go(dir) {
        let horizontal = this.direction.equals(Directions.Left) || this.direction.equals(Directions.Right);
        let nextHorizontal = dir.equals(Directions.Left) || dir.equals(Directions.Right);

        if (horizontal ^ nextHorizontal) {
            this.nextDirection = new Vec2().copy(dir);
        }
    }

    update(time) {
        if (this.gameState === GameStates.Playing) {
            this.speedTimer += time.delta * this.speed;

            while (this.speedTimer > 1) {

                this.speedTimer -= 1;

                if (this.nextDirection) {
                    this.direction.copy(this.nextDirection);
                    this.nextDirection = null;
                }

                let head = this.snake[0];
                let tail = this.snake[this.snake.length - 1];

                let newHead = head.clone().add(this.direction);

                switch (this.getGrid(newHead.x, newHead.y)) {
                    case GridValues.Fruit:
                        // Eat fruit
                        this.setGrid(newHead.x, newHead.y, GridValues.Snake);
                        this.snake.splice(0, 0, newHead);
                        this.generateFruit();
                        break;
                    case GridValues.Wall:
                        // GameOver
                        break;
                    case GridValues.Snake:
                        // GameOver
                        break;
                    case GridValues.Empty:

                        this.setGrid(newHead.x, newHead.y, GridValues.Snake);
                        this.setGrid(tail.x, tail.y, GridValues.Empty);

                        for (let i = this.snake.length - 1; i > 0; i--)
                            this.snake[i].copy(this.snake[i - 1]);
                        this.snake[0].copy(newHead);

                        break;
                }

            }

        }
    }

    renderGameField(time) {

        this.update(time);

        let ctx = this.app.ctx;

        let drawWall = (x, y) => {
            // Shadow
            ctx.fillStyle = Constants.Colors.Shadow1;
            ctx.fillRect(x + 0.1, y + 0.1, 1, 1);

            // Wall
            ctx.fillStyle = Constants.Colors.Secondary;
            ctx.fillRect(x, y, 1, 1);
        }


        ctx.font = "1px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        // Snake shadow
        ctx.fillStyle = Constants.Colors.Shadow1
        for (let v of this.snake) {
            ctx.fillRect(v.x + 0.1, v.y + 0.1, 1, 1);
        }

        // Background grid
        ctx.strokeStyle = Constants.Colors.Shadow2;
        ctx.lineWidth = 1 / this.app.viewport.scaleFactor;
        for (let x = 0; x < this.gridWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.gridHeight);
            ctx.stroke();
        }
        for (let y = 0; y < this.gridHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.gridWidth, y);
            ctx.stroke();
        }




        let fruitText = "A";

        // Draw walls and fruit
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                switch (this.getGrid(x, y)) {
                    case GridValues.Fruit:
                        ctx.fillStyle = Constants.Colors.Primary;
                        ctx.fillText(fruitText, x + 0.5, y + 0.5);
                        break;
                    case GridValues.Wall:
                        drawWall(x, y);
                        break;
                }
            }
        }


        // Draw snake 
        ctx.fillStyle = Constants.Colors.Primary;
        for (let v of this.snake) {
            ctx.fillRect(v.x, v.y, 1, 1);
        }

    }
}
