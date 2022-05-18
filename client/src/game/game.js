import Phaser from 'phaser';
import Tabletop from './scenes/Tabletop';

function launch(containerId) {
    return new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerId,
        scene: [
            Tabletop
        ],
        scale: {
            mode: Phaser.Scale.FIT,
            width: '100%',
            height: '100%'
        },
        backgroundColor: 0x000000
    });
}

export default launch;
export { launch }