import 'phaser';
import { UpgradeData } from '../../data/UpgradeData';
import { IGameStore } from 'phaser/store/GameStore';
import { getGame } from 'phaser/Game';
import { IUpgradeDatum } from 'phaser/interface/IUpgradeData';
import { IHiringDatum } from 'phaser/interface/IHiringData';

export default class UpgradeProgressManager {
	private scene: Phaser.Scene;
	private game: Phaser.Game;
	private gameStore: IGameStore;

	calculateDamageIncrease(key: string): number {
		const upgradeType = UpgradeData[key].dmgGrowthType;
		if (upgradeType === 'linear') {
			return UpgradeData[key].dmgUpRatio;
		} else {
			// exponential
			return Math.floor(this.gameStore.upgradeProgresses[key].currdmg * UpgradeData[key].dmgUpRatio);
		}
	}

	calculatePriceIncrease(data: IUpgradeDatum | IHiringDatum, basePrice: number): number {
		return Math.floor(basePrice * data.costUpRatio);
	}

	getCurrentUpgradePrice(key: string) {
		return this.gameStore.upgradeProgresses[key].currprice;
	}

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.game = getGame();
		this.gameStore = this.game.registry.get('gameStore');
	}
}
