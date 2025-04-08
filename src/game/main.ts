import { Boot } from "./scenes/Boot";
import { GameOver, MainMenu, Preloader, ZwapGame } from "@game";
import { AUTO, Game } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 400,
  height: 800,
  parent: "game-container",
  backgroundColor: "#020808",
  scene: [Boot, Preloader, MainMenu, ZwapGame, GameOver],
};

const StartGame = (parent: string) => {
  // get current screen width and height
  const width = window.innerWidth;
  const height = window.innerHeight;
  return new Game({ ...config, parent, width, height });
};

export default StartGame;
