class MainMenuScene extends Scene {

    constructor(app) {
        super(app);

        this.titleSpriteData = [
            "XXXXX.X...X.XXXXX.X...X.XXXXX",
            "X.....XX..X.X...X.X..X..X....",
            "XXXXX.X.X.X.XXXXX.XXX...XXX..",
            "....X.X..XX.X...X.X..X..X....",
            "XXXXX.X...X.X...X.X...X.XXXXX"
        ];


        this.addRenderFunction(this.renderTitle.bind(this));

    }

    renderTitle(time, data) {

        
        const RENDER_TIME = 2;
        if (data.invocationID === 0) {
            data.spriteWidth = this.titleSpriteData[0].length;
            data.spriteHeight = this.titleSpriteData.length;
            data.cells = [];
            for (let x = 0; x < data.spriteWidth; x++) {
                for (let y = 0; y < data.spriteHeight; y++) {
                    if (this.titleSpriteData[y].charAt(x) === "X") {
                        data.cells.push(new Vec2(x, y));
                    }
                }
            }


            data.cells = data.cells.shuffle();

        }

        let progress = Math.min(RENDER_TIME, data.elapsedTime) / RENDER_TIME;
        let cell = progress * data.cells.length;
        let idx = Math.min(Math.floor(cell), data.cells.length - 1);
        let idxDelta = cell - idx;
        let ctx = this.app.ctx;
        let viewport = this.app.viewport;

        ctx.save();
        {
            ctx.translate((viewport.width - data.spriteWidth) / 2, viewport.height / 4);

            // Draw shadows
            ctx.fillStyle = Constants.Colors.Shadow;
            for (let i = 0; i < idx; i++)
                ctx.fillRect(data.cells[i].x + viewport.shadowSize, data.cells[i].y + viewport.shadowSize, 1, 1);

            ctx.save();
            {
                ctx.globalAlpha = idxDelta;
                ctx.fillRect(data.cells[idx].x + viewport.shadowSize, data.cells[idx].y + viewport.shadowSize + (1 - idxDelta), 1, 1);
            }
            ctx.restore();

            // Draw letters
            ctx.fillStyle = Constants.Colors.Primary;

            for (let i = 0; i < idx; i++)
                ctx.fillRect(data.cells[i].x, data.cells[i].y, 1, 1);

            ctx.save();
            {
                ctx.globalAlpha = idxDelta;
                ctx.fillRect(data.cells[idx].x, data.cells[idx].y + (1 - idxDelta), 1, 1);
            }
            ctx.restore()

        }
        ctx.restore();

    }

    onTap(evt) {
        this.app.gotoScene(new GameScene(this.app));
    }
}