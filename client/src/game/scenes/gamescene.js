import Phaser from 'phaser';
import io from 'socket.io-client';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {

    }

    create() {
        // TODO: Create grid overlay for token movement.
        // TODO: Implement snap to grid movement.
        // TODO: Enable users to upload their own background images.
        this.socket = io('http://localhost:3000');

        this.socket.on('create', (name, width, height) => {
            let token = this.add.rectangle(300, 300, width, height, 0xff0000);
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

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            this.socket.emit('dragging', gameObject);
        });
    }

    update() {

    }
}