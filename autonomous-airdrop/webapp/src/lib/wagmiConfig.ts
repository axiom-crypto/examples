import { goerli } from "viem/chains";
import { createConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { chains: _chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [publicProvider()],
)

export const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
})