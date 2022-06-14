import Phaser from 'phaser';
import io from 'socket.io-client';

/**
 * Tabletop scene
 */
export default class Tabletop extends Phaser.Scene {

    constructor() {
        super({ key: 'Tabletop' });
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
        this.load.image('mario', 'assets/mario.png');
        this.load.image('tiles', 'assets/tiles.png');

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
        welcome.setScrollFactor(0, 0);
        console.log('welcome');

        this.socket = io('http://localhost:3000');

        const DEFAULT_WIDTH = 100;
        const DEFAULT_HEIGHT = 100;
        const DEFAULT_TILE_WIDTH = 32;
        const DEFAULT_TILE_HEIGHT = 32;

        const level = new Array(DEFAULT_HEIGHT);
        for (let i = 0; i < level.length; i++) {
            level[i] = new Array(DEFAULT_WIDTH);
        }

        // When loading from an array, make sure to specify the tileWidth and tileHeight
        const map = this.make.tilemap({ data: level, tileWidth: DEFAULT_TILE_WIDTH, tileHeight: DEFAULT_TILE_HEIGHT });
        const tiles = map.addTilesetImage('mario');
        const layer = map.createLayer(0, tiles, 0, 0);
        layer.setScrollFactor(1, 1);
        layer.setInteractive();


        layer.putTileAt(0, 0, 0);

        // Place and remove tiles with the pointer.
        this.input.on('pointerdown', (pointer) => {
            if (layer.getTileAtWorldXY(pointer.worldX, pointer.worldY)) {
                layer.removeTileAtWorldXY(pointer.worldX, pointer.worldY);
            }
            else {
                layer.putTileAtWorldXY(0, pointer.worldX, pointer.worldY);
            }
        });
        
        let gridSize = map.widthInPixels;
        let cellSize = map.tileWidth;
        
        let grid = this.add.grid(gridSize / 2, gridSize / 2, gridSize, gridSize, cellSize, cellSize, 0xffffff, 0.1, 0x000000);
        grid.setOutlineStyle(0xffffff, 0.2);
        grid.setInteractive();
        
        // Set camera bounds to grid size + a single grid cell border.
        camera.setBounds(-cellSize, -cellSize, grid.width + cellSize, grid.height + cellSize);
        
        // Signal from server to create and draw token.
        this.socket.on('createToken', (name) => {
            let token = this.add.rectangle(300, 300, cellSize, cellSize, 0x483d8b);
            token.setName(name);
            console.log("Created " + token.name);
            token.setInteractive();
            this.input.setDraggable(token);
        });

        // Signal from server to update game object position.
        this.socket.on('dragged', (gameObject) => {
            this.children.getChildren().forEach(element => {
                if (gameObject.name === element.name) {
                    element.x = gameObject.x;
                    element.y = gameObject.y;
                }
            });
        });

        // Move the camera on pointer down.
        this.input.on('gameobjectmove', (pointer) => {
            if (pointer.primaryDown && this.input.getDragState(pointer) == 0) {
                camera.scrollX -= (pointer.x - pointer.prevPosition.x) / camera.zoomX;
                camera.scrollY -= (pointer.y - pointer.prevPosition.y) / camera.zoomY;
            }
        });

        // Drag game object and send new data to server.
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            this.socket.emit('dragging', gameObject);
        });

        // After moving game object, correct its position to fit to grid/tilemap.
        this.input.on('pointerup', (pointer, currentlyOver) => {
            let go = currentlyOver[0];
            if (go !== grid) {
                // Calculate game object coordinates for snap to grid pointer dragging
                go.x = grid.cellWidth * (Math.floor((go.x - grid.x) / grid.cellWidth) + 0.5) + grid.x;
                go.y = grid.cellHeight * (Math.floor((go.y - grid.y) / grid.cellHeight) + 0.5) + grid.y;
            }
        });
        
    }

    update() {
    }
}