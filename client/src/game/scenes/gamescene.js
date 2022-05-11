import Phaser from 'phaser';
import io from 'socket.io-client';

export default class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        let loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 170, height / 2, 320, 50);
        loadingText.setPosition(width / 2 - loadingText.width / 2, height / 2 - 50);
        this.load.image('welcome', 'assets/tabletop-welcome.png');

        for (let i = 0; i < 100; i++) {
            this.load.image('welcome' + i, '../assets/tabletop-welcome.png');
        }

        this.load.on('progress', (value) => {
            console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 160, height / 2 + 10, 300 * value, 30);
        });

        this.load.on('fileprogress', (file) => {
            console.log(file.src);
        });

        this.load.on('complete', () => {
            console.log('complete');
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        let camera = this.cameras.main;
        let welcome = this.add.image(camera.width / 2, camera.height / 2, 'welcome');
        let scaleX = camera.width / welcome.width;
        let scaleY = camera.height / welcome.height;
        welcome = welcome.setScale(scaleX, scaleY);
        welcome.setOrigin(0.5, 0.5);
        console.log('welcome');
        // TODO: Enable users to upload their own background images.
        // TODO: Correct game display for screen size/density.
        this.socket = io('http://localhost:3000');

        let gridSize = Math.pow(2, 12);
        let cellSize = Math.pow(2, 6);
        let grid = this.add.grid(gridSize / 2, gridSize / 2, gridSize, gridSize, cellSize, cellSize, 0x000000, 0.0, 0xffffff);
        grid.setInteractive();

        this.socket.on('createToken', (name, width, height) => {
            let token = this.add.rectangle(300, 300, width, height, 0x483d8b);
            token.setName(name);
            console.log("Created " + token.name);
            token.setInteractive();
            this.input.setDraggable(token);
        });

        this.socket.on('dragged', (gameObject) => {
            this.children.getChildren().forEach(element => {
                if (gameObject.name === element.name) {
                    element.x = gameObject.x;
                    element.y = gameObject.y;
                }
            });
        });

        this.input.on('gameobjectmove', (pointer, gameObject) => {
            if (pointer.primaryDown && gameObject === grid && this.input.getDragState(pointer) == 0) {
                camera.scrollX -= (pointer.x - pointer.prevPosition.x) / camera.zoomX;
                camera.scrollY -= (pointer.y - pointer.prevPosition.y) / camera.zoomY;
            }
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            this.socket.emit('dragging', gameObject);
        });

        this.input.on('pointerup', (pointer, currentlyOver) => {
            let go = currentlyOver[0];
            if (go !== grid) {
                let x = grid.cellWidth * (Math.floor((go.x - grid.x) / grid.cellWidth) + 0.5) + grid.x;
                let y = grid.cellHeight * (Math.floor((go.y - grid.y) / grid.cellHeight) + 0.5) + grid.y;
                go.x = x;
                go.y = y;
            }
        });
    }

    update() {

    }
}