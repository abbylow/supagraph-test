// Assign default value to provided env
import { SyncConfig, withDefault } from "supagraph";

// Export the complete supagraph configuration (sync & graph) - we can add everything from Mappings to this config
export const config: SyncConfig = {
  // name your supagraph (this will inform mongo table name etc...)
  name: withDefault(
    process.env.SUPAGRAPH_NAME,
    "supagraph--iziswap--mainnet--0-0-1"
  ),
  // set the local engine (true: db || false: mongo)
  dev: false,
  // set the reset condition (should the local db be restarted on sync?)
  reset: false,
  // should we cleanup files after the initial sync?
  cleanup: true,
  // listen for updates as a daemon operation
  listen: true,
  // hide console log
  silent: false,
  // set readOnly mode
  readOnly: false,
  // collect blocks to sort by ts
  collectBlocks: true,
  // flag mutable to insert by upsert only on id field (mutate entities)
  // - otherwise use _block_number + id to make a unique entry and do a distinct groupBy on the id when querying
  //   ie: do everything the immutable way (this can be a lot more expensive)
  mutable: true,
  // how often do we want queries to be revalidated?
  revalidate: 12,
  staleWhileRevalidate: 59,
  // configure providers
  providers: {
    1: {
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    },
    5: {
      rpcUrl: `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    },
    [withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001)]: {
      rpcUrl: withDefault(
        process.env.MANTLE_RPC_URI,
        "https://rpc.testnet.mantle.xyz"
      ),
    },
  },
  events: {
    iziswapFactory: [
      "event NewPool(address indexed tokenX, address indexed tokenY, uint24 indexed fee, uint24 pointDelta, address pool)",
    ],
  },
  // configure available Contracts and their block details
  contracts: {
    [withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001)]: {
      // set the handlers
      handlers: `${withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001)}`,
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      eventName: "onTransaction",
      // set config from env
      chainId: withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001),
      // establish the point we want to start and stop syncing from
      startBlock: "latest",
      endBlock: withDefault(process.env.L2_MANTLE_END_BLOCK, "latest"),
      collectTxReceipts: true,
      mode: "ephemeral",
    },
    iziswapFactory: {
      // set the handlers
      handlers: "iziswapFactory",
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: "iziswapFactory",
      // set config from env
      chainId: withDefault(process.env.L2_MANTLE_CHAIN_ID, 5000),
      address: withDefault(
        process.env.IZISWAP_FACTORY_ADDRESS,
        "0x45e5F26451CDB01B0fA1f8582E0aAD9A6F27C218"
      ),
      startBlock: withDefault(process.env.IZISWAP_FACTORY_START_BLOCK, 6803),
      endBlock: withDefault(process.env.IZISWAP_FACTORY_END_BLOCK, "latest"),
      collectTxReceipts: true,
    },
  },
  // define supagraph schema
  schema: `
    type Contract @entity {
      id: String!
      txnCount: Int!
      blockNumber: BigInt!
      transactionHash: String! 
    }
  `,
  // define supagraph default query
  defaultQuery: `
    query TopTenContracts {
      contracts(
        first: 10
        orderBy: txnCount
        orderDirection: desc
      ) {
        id
        txnCount
      }
    }
  `,
};

// export config as default export
export default config;
