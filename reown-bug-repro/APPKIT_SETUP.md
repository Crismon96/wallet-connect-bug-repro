# Reown AppKit Setup Guide

## Overview
This guide documents the manual setup of Reown AppKit (WalletConnect) for React Native, implemented because the official CLI has a bug preventing it from running.

## CLI Bug Details
The `@reown/appkit-cli` tool fails with this error:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module chalk/source/index.js not supported
```

This is a known issue where the CLI tries to `require()` an ES Module (chalk v5+), which is not supported in CommonJS modules.

## What Was Installed

### Core Dependencies
- `@reown/appkit-react-native` - Main AppKit library
- `@reown/appkit-ethers-react-native` - Ethers.js adapter for EVM chains
- `@react-native-async-storage/async-storage` - Storage for persistence
- `react-native-get-random-values` - Cryptographic random values
- `react-native-svg` - SVG support
- `@react-native-community/netinfo` - Network information
- `@walletconnect/react-native-compat` - WalletConnect compatibility polyfills
- `react-native-safe-area-context` - Safe area handling (already installed)
- `expo-application` - Application info

## Files Created/Modified

### 1. `babel.config.js` (Created)
Babel configuration required for Expo SDK 53+ to support the valtio library used by AppKit.

### 2. `utils/storage.ts` (Created)
Storage adapter implementing the AppKit `Storage` interface using AsyncStorage for data persistence across sessions.

### 3. `config/appkit.ts` (Created)
Main AppKit configuration file that:
- Initializes the WalletConnect compat layer
- Creates the Ethers adapter
- Configures AppKit with:
  - Networks: Ethereum Mainnet and Polygon
  - Storage adapter
  - App metadata
  - Deep linking configuration

**⚠️ ACTION REQUIRED:**
You need to replace `YOUR_PROJECT_ID` with your actual Project ID from [Reown Dashboard](https://cloud.reown.com).

### 4. `app/_layout.tsx` (Modified)
Updated the root layout to:
- Import AppKit configuration
- Render the `<AppKit />` component
- Applied workaround for Expo Router Android modal issue (wrapped in absolute positioned View)

### 5. `app/(tabs)/index.tsx` (Modified)
Added a wallet connection demo showing:
- How to use `useAppKit()` hook to open the wallet modal
- How to use `useAppKitAccount()` hook to get connection status and address
- Example UI for connect/disconnect functionality

## Next Steps

### 1. Get a Project ID
1. Go to [Reown Dashboard](https://cloud.reown.com)
2. Create a new project
3. Copy your Project ID
4. Update `config/appkit.ts` and replace `YOUR_PROJECT_ID`

### 2. Configure Deep Links (Optional but Recommended)
Update the `metadata.redirect` section in `config/appkit.ts`:
```typescript
redirect: {
  native: "your-app-scheme://",  // e.g., "myapp://"
  universal: "yourapp.com",       // Your actual domain
}
```

Then configure your app's deep linking in `app.json`:
```json
{
  "expo": {
    "scheme": "your-app-scheme"
  }
}
```

### 3. Start Your App
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Or scan the QR code with Expo Go

### 4. Test the Connection
1. Open the app
2. On the home tab, you'll see "AppKit Wallet Connection"
3. Tap "Connect Wallet"
4. The AppKit modal should open with wallet options

## Features

AppKit comes with these features **enabled by default**:
- Email & Social Login
- Token Swaps
- On-Ramp (fiat to crypto)

To disable any features, see the [Options documentation](https://docs.reown.com/appkit/react-native/core/options).

## Adding More Chains

### Solana Support
```bash
npx expo install @reown/appkit-solana-react-native
```

Then update `config/appkit.ts`:
```typescript
import { SolanaAdapter } from '@reown/appkit-solana-react-native';
import { solana } from '@reown/appkit-react-native';

const solanaAdapter = new SolanaAdapter();

// Add to createAppKit:
networks: [mainnet, polygon, solana],
adapters: [ethersAdapter, solanaAdapter],
```

### Bitcoin Support
```bash
npx expo install @reown/appkit-bitcoin-react-native
```

Then update `config/appkit.ts`:
```typescript
import { BitcoinAdapter } from '@reown/appkit-bitcoin-react-native';
import { bitcoin } from '@reown/appkit-react-native';

const bitcoinAdapter = new BitcoinAdapter();

// Add to createAppKit:
networks: [mainnet, polygon, bitcoin],
adapters: [ethersAdapter, bitcoinAdapter],
```

## Available Hooks

AppKit provides these React hooks:
- `useAppKit()` - Open/close modal, disconnect
- `useAppKitAccount()` - Account address, connection status, chain ID
- `useAppKitState()` - Modal state, loading state
- `useAppKitTheme()` - Theme management
- `useAppKitEvents()` - Listen to wallet events

See the [Hooks documentation](https://docs.reown.com/appkit/react-native/core/hooks) for details.

## Available Components

Pre-built components you can use:
- `<AppKitButton />` - Pre-styled connect button
- `<AppKitAccountButton />` - Shows account info when connected
- `<AppKit />` - The modal (already added to _layout.tsx)

## Troubleshooting

### Modal doesn't open on Android (Expo Router)
✅ Already fixed - we wrapped `<AppKit />` in an absolutely positioned View as recommended in the docs.

### "Unable to resolve module" errors
Run:
```bash
npm install
npx expo start --clear
```

### Storage errors
Make sure `@react-native-async-storage/async-storage` is properly installed and linked.

## Resources
- [Official Documentation](https://docs.reown.com/appkit/react-native/core/installation)
- [Reown Dashboard](https://cloud.reown.com)
- [AppKit Examples](https://github.com/reown-com/appkit/tree/main/examples)
- [GitHub Issues](https://github.com/reown-com/appkit/issues)

