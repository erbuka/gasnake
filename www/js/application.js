const Constants = {
    VirtualHeight: 20,
    Colors: {
        Primary: "#393782",
        Secondary: "#90A59E",
        Shadow0: "rgba(0,0,0,.75)",
        Shadow1: "rgba(0,0,0,.5)",
        Shadow2: "rgba(0,0,0,.25)",
    }
}

class Application {
    start() {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");

        document.body.appendChild(canvas);


        // Bind events
        {
            let hammer = new Hammer(canvas, {});

            hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

            hammer.on("swipeleft", this.onSwipe.bind(this));
            hammer.on("swiperight", this.onSwipe.bind(this));
            hammer.on("swipeup", this.onSwipe.bind(this));
            hammer.on("swipedown", this.onSwipe.bind(this));
            hammer.on("tap", this.onTap.bind(this));

            window.addEventListener("keypress", this.onKeyPress.bind(this));
            window.addEventListener("resize", this.onResize.bind(this));
        }

        // Init timing
        this.startTime = this.prevTime = Date.now();

        this.canvas = canvas;
        this.ctx = ctx;

        // Init first scene
        this.gotoScene(new MainMenuScene(this));

        this.onResize(null);

        this.loop();
    }

    onResize(evt) {


        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        let scaleFactor = Math.floor(window.innerHeight / Constants.VirtualHeight);
        let height = Constants.VirtualHeight;
        let width = Math.floor(window.innerWidth / scaleFactor);
        let offsetX = (window.innerWidth - scaleFactor * width) / 2;
        let offsetY = (window.innerHeight - scaleFactor * height) / 2;

        document.body.style.fontSize = scaleFactor + "px";


        this.viewport = {
            height: height,
            width: width,
            scaleFactor: scaleFactor,
            offsetX: offsetX,
            offsetY: offsetY
        }

        if (this.currentScene)
            this.currentScene.onResize(evt);
    }

    onKeyPress(evt) {
        if (this.currentScene)
            this.currentScene.onKeyPress(evt);
    }

    onSwipe(evt) {
        if (this.currentScene)
            this.currentScene.onSwipe(evt);
    }

    onTap(evt) {
        if (this.currentScene)
            this.currentScene.onTap(evt);
    }

    gotoScene(scene) {
        this.nextScene = scene;
    }

    loop() {
        window.requestAnimationFrame(this.loop.bind(this));

        let ctx = this.ctx;

        if (this.nextScene) {
            this.currentScene = this.nextScene;
            this.nextScene = null;
        }

        let now = Date.now();

        let time = {
            elapsed: (now - this.startTime) / 1000,
            delta: (now - this.prevTime) / 1000
        };

        this.prevTime = now;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        {
            ctx.translate(this.viewport.offsetX, this.viewport.offsetY);
            ctx.scale(this.viewport.scaleFactor, this.viewport.scaleFactor);
            this.currentScene.onRender(time);
        }
        ctx.restore();
    }
}