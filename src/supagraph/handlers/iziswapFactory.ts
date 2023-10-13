// Use Store to interact with entity storage
import { Store } from "supagraph";

// Each event is supplied the block and tx along with the typed args
import { Block, TransactionReceipt } from "@ethersproject/providers";

// - These types will be generated based on the event signatures exported by the defined contracts in config (coming soon TM);
import type {
  NewPoolEvent,
  ContractEntity,
} from "../types";

// Generic handler to consume TokensMigrated events
export const IziswapFactoryHandler = async (
  args: NewPoolEvent,
  { tx, block }: { tx: TransactionReceipt; block: Block }
) => {
  // load the entity for this contract
  const contract = await Store.get<ContractEntity>("Contract", args.pool);
  contract.set("txnCount", 0);
  contract.set("blockNumber", tx.blockNumber);
  contract.set("transactionHash", tx.transactionHash);

  // save all changes
  await contract.save();
};
