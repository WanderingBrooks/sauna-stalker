import puppeteer from 'puppeteer';

import log from './log'

const {
  EMAIL,
  PASSWORD,
  LOGIN_URL,
  SAUNA_URL,
  IS_RASPBERRY_PI,
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

const checkSaunaAvailability = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(
    IS_RASPBERRY_PI === 'true'
    ? {
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    : {
      headless: false,
    }
  );
  
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
  
  const slotStatuses = await page.evaluate(() => {
    const dayColumns = document.querySelectorAll('.dayColumn');

    const statusPerSlot = Array.from(dayColumns).reduce((reduced, column, index) => {
      const children = column?.children;

      const slotsWithStatus = Array.from(children)
        // Filter our non timeslot items
        .filter(child => child.classList.contains('interval'))
        .map(child => ({
          isAvailable: child.classList.contains('bookable'),
          slot: (Array.from(child?.children)?.[0] as HTMLElement)?.innerText?.replace('\n', '')
        }))
        .filter(slot => slot.slot)

      return {
        ...reduced,
        [index]: slotsWithStatus
      }
    }, {})

   return statusPerSlot;
 });

 console.log(JSON.stringify(slotStatuses, null, 2));
}

export { checkSaunaAvailability };