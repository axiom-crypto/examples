import Title from "@/components/ui/Title";
import { Constants } from "@/shared/constants";
import Link from "next/link";

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

export default async function Success({ searchParams }: PageProps) {
  const address = searchParams?.address as string ?? "";
  
  return (
    <>
      <Title>
        Success
      </Title>
      <div className="text-center">
        { "Congratulations! You've successfully claimed the UselessToken airdrop." }
      </div>
      <Link href={`https://goerli.etherscan.io/token/${Constants.TOKEN_ADDR}?a=${address}`} target="_blank">
        View on Etherscan
      </Link>
    </>
  )
}