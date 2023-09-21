import MainLayout from '@/components/layout/MainLayout'
import ConnectWallet from '@/components/ui/ConnectWallet'
import LinkButton from '@/components/ui/LinkButton'
import Title from '@/components/ui/Title'
import { forwardSearchParams } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'


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

export default async function Home({ searchParams }: PageProps) {
  const address = searchParams?.address as string ?? "";
  console.log(searchParams);

  const renderButton = () => {
    if (address) {
      return <LinkButton
        label="Check Eligibility"
        href={"/check?" + forwardSearchParams(searchParams)}
      />;
    }
    return <ConnectWallet addressVerify={address} />;
  }

  return (
    <>
      <Title>
        Autonomous Airdrop
      </Title>
      <div className="text-center">
        Anyone who has used <Link href="https://app.uniswap.org/swap" target="_blank">Uniswap</Link> on Goerli testnet 
        after Goerli block 9000000 is eligible for an airdrop of a newly deployed test token called UselessToken. You may need to wait a few minutes 
        after executing your swap for the indexer to pick it up.
      </div>
      { renderButton() }
    </>
  )
}
