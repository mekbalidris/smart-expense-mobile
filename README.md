# Smart Expense Mobile

An offline-first Expo and React Native expense tracker with SQLite storage,
category analytics, transaction filters, and network-aware sync.

## Run

```bash
npm.cmd install
npm.cmd run start
```

Press `a` for Android, `i` for iOS where supported, or `w` for web. Native
SQLite and NetInfo features require an Expo development build or compatible
device environment.

## Download the Android APK

GitHub Actions can build a downloadable Android APK:

1. Create an Expo account at https://expo.dev/signup.
2. Run `npx eas-cli login`, then `npx eas-cli build:configure`.
3. In GitHub, open **Settings > Secrets and variables > Actions**.
4. Add `EXPO_TOKEN` using a token from https://expo.dev/settings/access-tokens.
5. Push a version tag:

   ```bash
   git add .
   git commit -m "Prepare Android APK build"
   git push
   git tag v1.0.0
   git push origin v1.0.0
   ```

The workflow creates a GitHub Release containing `smart-expense.apk`. The APK is
also available under the workflow run's **Artifacts** section.
