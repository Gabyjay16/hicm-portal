import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  
  await page.fill('input[type="text"]', 'System Admin');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Sign In to Portal")');
  
  await page.waitForSelector('text=Administrator Control Panel');
  
  console.log("Clicking User Management...");
  await page.click('text=User Management');
  
  await page.waitForTimeout(2000);
  console.log("Current URL:", page.url());
  
  const content = await page.content();
  if (content.includes('Active Complaints')) {
    console.log("Still on Dashboard!");
  } else {
    console.log("Successfully navigated away from Dashboard.");
  }
  
  await browser.close();
})();
