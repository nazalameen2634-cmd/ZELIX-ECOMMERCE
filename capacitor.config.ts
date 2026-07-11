import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zelix.app',
  appName: 'zelix',
  webDir: 'out',
  server: {
    url: 'https://your-zelix-website.com', // TODO: Replace this with your actual live URL
    cleartext: true
  }
};

export default config;
