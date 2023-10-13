// We're exporting migrations as defined by supagraph here
import { Migration } from "supagraph";
// Init migrations are called on latest block after catch-up sync
import { InitTransactionHandler } from "./init";

// Construct Migrations in an array (we can have many migrations with the same block/chainId combination...)
export const migrations: () => Promise<Migration[]> = async () => [
  // append onTransaction to start listening for L2 transactions
  await InitTransactionHandler(),
];

// export on default
export default migrations;
