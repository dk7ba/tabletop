import Phaser from 'phaser';
import io from 'socket.io-client';

export default class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {

    }

    create() {
        let camera = this.cameras.main;
        // TODO: Implement snap to grid movement.
        // TODO: Enable users to upload their own background images.
        // TODO: Correct game display for screen size/density.
        this.socket = io('http://localhost:3000');

        let gridSize = Math.pow(2, 12);
        let gridPos = gridSize / 2;
        let cellSize = Math.pow(2, 6);
        let grid = this.add.grid(gridPos, gridPos, gridSize, gridSize, cellSize, cellSize, 0xfaebd7, 0.2, 0xffffff);
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

        /**
         * on pointerdown
         *   get difference of coordinates between gameobject and gamegrid
         *   divide coordinates by grid cell dimensions and floor the result
         *   multiply result by cell grid dimension to get new gameobject coordinates
         */
    }

    update() {

    }
}