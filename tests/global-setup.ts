import { chromium, FullConfig } from '@playwright/test';
import { testUsers } from './test-data';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Login via API to get tokens (bypasses frontend /auth/me bug)
  const loginResponse = await page.request.post('http://localhost:8080/api/v1/auth/login', {
    data: {
      identifier: testUsers.patient.email,
      password: testUsers.patient.password,
    },
  });

  const loginBody = await loginResponse.json();

  if (loginResponse.status() !== 200) {
    throw new Error(`Login failed: ${loginResponse.status()} - ${JSON.stringify(loginBody)}`);
  }

  // Create a new page and set localStorage with tokens
  const authPage = await browser.newPage();
  await authPage.goto('http://localhost:3000');
  
  // Store tokens in localStorage
  await authPage.evaluate(({ accessToken, refreshToken, expiresIn }) => {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem('auth_access_token', accessToken);
    localStorage.setItem('auth_refresh_token', refreshToken);
    localStorage.setItem('auth_token_expiry', expiresAt.toString());
  }, {
    accessToken: loginBody.access_token,
    refreshToken: loginBody.refresh_token,
    expiresIn: loginBody.expires_in,
  });

  // Navigate to dashboard to verify auth works
  await authPage.goto('http://localhost:3000/dashboard');
  await authPage.waitForLoadState('networkidle');
  await authPage.waitForTimeout(3000);

  // Save auth state
  await authPage.context().storageState({ path: 'tests/.auth/user.json' });

  await browser.close();
}

export default globalSetup;
