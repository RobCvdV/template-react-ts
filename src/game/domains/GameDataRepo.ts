import { GameData, GameDataType } from "@domains";
import { getNamedLogs, JsonEntity } from "@core";
import { Repo } from "@/core/domain/Repo";

const cons = getNamedLogs({ name: "GameDataRepo" });
export class GameDataRepo extends Repo<GameData, GameDataType> {
  constructor() {
    super("GameData");
  }

  upsertIt(gd: GameData): Promise<GameData> {
    cons.log("upsert", gd.id);
    return this.gw.upsert(gd.toJSON() as JsonEntity).then(() => gd);
  }
}
