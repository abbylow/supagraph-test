// import tooling
import { Migration, addSync, getEngine, withDefault } from "supagraph";

// mark as started after first run
let hasRunTxInit = false;

// Initiate the onTransaction handler
export const InitTransactionHandler = async (): Promise<Migration> => {
  // return handler to initialse the L2 onTransaction handler after initial sync
  return {
    chainId: withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001),
    blockNumber: "latest",
    handler: async () => {
      // get the engine
      const engine = await getEngine();
      // finish supagraphs log
      if (!hasRunTxInit) process.stdout.write("...");
      // log that migration is starting
      console.log(
        `\n--\n\nStartup one-time migration event to addSync a new listener to collect blocks after initial sync completes...${
          engine.newDb ? "\n\n--\n\n" : ""
        }`
      );
      // mark as ran
      hasRunTxInit = true;
      // add the sync after catchup
      await addSync({
        chainId: withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001),
        handlers: `${withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001)}`,
        // process each transaction globally - we need to observe every value transfer for our delegates
        eventName: "onTransaction",
        // establish the point we want to start and stop syncing from
        startBlock: "latest",
        endBlock: withDefault(process.env.L2_MANTLE_END_BLOCK, "latest"),
        opts: {
          // set the mode as ephemeral to delete the sync between startups
          mode: "ephemeral",
          // collect receipts to gather gas usage
          collectTxReceipts: true,
        },
      });
    },
  };
};
