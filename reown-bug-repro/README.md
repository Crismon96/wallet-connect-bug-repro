# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app in a custom development build (necessary to use Wallet locally)

   ```bash
   npx expo run:ios --device "Your iPhone"
   ```

https://github.com/reown-com/appkit-react-native/issues/494

Can be reproduced by connecting/disconnecting the app multiple times. The default chain is set to "SEI" and this works well most of the times. Sometimes though the Appkit modeal "Change Network" is shown which leads to this bug.

If this happened signing a TX will put you to a loop between Metamask and this demo app like shown in the attached video.

https://github.com/reown-com/appkit-react-native/issues/493

This bug can be reproduced on connecting/disconnecting your wallet.

My Metamask version is: v7.57.0(2783)
Let me know your address and I will send you some Gas to sign the demo TX.