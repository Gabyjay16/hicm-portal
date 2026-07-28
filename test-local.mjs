import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to local preview server...");
    await page.goto('http://localhost:4173/');
    
    // Test login as admin
    console.log("Clicking 'Log In to Portal'");
    await page.click('text="Log In to Portal"');
    
    console.log("Filling login form");
    await page.fill('input[name="username"]', 'System Admin');
    await page.fill('input[name="password"]', 'admin123');
    
    console.log("Submitting login form");
    await page.click('button[type="submit"]');
    
    console.log("Waiting for dashboard...");
    await page.waitForSelector('text="Administrator Control Panel"', { timeout: 5000 });
    
    console.log("Clicking User Management...");
    await page.click('text="User Management"');
    
    console.log("Waiting for User Management page...");
    await page.waitForSelector('text="View and manage all registered students and staff."', { timeout: 5000 });
    
    console.log("SUCCESS! Navigation to User Management worked.");
  } catch (error) {
    console.error("TEST FAILED:", error.message);
  } finally {
    await browser.close();
  }
})();
