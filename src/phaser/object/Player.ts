import 'phaser';
import GameEvents from '../config/GameEvents';
import { IItem } from '../interface/IItem';
import UpgradeProgressManager from './UpgradeProgressManager';
import { getGame } from 'phaser/Game';
import HiringProgressManager from './HiringProgressManager';
import { IGameStore } from 'phaser/store/GameStore';
import Item from './Item';
import { ItemData } from 'data/ItemData';
import { UpgradeData } from 'data/UpgradeData';
import { HiringData } from 'data/HiringData';
import AlignTool from 'phaser/util/AlignTool';
import { TexturePreloadKeys } from 'phaser/config/TexturePreloadKeys';
import { PhysicsConfig } from 'phaser/config/PhysicsConfig';
import { DepthConfig } from 'phaser/config/DepthConfig';
import { AnimationKeys } from 'phaser/config/AnimationKeys';

export default class Player extends Phaser.Physics.Arcade.Sprite {
	public scene: Phaser.Scene;
	private game: Phaser.Game;
	private money: number;
	private _depth: number;
	private _inventory: IItem[];
	private upgradeProgressManager: UpgradeProgressManager;
	private hiringProgressManager: HiringProgressManager;
	public static clickDamage: number = 1;
	public static dps: number = 0;
	private gameStore: IGameStore;

	handleUpgrade(key: string) {
		const price = this.upgradeProgressManager.getCurrentUpgradePrice(key);
		if (price <= this.money) {
			let dmgChange;
			if (this.gameStore.upgradeProgresses[key].level <= 1) {
				dmgChange = UpgradeData[key].baseDMG;
			} else {
				dmgChange = this.upgradeProgressManager.calculateDamageIncrease(key);
			}

			Player.clickDamage += dmgChange;
			this.gameStore.upgradeProgresses[key].currdmg += dmgChange;

			// increase cost:
			this.gameStore.upgradeProgresses[key].currprice = this.upgradeProgressManager.calculatePriceIncrease(
				UpgradeData[key],
				this.gameStore.upgradeProgresses[key].currprice
			);

			this.spendGold(price);
			this.game.events.emit(GameEvents.OnUpgradeDone, key, Player.clickDamage);
		} else {
			console.log('not enough money');
			this.game.events.emit(GameEvents.OnUpgradeDone);
		}
	}

	handleHiring(key: string) {
		const price = this.hiringProgressManager.getCurrentHiringPrice(key);
		if (price <= this.money) {
			let dmgChange;
			if (this.gameStore.hiringProgresses[key].level <= 1) {
				dmgChange = HiringData[key].baseDMG;
			} else {
				dmgChange = this.hiringProgressManager.calculateDamageIncrease(key);
			}
			Player.dps += dmgChange;
			this.gameStore.hiringProgresses[key].currdps += dmgChange;

			// increase cost:
			this.gameStore.hiringProgresses[key].currprice = this.upgradeProgressManager.calculatePriceIncrease(
				HiringData[key],
				this.gameStore.hiringProgresses[key].currprice
			);

			this.spendGold(price);
			this.game.events.emit(GameEvents.OnHiringDone, key, Player.dps);
		} else {
			console.log('not enough money');
			this.game.events.emit(GameEvents.OnHiringDone);
		}
	}

	setupPhysics() {
		this.scene.add.existing(this); // add to screen
		this.scene.physics.add.existing(this); // enable physics
		this.setGravityY(PhysicsConfig.WorldGravity);
		this.setBounce(0.2, 0.2);
		this.setCollideWorldBounds(true);
		this.body.setSize(); // readjust physics body to texture size
	}

	setupAnimations() {
		this.scene.anims.create({
			key: AnimationKeys.PLAYER_DIG,
			frames: this.scene.anims.generateFrameNumbers(TexturePreloadKeys.PLAYER, { start: 0, end: 6 }),
			frameRate: 20,
			repeat: 0
		});
	}

	constructor(scene: Phaser.Scene) {
		super(scene, AlignTool.getCenterHorizontal(scene), 100, TexturePreloadKeys.PLAYER);

		this.scene = scene;
		this.game = getGame();
		this.money = 10000;
		this._depth = 0;
		this._inventory = [];
		this.upgradeProgressManager = new UpgradeProgressManager(this.scene);
		this.hiringProgressManager = new HiringProgressManager(this.scene);
		this.gameStore = this.game.registry.get('gameStore');

		// setup sprite
		AlignTool.scaleToScreenWidth(scene, this, 0.3);
		this.setDepth(DepthConfig.Player);
		this.setupPhysics();

		// setup animations:
		this.setupAnimations();

		// listen to game events (with params):
		this.game.events.on(GameEvents.OnUpgradeIssued, (key: string) => this.handleUpgrade(key), this);
		this.game.events.on(GameEvents.OnHiringIssued, (key: string) => this.handleHiring(key), this);
	}

	public get depth(): number {
		return this._depth;
	}

	public get inventory(): string {
		return this.inventory;
	}

	// spawnSprite() {
	// 	this.scene.add.sprite();
	// }

	addGold(amount: number) {
		this.money += amount;
		this.game.events.emit(GameEvents.OnMoneyChanged, this.money);
	}

	spendGold(amount: number) {
		this.money -= amount;
		this.game.events.emit(GameEvents.OnMoneyChanged, this.money);
	}

	addDepth(amount: number) {
		this._depth += amount;
		this.game.events.emit(GameEvents.OnDepthChanged, this._depth);
	}

	addItem(itemType: string) {
		if (this._inventory.length === 15) {
			this.game.events.emit(GameEvents.OnItemAcquired, true);
			return;
		}
		let item!: Item;

		switch (itemType) {
			case ItemData.Apple.name:
				item = new Item(ItemData.Apple);
				break;

			case ItemData.Book.name:
				item = new Item(ItemData.Book);
				break;

			case ItemData.GoldIngot.name:
				item = new Item(ItemData.GoldIngot);
				break;

			case ItemData.Potion.name:
				item = new Item(ItemData.Potion);
				break;
		}

		this._inventory.push(item);
		this.game.events.emit(GameEvents.OnItemAcquired, false, item);
	}

	playDigAnimation() {
		this.anims.play(AnimationKeys.PLAYER_DIG);
	}
}
