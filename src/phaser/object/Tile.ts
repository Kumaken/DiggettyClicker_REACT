import 'phaser';
import { ITile } from '../interface/ITile';
import { TextureKeys } from '../config/TextureKeys';
import AlignTool from 'phaser/util/AlignTool';
import { DepthConfig } from 'phaser/config/DepthConfig';

export default class Tile extends Phaser.Physics.Arcade.Sprite implements ITile {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	currentTexture: string;
	currentFrame: number;
	itemType: string;
	scene: Phaser.Scene;

	setupPhysics() {
		this.body.immovable = true;
		this.body.setSize(); // readjust physics body to texture size
	}

	setupSprite(key: string, frame: number, tileType: string) {
		this.setTexture(key);
		this.setFrame(frame);
		this.setDepth(DepthConfig.Tile);
		this.currentTexture = key;
		this.currentFrame = frame;
		this.itemType = tileType;

		AlignTool.scaleToScreenWidth(this.scene, this, 0.11);
		this.setInteractive();
	}

	enableSprite() {
		this.setVisible(true);
		this.setActive(true);
		this.alpha = 1;
	}

	disableSprite() {
		this.alpha = 0;
		this.body.reset(0, 0);
		this.disableInteractive();
	}

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number) {
		super(scene, x, y, texture, frame);
		this.currentTexture = texture;
		this.currentFrame = frame;
		this.scene = scene;
	}

	animateBreak(): ITile {
		switch (this.currentTexture) {
			case TextureKeys.TL_DIRT.key:
				this.currentFrame += TextureKeys.TL_DIRT.frameStep;
				this.setTexture(this.currentTexture, this.currentFrame);
				break;

			case TextureKeys.TL_ROCKY_DIRT.key:
				this.currentFrame += TextureKeys.TL_ROCKY_DIRT.frameStep;
				this.setTexture(this.currentTexture, this.currentFrame);
				break;

			case TextureKeys.TL_SHAKY_DIRT.key:
				this.currentFrame += TextureKeys.TL_SHAKY_DIRT.frameStep;
				this.setTexture(this.currentTexture, this.currentFrame);
				break;
		}

		return this;
	}
}
