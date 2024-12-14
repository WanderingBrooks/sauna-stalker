import { checkSaunaAvailability } from './pageScraper';
import { alertSaunaAvailability } from './emailSender';

(async() => {
  const isBookable = await checkSaunaAvailability();

  if (isBookable) {
    return alertSaunaAvailability();
  }
})().then(() => process.exit(0));