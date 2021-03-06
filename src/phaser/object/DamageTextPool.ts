import 'phaser';
import { IDamageTextPool } from '../interface/IDamageTextPool';
import AlignTool from '../util/AlignTool';
import Algorithm from '../util/Algorithm';
import GameEvents from '../config/GameEvents';
import PreloadScene from '../scene/PreloadScene';
import FontKeys from '../../config/FontKeys';
import { getGame } from 'phaser/Game';
import PlatformManager from './PlatformManager';
import { DepthConfig } from 'phaser/config/DepthConfig';

export default class DamageTextPool extends Phaser.GameObjects.Group implements IDamageTextPool {
	constructor(scene: Phaser.Scene, config: Phaser.Types.GameObjects.Group.GroupCreateConfig = {}) {
		const defaults: Phaser.Types.GameObjects.Group.GroupCreateConfig = {
			classType: Phaser.GameObjects.Text,
			active: false,
			visible: false,
			frameQuantity: 0
		};
		super(scene, Object.assign(defaults, config));
	}

	spawn(x: number, y: number, damage: number): Phaser.GameObjects.Text {
		const spawnExisting = this.countActive(false) > 0;
		const DamageText: Phaser.GameObjects.Text = this.get(x, y - 50);
		if (!DamageText) {
			return DamageText;
		}

		if (spawnExisting) {
			DamageText.setVisible(true);
			DamageText.setActive(true);
		}

		DamageText.text = damage.toLocaleString();
		DamageText.setFontSize(80 * PreloadScene.screenScale.scaleWidth);
		DamageText.setFontFamily(FontKeys.SHPinscherRegular);
		AlignTool.scaleToScreenWidth(this.scene, DamageText, 0.05);
		DamageText.setDepth(DepthConfig.Texts);

		// Animation:
		this.scene.tweens.add({
			targets: DamageText,
			x: x + Algorithm.randomIntFromInterval(-100, 100),
			y: y + Algorithm.randomIntFromInterval(-100, 0),
			duration: 1500,
			alpha: 0,
			ease: 'Power2',
			onComplete: () => {
				this.despawn(DamageText);
			}
		});
		this.setDepth(DepthConfig.Texts);
		return DamageText;
	}

	despawn(DamageText: Phaser.GameObjects.Text): void {
		this.killAndHide(DamageText);
		DamageText.alpha = 1;
		// DamageText.anims.stop();
	}
}

// Register to gameobject factory (Module Augmentation)
Phaser.GameObjects.GameObjectFactory.register('damageTextPool', function (
	config: Phaser.Types.GameObjects.Group.GroupCreateConfig = {}
) {
	const pool = new DamageTextPool(this.scene, config);

	this.updateList.add(pool);

	// listen to damage events:
	const game = getGame();
	game.events.on(
		GameEvents.OnDamage,
		(damage: number) => {
			pool.spawn(AlignTool.getCenterHorizontal(this.scene), PlatformManager.topMostY, damage);
		},
		this
	);
	return pool;
});
