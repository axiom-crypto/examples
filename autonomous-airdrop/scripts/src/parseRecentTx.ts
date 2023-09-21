import { Constants } from "./constants";

export async function findFirstUniswapTx(address: string): Promise<any | null> {
  let page = 0;
  let next = "";
  while (next !== null) {
    const res = await getRecentTxs(address, page++);
    const recentTx = res?.data?.items ?? [];
    for (const tx of recentTx) {
      const to = tx?.to_address ?? "";
      if (to.toLowerCase() === Constants.UNISWAP_UNIV_ROUTER_GOERLI) {
        if (tx?.log_events?.length > 0) {
          for (const [idx, log] of tx.log_events.entries()) {
            if (log?.raw_log_topics?.[0] === Constants.EVENT_SCHEMA) {
              console.log("found a swap");
              console.log(log);
              return {
                logIdx: idx,
                log
              };
            }
          }
        }
      }
    }
    next = res?.data?.links?.next ?? null;
  }
  console.log("could not find any Swap transaction");
  return null;
}

async function getRecentTxs(address: string, page: number) {
  let headers = new Headers();
  headers.set('Authorization', `Bearer ${Constants.COVALENT_API_KEY as string}`);

  const covalentUri = `${Constants.COVALENT_BASE_URI}/eth-goerli/address/${address}/transactions_v3/page/${page}/`;
  const res = await fetch(covalentUri, {
    method: 'GET', 
    headers: headers
  });
  const json = await res.json();
  return json;
}