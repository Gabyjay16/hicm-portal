const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  
  // Login as admin
  await page.fill('input[type="text"]', 'System Admin');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Sign In to Portal")');
  
  // Wait for dashboard to load
  await page.waitForSelector('text=Administrator Control Panel');
  
  // Click User Management
  console.log("Clicking User Management...");
  await page.click('text=User Management');
  
  // Check URL
  await page.waitForTimeout(1000);
  console.log("Current URL:", page.url());
  
  const content = await page.content();
  if (content.includes('Active Complaints')) {
    console.log("Still on Dashboard!");
  } else {
    console.log("Successfully navigated away from Dashboard.");
  }
  
  await browser.close();
})();
