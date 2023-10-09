// get engine from supagraph to access db
import { getEngine } from "supagraph";

// feed all of the delegate data into the db's kv store
export const WarmupContracts = async () => {
  // get the engine to manipulate the db store
  const engine = await getEngine();

  // pull the full list of delegates - this will trigger a snapshot on the immutable table
  const allContracts = (await engine.db.get("contract")) || [];

  // we're going to pull all entities at the current head into the cache, set ref location
  engine.db.kv["contract"] = engine.db.kv["contract"] || {};

  // place each entity into the cache against its .id
  for (const contract of allContracts as { id: string }[]) {
    engine.db.kv["contract"][contract.id] = contract;
  }

  // mark as warm (this will prevent going to db for missing values (assumes everything is already in cache))
  engine.warmDb = true;
};
