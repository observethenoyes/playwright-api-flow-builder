import { test, expect } from '@playwright/test';

const baseUrl = "https://api.myapp.com";

test("Generated API test", async ({ request }) => {
  const authToken = await test.step("POST and save as authToken", async () => {
    const response = await request.post(`${baseUrl}/api/auth/login`, {
      data: {
        "username": "testuser",
        "password": "password123"
      },
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Playwright-API-Test",
        "X-Client-Version": "1.0.0"
      }
    });
    await expect(response).toBeOK();
    const data = await response.json();
    return data;
  });

  const userProfile = await test.step("GET and save as userProfile", async () => {
    const response = await request.get(`${baseUrl}/api/user/profile`, {
      headers: {
        "Authorization": `Bearer ${authToken.token}`,
        "Accept": "application/json",
        "Cache-Control": "no-cache"
      }
    });
    await expect(response).toBeOK();
    const data = await response.json();
    return data;
  });

  await test.step("GET request", async () => {
    const response = await request.get(`${baseUrl}/api/orders?userId=${userProfile.id}`, {
      headers: {
        "Authorization": `Bearer ${authToken.token}`,
        "Accept": "application/json",
        "X-Request-ID": `orders-fetch-${userProfile.id}`
      }
    });
    await expect(response).toBeOK();
    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });
});