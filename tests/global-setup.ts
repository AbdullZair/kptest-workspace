import { chromium, FullConfig } from '@playwright/test';
import { testUsers } from './test-data';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login via API to get tokens
    const loginResponse = await page.request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testUsers.patient.email,
        password: testUsers.patient.password,
      },
    });

    const loginBody = await loginResponse.json();

    if (loginResponse.status() !== 200) {
      console.log(`Login failed: ${loginResponse.status()}`);
    } else {
      // Create auth state with tokens
      const authState = {
        cookies: [],
        origins: [{
          origin: 'http://localhost:3000',
          localStorage: [{
            name: 'auth_access_token',
            value: loginBody.access_token
          }, {
            name: 'auth_refresh_token', 
            value: loginBody.refresh_token
          }, {
            name: 'auth_token_expiry',
            value: (Date.now() + (loginBody.expires_in || 900) * 1000).toString()
          }]
        }]
      };

      // Save auth state to file
      const authDir = path.join(__dirname, '.auth');
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      fs.writeFileSync(path.join(authDir, 'user.json'), JSON.stringify(authState, null, 2));
      console.log('Auth state saved successfully');
    }
  } catch (error) {
    console.log('Global setup error:', error);
    // Create empty auth state on error
    const authDir = path.join(__dirname, '.auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    fs.writeFileSync(path.join(authDir, 'user.json'), JSON.stringify({ cookies: [], origins: [] }, null, 2));
  } finally {
    await browser.close();
  }
}

export default globalSetup;
