import { getNamedLogs, singleton } from "@core";
import { StorageBase } from "@/core-react";
import { GameData, GameDataRepo, GameSettings } from "@domains";

class GameDataStorage extends StorageBase {
  constructor() {
    super("GameData");
  }
}

const cons = getNamedLogs({ name: "ManageGameData" });
export class ManageGameData {
  constructor(
    readonly repo = singleton(GameDataRepo),
    readonly storage = singleton(GameDataStorage),
  ) {}

  createGame(settings: GameSettings): Promise<GameData> {
    const game = GameData.from(settings);
    cons.log("createGame", game);
    // return Promise.resolve(game);
    return this.repo.upsertIt(game).then((g) => {
      cons.log("createGame", g.id, g instanceof GameData);
      return this.storage.set("current-game", g.toJSON()).then(() => g);
      // return g;
    });
  }

  loadCurrentGame(): Promise<GameData | undefined> {
    return this.storage
      .get("current-game", GameData.from(GameSettings.Normal))
      .then((gd) => new GameData(gd))
      .then((gd) => {
        cons.log("loadCurrentGame", gd.id);
        return this.storage.set("current-game", gd.toJSON()).then(() => gd);
      });
    //   .then(gameId => {
    //   if (gameId) {
    //     return this.repo.byId(gameId);
    //   }
    //   return undefined;
    // });
  }
}
