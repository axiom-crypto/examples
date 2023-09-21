"use client";

import { Constants } from "@/shared/constants";
import { BuiltQueryV2 } from "@axiom-crypto/experimental";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useContractEvent, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";
import { formatEther, parseEther } from "viem";
import Link from "next/link";

export default function ClaimAirdropClient(
  { abi, builtQuery, payment }:{
    abi: any[],
    builtQuery: BuiltQueryV2,
    payment: string,
  }
) {
  const { address } = useAccount();
  const router = useRouter();
  const [showExplorerLink, setShowExplorerLink] = useState(false);

  const claimParams = [
    builtQuery.sourceChainId,
    builtQuery.dataQueryHash,
    builtQuery.computeQuery,
    builtQuery.callback,
    builtQuery.maxFeePerGas,
    builtQuery.callbackGasLimit,
    builtQuery.dataQuery
  ];

  // Prepare hook for the sendQuery transaction
  const { config } = usePrepareContractWrite({
    address: Constants.AUTO_AIRDROP_ADDR as `0x${string}`,
    abi: abi,
    functionName: 'claimAirdrop',
    args: [claimParams],
    value: BigInt(payment),
  });
  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  // Check that the user has not claimed the airdrop yet
  const { data: hasClaimed, isLoading: hasClaimedLoading } = useContractRead({
    address: Constants.AUTO_AIRDROP_ADDR as `0x${string}`,
    abi: abi,
    functionName: 'hasClaimed',
    args: [address],
  });
  console.log("hasClaimed?", hasClaimed);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setShowExplorerLink(true);
      }, 15000); 
    }
  }, [isSuccess, setShowExplorerLink]);

  const proofGeneratedAction = useCallback(() => {
    router.push(`success/?address=${address}`);
  }, [router, address]);

  const proofValidationFailedAction = useCallback(() => {
    router.push(`fail/?address=${address}`);
  }, [router, address]);
  
  // Monitor contract for `ClaimAirdrop` or `ClaimAirdropError` events
  useContractEvent({
    address: Constants.AUTO_AIRDROP_ADDR as `0x${string}`,
    abi: abi,
    eventName: 'ClaimAirdrop',
    listener(log) {
      console.log("Claim airdrop success");
      console.log(log);
      proofGeneratedAction();
    },
  });

  useContractEvent({
    address: Constants.AUTO_AIRDROP_ADDR as `0x${string}`,
    abi: abi,
    eventName: 'ClaimAirdropError',
    listener(log) {
      console.log("Claim airdrop error");
      console.log(log);
      proofValidationFailedAction();
    },
  });

  const renderButtonText = () => {
    if (isSuccess) {
      return "Waiting for callback...";
    }
    if (isLoading) {
      return "Confrm transaction in wallet...";
    }
    if (!!hasClaimed) {
      return "Airdrop already claimed"
    }
    return "Claim 100 UT";
  }

  const renderClaimProofText = () => {
    return `Generating the proof for the claim costs ${formatEther(BigInt(payment)).toString()}ETH`;
  }

  const renderExplorerLink = () => {
    if (!showExplorerLink) {
      return null;
    }
    return (
      <Link href={`${Constants.EXPLORER_BASE_URL}${builtQuery.queryHash}`} target="_blank">
        View status on Axiom Explorer
      </Link>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        disabled={isLoading || isSuccess || !!hasClaimed}
        onClick={() => write?.()}
      >
        { renderButtonText() }
      </Button>
      <div className="flex flex-col items-center text-sm gap-2">
        <div>
          { isSuccess ? "Proof generation may take up to 3 minutes" : renderClaimProofText() }
        </div>
        { renderExplorerLink() }
      </div>
    </div>
  )
}