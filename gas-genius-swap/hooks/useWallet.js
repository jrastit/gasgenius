import { useWeb3React } from "@web3-react/core";
import { useEffect } from "react";
import { injected } from "../lib/connectors";

export function useWallet() {
  const { activate, active, account, library } = useWeb3React();

  const connect = async () => {
    try {
      await activate(injected);
    } catch (e) {
      console.error("Connection error", e);
    }
  };

  return { connect, active, account, library };
}
