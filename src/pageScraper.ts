import puppeteer, { Page } from 'puppeteer';

import log from './log';
import { Day } from './types';

const { EMAIL, PASSWORD, LOGIN_URL, SAUNA_URL, IS_RASPBERRY_PI } = process.env;

if (!LOGIN_URL) {
  throw new Error('Login url is required');
}

if (!EMAIL) {
  throw new Error('Email is required');
}

if (!PASSWORD) {
  throw new Error('Password is required');
}

if (!SAUNA_URL) {
  throw new Error('Sauna url is required');
}

const extractSlots = (page: Page) =>
  page.evaluate(() => {
    const dayColumns = document.querySelectorAll('.dayColumn');

    const statusPerSlot = Array.from(dayColumns).reduce((reduced, column) => {
      const children = column?.children;

      const slotsWithStatus = Array.from(children)
        // Filter our non timeslot items
        .filter((child) => child.classList.contains('interval'))
        .map((child) => ({
          isAvailable: child.classList.contains('bookable'),
          time: (
            Array.from(child?.children)?.[0] as HTMLElement
          )?.innerText?.replace('\n', ''),
        }))
        .filter((slot) => slot.time);

      return [...reduced, slotsWithStatus];
    }, [] as Day[]);

    return statusPerSlot;
  });

const checkSaunaAvailability = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(
    IS_RASPBERRY_PI === 'true'
      ? {
          headless: true,
          executablePath: '/usr/bin/chromium-browser',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
      : {
          headless: false,
        },
  );

  log('Launched browser');

  const page = await browser.newPage();

  log('Opened new page');

  // Go to login page
  // Navigate the page to a URL
  await page.goto(LOGIN_URL);

  log('Navigated to login url');

  // Type the username and password
  await page.type('#UserName', EMAIL);

  log('Filled username');

  await page.type('#Password', PASSWORD);

  log('Filled password');

  // Click the login button
  await page.click('#btnLogin');

  log('Clicked login');

  // Wait for the login to succeed
  await page.waitForSelector('.navigationElement');

  log('Menu appeared after login');

  const currentDate = new Date().toISOString().split('T')[0];

  // Navigate to the sauna booking page
  await page.goto(`${SAUNA_URL}&passDate=${currentDate}`);
  log('Navigated to current week sauna url');

  const currentWeekSlotStatuses = await extractSlots(page);

  log(
    `extracted current week statuses: ${JSON.stringify(currentWeekSlotStatuses, null, 2)}`,
  );

  const nextWeekMonday = new Date();

  const currentDayAmerican = nextWeekMonday.getDay();

  const currentDayNormal =
    currentDayAmerican === 0 ? 6 : currentDayAmerican - 1;

  nextWeekMonday.setDate(
    // Add to the current date 7 - the current day of the week
    // so that we get into the next week
    nextWeekMonday.getDate() + (7 - currentDayNormal),
  );

  const nextWeekDate = nextWeekMonday.toISOString().split('T')[0];

  // Navigate to the sauna booking page
  await page.goto(`${SAUNA_URL}&passDate=${nextWeekDate}`);
  log('Navigated to next week sauna url');

  const nextWeekSlotStatuses = await extractSlots(page);

  log(
    `extracted next week statuses: ${JSON.stringify(nextWeekSlotStatuses, null, 2)}`,
  );

  return {
    thisWeek: currentWeekSlotStatuses,
    nextWeek: nextWeekSlotStatuses,
  };
};

export { checkSaunaAvailability };
