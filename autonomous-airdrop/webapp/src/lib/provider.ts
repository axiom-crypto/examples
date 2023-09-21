import { JsonRpcProvider } from "ethers";
import { numberToHex } from "./utils";

export const getCurrentBlock = async (): Promise<number> => {
  const providerUri = process.env.PROVIDER_URI_MAINNET as string;
  const provider = new JsonRpcProvider(providerUri);
  const blockNumber = await provider.getBlockNumber();
  return blockNumber;
}

export const getProof = async (address: string, blockNumber: number): Promise<any> => {
  const providerUri = process.env.PROVIDER_URI_MAINNET as string;
  const provider = new JsonRpcProvider(providerUri);
  const proof = await provider.send("eth_getProof", [address, [], numberToHex(blockNumber)]);
  return proof;
}

export const getTxBlocks = async (address: string, limit: number, asc: boolean): Promise<any[] | undefined> => {
  const limitHex = `0x${limit.toString(16)}`;
  const direction = asc ? "asc" : "desc";

  const res = await fetch(process.env.PROVIDER_URI_MAINNET as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "id": 0,
      "method": "alchemy_getAssetTransfers",
      "params": [
        {
          "fromAddress": address,
          "maxCount": limitHex,
          "excludeZeroValue": true,
          "order": direction,
          "category": [
            "external"
          ]
        }
      ]
    })
  });
  const data = await res.json();
  console.log(data);
  return data?.result?.transfers;
}

export const getLastTxBlockNumber = async (address: string): Promise<number | undefined> => {
  const blocks = await getTxBlocks(address, 1, false);
  if (blocks === undefined || blocks.length === 0) {
    return undefined;
  }
  const blockNum = blocks[0]?.blockNum;
  return parseInt(blockNum, 16);
}

export const getFirstTxBlockNumber = async (address: string): Promise<number | undefined> => {
  const blocks = await getTxBlocks(address, 1, true);
  if (blocks === undefined || blocks.length === 0) {
    return undefined;
  }
  const blockNum = blocks[0]?.blockNum;
  return parseInt(blockNum, 16);
}
