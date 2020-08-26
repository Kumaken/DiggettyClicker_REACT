import { IRootStore } from '../../RootStore';
import { action, observable } from '../../../node_modules/mobx/lib/mobx';
import { IUpgradeProgresses, IUpgradeProgress } from 'phaser/interface/IUpgradeProgress';
import { UpgradeData } from 'data/UpgradeData';
import { IItem } from 'phaser/interface/IItem';

export interface IGameStore {
	topPlatformName: string;
	topPlatformToughness: number;
	topPlatformMaxToughness: number;
	playerDPC: number;
	playerDPS: number;
	money: number;
	inventory: IItem[];
	depth: number;
	upgradeProgresses: IUpgradeProgresses;
	insufficientMoneyNotif: boolean;
	setTopPlatformName(name: string): void;
	setTopPlatformToughness(value: number): void;
	setTopPlatformMaxToughness(value: number): void;
	setPlayerDPC(value: number): void;
	setPlayerDPS(value: number): void;
	setMoney(value: number): void;
	setDepth(value: number): void;
	setUpgradeProgresses(update: IUpgradeProgresses): void;
	upgradeByKey(key: string);
	setInsufficientMoneyNotif(value: boolean);
}

export class GameStore implements IGameStore {
	rootStore: IRootStore;

	initializeUpgradeProgresses() {
		for (let key in UpgradeData) {
			const newProgress: IUpgradeProgress = {
				level: 1,
				currdmg: UpgradeData[key].baseDMG
			};
			this.upgradeProgresses[key] = newProgress;
		}
	}

	constructor(rootStore: IRootStore) {
		this.rootStore = rootStore;
		this.initializeUpgradeProgresses();
	}

	@observable topPlatformName: string = 'Loading';
	@observable topPlatformToughness: number = 0;
	@observable topPlatformMaxToughness: number = 1;
	@observable playerDPC: number = 1;
	@observable playerDPS: number = 0;
	@observable money: number = 0;
	@observable inventory: IItem[] = [];
	@observable depth: number = 0;
	@observable upgradeProgresses: IUpgradeProgresses = {};
	@observable insufficientMoneyNotif: boolean = false;

	@action setTopPlatformName(name: string) {
		this.topPlatformName = name;
	}

	@action setTopPlatformToughness(value: number) {
		this.topPlatformToughness = value;
	}

	@action setTopPlatformMaxToughness(value: number) {
		this.topPlatformMaxToughness = value;
	}

	@action setPlayerDPC(value: number) {
		this.playerDPC = value;
	}

	@action setPlayerDPS(value: number) {
		this.playerDPS = value;
	}

	@action setMoney(value: number) {
		this.money = value;
	}

	@action addItem(item: IItem){
		this.inventory.push(item);
	}

	@action useItem(id: number){
		this.inventory.splice(id);
	}

	@action setDepth(value: number) {
		this.depth = value;
	}

	@action setUpgradeProgresses(update: IUpgradeProgresses) {
		this.upgradeProgresses = update;
	}

	@action upgradeByKey(key: string) {
		this.upgradeProgresses[key].level += 1;
	}

	@action setInsufficientMoneyNotif(value: boolean) {
		this.insufficientMoneyNotif = value;
	}
}
