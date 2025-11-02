import { EthersAdapter, } from "@reown/appkit-ethers-react-native";
import type { Storage } from '@reown/appkit-react-native';
import { AppKit, AppKitProvider, createAppKit, type AppKitNetwork } from "@reown/appkit-react-native";
import { safeJsonParse, safeJsonStringify } from '@walletconnect/safe-json';
import { MMKV } from 'react-native-mmkv';

// 1. Get projectId from https://dashboard.reown.com
const projectId = "7b9c6d4c6ec87ad7c14c87057a307384";
// 2. Create config
const metadata = {
  name: 'Apollon',
  description: 'AppKit for Apollon',
  url: 'https://app.apollon.fi', // origin must match your domain & subdomain
  icons: ['https://app.apollon.fi/assets/svgs/Apollon_logo_negative.svg'],
  redirect: {
    native: "reownbugrepro://",
    universal: "https://app.apollon.fi",
  },
};

// 3. Define your chains
const seiMainnet = {
  id: 1329,
  name: 'Sei Network',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc.sei-apis.com/'],
      webSocket: ['wss://evm-ws.sei-apis.com/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Seitrace',
      url: 'https://seitrace.com',
      apiUrl: 'https://seitrace.com/pacific-1/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  chainNamespace: 'eip155' as any,
  caipNetworkId: "eip155:1329" as '`${string}:${string}`',
  testnet: false
};


const mmkv = new MMKV();

const storage: Storage = {
    getKeys: async () => {
      return mmkv.getAllKeys();
    },
    getEntries: async <T = any>(): Promise<[string, T][]> => {
      function parseEntry(key: string): [string, any] {
        const value = mmkv.getString(key);
        return [key, safeJsonParse(value ?? '')];
      }

      const keys = mmkv.getAllKeys();
      return keys.map(parseEntry);
    },
    setItem: async <T = any>(key: string, value: T) => {
      return mmkv.set(key, safeJsonStringify(value));
    },
    getItem: async <T = any>(key: string): Promise<T | undefined> => {
      const item = mmkv.getString(key);
      if (typeof item === 'undefined' || item === null) {
        return undefined;
      }

      return safeJsonParse(item) as T;
    },
    removeItem: async (key: string) => {
      return mmkv.delete(key);
    },
  };


// const appNetworks: AppKitNetwork[] = [sei];

// 1. Define your AppKitNetworks (for AppKit's UI and network management)
// These can come from viem/chains (for EVM) or be custom AppKitNetwork objects.
const appNetworks: AppKitNetwork[] = [
  seiMainnet
];

export const ethersAdapter = new EthersAdapter();

// 4. Create modal
export const appKit = createAppKit({
  projectId,
  metadata,
  networks: appNetworks, // Master list of networks for AppKit UI and context
  defaultNetwork: seiMainnet,

  adapters: [
    ethersAdapter,  // Handles EVM chains defined in 'networks'
  ],
  storage,
  themeMode: 'dark',
  debug: true
});


export function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  return  <AppKitProvider instance={appKit}>
    <AppKit />
    {children}
  </AppKitProvider>
}