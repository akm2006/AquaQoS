import { defineConfig } from "hardhat/config";

export default defineConfig({
  solidity: {
    version: "0.8.30",
    npmFilesToBuild: [
      "@1inch/aqua/src/Aqua.sol",
      "@1inch/swap-vm/src/routers/AquaSwapVMRouter.sol",
      "@1inch/solidity-utils/contracts/mocks/TokenMock.sol",
    ],
    settings: {
      optimizer: { enabled: true, runs: 700 },
      viaIR: true,
      evmVersion: "cancun",
    },
  },
  test: {
    solidity: { fuzz: { runs: 256 } },
  },
});
