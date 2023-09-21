import LinkButton from "@/components/ui/LinkButton";
import Title from "@/components/ui/Title";
import { findFirstUniswapTx } from "@/lib/parseRecentTx";

interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

interface Params {
  slug: string;
}

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export default async function Check({ searchParams }: PageProps) {
  const address = searchParams?.address as string ?? "";
  const uniswapTx = await findFirstUniswapTx(address);

  const renderNotEligible = () => {
    return (
      <>
        <div className="text-center">
          {"Sorry, we couldn't find a Swap event for this address after Goerli block 9000000."}
        </div>
        <LinkButton
          label="Go back"
          href="/"
        />
      </>
    )
  }

  const renderEligible = () => {
    const log = uniswapTx?.log;
    const txHash = log?.tx_hash;
    const blockNumber = log?.block_height;
    const logIdx = uniswapTx?.logIdx;

    if (!txHash || !blockNumber || !logIdx) {
      return renderNotEligible();
    }

    return (
      <>
        <div className="text-center">
          {"Congratulations! You're eligible for the UselessToken airdrop."}
        </div>
        <LinkButton
          label="Build Axiom proof params"
          href={"/claim?" + new URLSearchParams({
            address,
            txHash,
            blockNumber: blockNumber.toString(),
            logIdx: logIdx.toString(),
          })}
        />
      </>
    )
  }

  return (
    <>
      <Title>
        Check eligibility
      </Title>
      { uniswapTx !== null ? renderEligible() : renderNotEligible()}
    </>
  )
}