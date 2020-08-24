import 'phaser';
import AlignTool from '../util/AlignTool';
import { IPlatformData } from '../Interfaces/IPlatformData';
import { ITextureKey } from '../Interfaces/ITextureKey';
import { ITilePool } from '../Interfaces/ITilePool';
import Platform from './Platform';
import GameEvents from '../config/GameEvents';
import { PlatformData } from '../../data/PlatformData';
import Player from './Player';
import { TextureKeys } from '../config/TextureKeys';
import './TilePool';
import { ITopMostPlatformInfo } from 'phaser/Interfaces/ITopMostPlatformInfo';
import { getGame } from 'phaser/Game';
import Algorithm from 'phaser/util/Algorithm';

export default class PlatformManager {
	private game: Phaser.Game;
	private scene: Phaser.Scene;
	private pool: ITilePool;
	private player: Player;
	private bottomMostY: number = 0;
	private platformYInterval: number = 0;
	private platforms: Platform[] = [];
	private rowNums: number = 4;
	private textureKeyArr: string[] = Object.keys(PlatformData);
	// NOTE DELETE THIS IF NOT USING TERRARIA TILES: to handle the gap from the tilesheet
	private tileWidthGap: number = 10;
	private tileHeightGap: number = 10;

	// Gameplay Related properties
	private depthPerPlatform: number = 10;
	private goldPerPlatform: number = 1;

	// Static properties
	public static topMostY: number;
	public static topMostPlatform: Platform;
	public static tileSize: Phaser.Structs.Size;

	constructor(scene: Phaser.Scene, player: Player) {
		this.scene = scene;
		this.game = getGame();
		this.pool = this.scene.add.tilePool(TextureKeys.TL_DIRT.key);
		this.player = player;
		PlatformManager.topMostY = AlignTool.getYfromScreenHeight(scene, 0.45);

		// deduce tile size dynamically:
		const sample = this.pool.spawn(0, 0, '', 0);
		PlatformManager.tileSize = new Phaser.Structs.Size(
			sample.displayWidth - this.tileWidthGap,
			sample.displayHeight - this.tileHeightGap
		);
		this.pool.despawn(sample);

		// listen to game events:
		this.game.events.on(GameEvents.TopmostPlatformDestroyed, this.destroyTopmostPlatform, this);

		this.scene.input.on('gameobjectdown', () => {
			// damage topmost platform:
			const topMostPlatform = this.platforms[0];
			topMostPlatform.onClickPlatform();
		});
	}

	spawnPlatformInitial(textureKey: ITextureKey) {
		let curY = PlatformManager.topMostY;
		PlatformManager.topMostPlatform = new Platform(
			this.scene,
			this.pool,
			curY,
			PlatformManager.tileSize,
			PlatformData.Dirt
		);
		this.platforms.push(PlatformManager.topMostPlatform);
		curY += PlatformManager.tileSize.height;

		for (let i = 1; i < this.rowNums; i++) {
			const newPlatform = new Platform(this.scene, this.pool, curY, PlatformManager.tileSize, PlatformData.Dirt);
			this.platforms.push(newPlatform);
			curY += PlatformManager.tileSize.height;
		}
		this.bottomMostY = curY - PlatformManager.tileSize.height;

		const topMostPlatformInfo: ITopMostPlatformInfo = {
			name: PlatformManager.topMostPlatform.platformData.name,
			toughness: PlatformManager.topMostPlatform.toughness,
			maxToughness: PlatformManager.topMostPlatform.platformData.toughness
		};
		this.game.events.emit(GameEvents.TopmostPlatformChanged, topMostPlatformInfo);
	}

	despawnTopmostPlatform() {
		const topMost = this.platforms.shift()!.row;
		topMost.forEach((tile) => {
			this.pool.despawn(tile);
		});
		PlatformManager.topMostPlatform = this.platforms[0];
		const topMostPlatformInfo: ITopMostPlatformInfo = {
			name: PlatformManager.topMostPlatform.platformData.name,
			toughness: PlatformManager.topMostPlatform.toughness,
			maxToughness: PlatformManager.topMostPlatform.platformData.toughness
		};
		this.game.events.emit(GameEvents.TopmostPlatformChanged, topMostPlatformInfo);
	}

	shiftAllPlatformsUpward() {
		this.platforms.forEach((platform) => {
			platform.shiftAllTilesUpward();
		});
	}

	spawnBottommostPlatform(platformData: IPlatformData) {
		const newPlatform = new Platform(
			this.scene,
			this.pool,
			this.bottomMostY,
			PlatformManager.tileSize,
			platformData
		);
		this.platforms.push(newPlatform);
	}

	destroyTopmostPlatform() {
		this.player.addDepth(this.depthPerPlatform);
		this.player.addGold(this.goldPerPlatform);
		this.despawnTopmostPlatform();
		this.shiftAllPlatformsUpward();
		const randIdx = Algorithm.randomIntFromInterval(0, this.textureKeyArr.length - 1);
		this.spawnBottommostPlatform(PlatformData[this.textureKeyArr[randIdx]]);
	}
}
