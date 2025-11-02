import { Image } from 'expo-image';
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppKitButton, useAccount, useAppKit, useProvider } from '@reown/appkit-react-native';
import { BrowserProvider, Contract } from 'ethers';
import { Eip1193Provider } from 'ethers/providers';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';

// Constants for the demo transaction
const USDC_TOKEN_ADDRESS = '0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1'; // TODO: Add your USDC token address here
const DEMO_SPENDER_ADDRESS = '0xb9383936b8508061458F7169490FcFe368EAD337'; // Demo spender address
const APPROVE_AMOUNT = '1000000'; // 1 USDC (6 decimals)

// Minimal ERC20 ABI for approve function
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export default function HomeScreen() {
  const { open } = useAppKit();
  const { address, isConnected, chainId, chain, namespace } = useAccount();
  const { provider: walletProvider } = useProvider();
  const [ethersProvider, setEthersProvider] = useState<BrowserProvider | null>(null);

  // Initialize ethers provider when wallet connects (following main app pattern)
  useEffect(() => {
    console.log('🔷 [PROVIDER_INIT] useEffect triggered:', {
      isConnected,
      address,
      chainId,
      hasWalletProvider: !!walletProvider,
    });

    if (isConnected && address && walletProvider && chainId) {
      console.log('🔷 [PROVIDER_INIT] Creating BrowserProvider');
      
      // Create a wrapper to handle problematic RPC calls
      const wrappedProvider = {
        request: async (args: { method: string; params?: any[] }) => {
          console.log('🔷 [PROVIDER_INIT] Request:', args.method);
          
          // The Reown provider has a bug with eth_blockNumber, so we'll 
          // use a fallback RPC for read operations
          if (args.method === 'eth_blockNumber' || args.method === 'eth_getBlockByNumber') {
            try {
              // Use Sei RPC directly for read operations
              const rpcUrl = 'https://evm-rpc.sei-apis.com/';
              const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: args.method,
                  params: args.params || [],
                  id: 1,
                }),
              });
              const data = await response.json();
              console.log('🔷 [PROVIDER_INIT] Fallback RPC response:', data.result);
              return data.result;
            } catch (error) {
              console.error('🔷 [PROVIDER_INIT] Fallback RPC failed:', error);
              throw error;
            }
          }
          
          // For all other methods, use the wallet provider
          return (walletProvider as any).request(args);
        },
      };
      
      const provider = new BrowserProvider(wrappedProvider as Eip1193Provider);
      setEthersProvider(provider);
      console.log('🔷 [PROVIDER_INIT] BrowserProvider created successfully');
    } else {
      setEthersProvider(null);
    }
  }, [isConnected, address, walletProvider, chainId]);

  const executeDemoTransaction = async () => {
    console.log('🔷 [DEMO_TX] Starting demo transaction');
    
    if (!isConnected || !address) {
      Alert.alert('Not Connected', 'Please connect your wallet first');
      return;
    }

    if (!ethersProvider) {
      Alert.alert('Error', 'Provider not initialized. Please wait for connection to complete.');
      return;
    }

    try {
      console.log('🔷 [DEMO_TX] Getting signer');
      // Get the signer (same as main app's connectWallet function)
      const signer = await ethersProvider.getSigner();
      console.log('🔷 [DEMO_TX] Signer obtained:', await signer.getAddress());

      console.log('🔷 [DEMO_TX] Creating contract instance for USDC at:', USDC_TOKEN_ADDRESS);
      // Create the contract instance (similar to how you create contracts in your main app)
      const usdcContract = new Contract(
        USDC_TOKEN_ADDRESS,
        ERC20_ABI,
        signer
      );

      console.log('🔷 [DEMO_TX] Calling approve method');
      // Call the approve method - this returns a ContractTransactionResponse
      // (same pattern as your main app's methodCall functions)
      const txResponse = await usdcContract.approve(DEMO_SPENDER_ADDRESS, APPROVE_AMOUNT);
      
      console.log('🔷 [DEMO_TX] Transaction sent! Hash:', txResponse.hash);
      Alert.alert(
        'Transaction Sent',
        `Transaction hash: ${txResponse.hash.substring(0, 10)}...`,
        [
          {
            text: 'Wait for Confirmation',
            onPress: async () => {
              console.log('🔷 [DEMO_TX] Waiting for transaction to be mined...');
              const receipt = await txResponse.wait();
              console.log('🔷 [DEMO_TX] Transaction mined! Block:', receipt?.blockNumber);
              Alert.alert('Success', `Transaction confirmed in block ${receipt?.blockNumber}`);
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );

    } catch (error: any) {
      console.error('🔷 [DEMO_TX] Error:', error);
      console.error('🔷 [DEMO_TX] Error stack:', error.stack);
      Alert.alert(
        'Transaction Error',
        error.message || 'Failed to execute transaction'
      );
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <AppKitButton />
      
      {/* Demo Transaction Button */}
      {isConnected && (
        <TouchableOpacity 
          style={styles.demoButton} 
          onPress={executeDemoTransaction}
        >
          <ThemedText style={styles.demoButtonText}>
            🔷 Execute Demo Transaction (USDC Approve)
          </ThemedText>
        </TouchableOpacity>
      )}
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  address: {
    marginTop: 8,
    fontFamily: 'monospace',
  },
  demoButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
