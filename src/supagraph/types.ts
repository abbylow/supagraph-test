// All numeric values will be handled as BigNumbers
import type { BigNumber } from "ethers";

// Each sync will be provided its own provider
import type { BigNumberish } from "ethers/lib/ethers";

// Definitions for the TokensMigrated Events args (as defined in the abi)
export type NewPoolEvent = {
  tokenX: string;
  tokenY: string;
  fee: BigNumber;
  pointDelta: BigNumber;
  pool: string;
};

// Contract entity definition
export type ContractEntity = {
  id: string; // contract address
  txnCount: BigNumberish;
  blockNumber: BigNumberish;
  transactionHash: String;
};
