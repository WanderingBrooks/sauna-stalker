import 'dotenv/config';

import { checkSaunaAvailability } from './pageScraper';
import { alertSaunaAvailability, sendRunLog } from './emailSender';
import { compareResultWithPreviousRun } from './previousRunCheck';
import { Week, AvailableSlots } from './types';
import log from './log';

const run = async (week: Week) => {
  log(`Running job with week: "${week}"`);

  const slotStatuses = await checkSaunaAvailability(week);

  if (slotStatuses) {
    const openSixOrEightSlots = slotStatuses.reduce<AvailableSlots>(
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
      {},
    );

    const slotsFilterdByPreviousRun = await compareResultWithPreviousRun(
      week,
      openSixOrEightSlots,
    );

    if (Object.keys(slotsFilterdByPreviousRun).length > 0) {
      await alertSaunaAvailability(week, slotsFilterdByPreviousRun);
    } else {
      log('Ending process, nothing to alert');
    }
  }

  return sendRunLog(week);
};

export default run;
