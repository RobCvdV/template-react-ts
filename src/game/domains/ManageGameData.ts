import { getNamedLogs } from "@core";
import { StorageBase } from "@/core-react";
import { PuzzleBoard } from "@domains";

class GameDataStorage extends StorageBase {
  constructor() {
    super("PuzzleBoard");
  }
}

const cons = getNamedLogs({ name: "ManageGameData" });
// export class ManageGameData {
//   constructor(
//     readonly repo = singleton(GameDataRepo),
//     readonly storage = singleton(GameDataStorage),
//   ) {}
//
//   createGame(settings: GameSettingsKey): Promise<PuzzleBoard> {
//     const game = PuzzleBoard.fromSettings(settings);
//     cons.log("createGame", game);
//     // return Promise.resolve(game);
//     return this.repo.upsertIt(game).then((g) => {
//       cons.log("createGame", g.id, g instanceof PuzzleBoard);
//       return this.storage.set("current-game", g.toJSON()).then(() => g);
//       // return g;
//     });
//   }
//
//   loadCurrentGame(): Promise<PuzzleBoard | undefined> {
//     return this.storage
//       .get("current-game", PuzzleBoard.from(GameSettings.Normal))
//       .then((gd) => new PuzzleBoard(gd))
//       .then((gd) => {
//         cons.log("loadCurrentGame", gd.id);
//         return this.storage.set("current-game", gd.toJSON()).then(() => gd);
//       });
//     //   .then(gameId => {
//     //   if (gameId) {
//     //     return this.repo.byId(gameId);
//     //   }
//     //   return undefined;
//     // });
//   }
// }
