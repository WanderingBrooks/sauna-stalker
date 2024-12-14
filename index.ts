import 'dotenv'

import puppeteer from 'puppeteer';

const {
  EMAIL,
  PASSWORD,
  LOGIN_URL,
  SAUNA_URL,
} = process.env;

if (!LOGIN_URL) {
  throw new Error('Login url is required')
}
if (!EMAIL) {
  throw new Error('Email is required')
}
if (!PASSWORD) {
  throw new Error('Password is required')
}
if (!SAUNA_URL) {
  throw new Error('Sauna url is required')
}


const currentDate = (new Date()).toISOString().split('T')[0]
const log = (message: string) => console.log(`${currentDate}: ${message}`);

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  
  log('Launched browser')

  const page = await browser.newPage();

  log('Opened new page')

  // Go to login page
  // Navigate the page to a URL
  await page.goto(LOGIN_URL);

  log('Navigated to login url')

  // Type the username and password
  await page.type('#UserName', EMAIL);

  log('Filled username')

  await page.type('#Password', PASSWORD);

  log('Filled password')

  // Click the login button
  await page.click('#btnLogin')

  log('Clicked login')

  // Wait for the login to succeed
  await page.waitForSelector('.navigationElement')

  log('Menu appeared after login')

  const currentDate = (new Date()).toISOString().split('T')[0]

  // Navigate to the sauna booking page
  await page.goto(`${SAUNA_URL}&passDate=${currentDate}`);
  log('Navigated to sauna url');
  
  const isBookable = await page.evaluate(() => {
    const getTimeSlot = () => {
      const hour = new Date().getHours();
    
      if (hour >= 18 && hour < 20) {
        return 7;
      }
    
      if (hour >= 20 && hour < 22) {
        return 8;
      }
    }

    // Sunday is 0, Saturday is 6
    const currendDayOfTheWeekIndexAmerican = new Date().getDay()
    const currendDayOfTheWeekIndexNormal = currendDayOfTheWeekIndexAmerican === 0 ? 6 : currendDayOfTheWeekIndexAmerican - 1;

    const dayColumns = document.querySelectorAll('.dayColumn');


    const currentDayColumn = dayColumns?.[currendDayOfTheWeekIndexNormal];

    const children = currentDayColumn?.children;

    const timeSlot = getTimeSlot();

    if (!timeSlot || !children) {
      return null;
    }

    const currentSlot = children[timeSlot];

    return currentSlot.classList.contains('bookable');
 });

 if (isBookable === null) {
  log(`Something went wrong when parsing page. Check if page has updated`); 
 }

 log(`Found login status { isBookable: ${isBookable}`);

 await browser.close();
 log('Closed browser')

 console.log({ isBookable });
})();