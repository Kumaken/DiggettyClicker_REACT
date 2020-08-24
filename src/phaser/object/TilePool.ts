import 'phaser';
import Tile from './Tile';
import { ITilePool } from '../interface/ITilePool';
import AlignTool from '../util/AlignTool';
import { DepthConfig } from '../config/DepthConfig';

export default class TilePool extends Phaser.Physics.Arcade.Group implements ITilePool {
	constructor(
		world: Phaser.Physics.Arcade.World,
		scene: Phaser.Scene,
		texture: string,
		config: Phaser.Types.Physics.Arcade.PhysicsGroupConfig | Phaser.Types.GameObjects.Group.GroupCreateConfig = {}
	) {
		const defaults:
			| Phaser.Types.Physics.Arcade.PhysicsGroupConfig
			| Phaser.Types.GameObjects.Group.GroupCreateConfig = {
			classType: Tile,
			maxSize: -1,
			key: texture,
			frame: 0,
			active: false,
			visible: false,
			frameQuantity: 10
		};

		super(world, scene, Object.assign(defaults, config));
	}

	spawn(x: number, y: number, key: string, frame: number): Tile {
		const spawnExisting = this.countActive(false) > 0;
		const tile: Tile = this.get(x, y, key, frame);
		if (!tile) {
			return tile;
		}

		tile.setTexture(key);
		tile.setFrame(frame);
		tile.setDepth(DepthConfig.Tile);
		tile.currentTexture = key;
		tile.currentFrame = frame;

		if (spawnExisting) {
			tile.setVisible(true);
			tile.setActive(true);
			this.world.add(tile.body);
		}

		AlignTool.scaleToScreenWidth(this.scene, tile, 0.11);
		tile.setInteractive();
		return tile;
	}

	despawn(tile: Tile): void {
		this.killAndHide(tile);
		this.world.remove(tile.body);
		tile.alpha = 1;
		tile.body.reset(0, 0);
		tile.disableInteractive();
	}
}

// Register to gameobject factory (Module Augmentation)
Phaser.GameObjects.GameObjectFactory.register('tilePool', function (
	texture: string,
	config: Phaser.Types.Physics.Arcade.PhysicsGroupConfig | Phaser.Types.GameObjects.Group.GroupCreateConfig = {}
) {
	const pool = new TilePool(this.scene.physics.world, this.scene, texture, config);

	this.updateList.add(pool);

	return pool;
});