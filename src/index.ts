import 'dotenv/config';

import { checkSaunaAvailability } from './pageScraper';
import { alertSaunaAvailability } from './emailSender';
import { compareResultWithPreviousRun } from './previousRunCheck';
import { Slot } from './types';
import log from './log';

(async () => {
  const slotStatuses = await checkSaunaAvailability();

  if (slotStatuses) {
    const openSixOrEightSlots = slotStatuses.reduce(
      (reduced, day, index) => {
        const openSixOrEightSlotsInDay = day.filter(
          (slot) =>
            slot.isAvailable &&
            ['18:00 - 20:00', '20:00 - 22:00'].includes(slot.time),
        );

        if (
          Array.isArray(openSixOrEightSlotsInDay) &&
          openSixOrEightSlotsInDay.length > 0
        ) {
          return {
            ...reduced,
            [index]: openSixOrEightSlotsInDay,
          };
        }

        return reduced;
      },
      {} as Record<number, Slot[]>,
    );

    const slotsFilterdByPreviousRun =
      await compareResultWithPreviousRun(openSixOrEightSlots);

    if (Object.keys(slotsFilterdByPreviousRun).length > 0) {
      return alertSaunaAvailability(slotsFilterdByPreviousRun);
    }

    log('Ending process, nothing to alert');
  }
})().then(() => process.exit(0));
