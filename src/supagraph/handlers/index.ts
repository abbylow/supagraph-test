// type the handlers
import { Handlers, withDefault } from "supagraph";

// Import the handlers
import { IziswapFactoryHandler } from "./iziswapFactory";
import { TransactionHandler } from "./network";

// Construct the handlers to register each contract against its handlers
export const handlers: Handlers = {
  // construct handlers for the network level events (withDefault will parse numerics)
  [withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001)]: {
    // eventName -> handler()
    onTransaction: TransactionHandler,
  },
  // construct as a named group
  iziswapFactory: {
    // eventName -> handler()
    NewPool: IziswapFactoryHandler,
  },
};
