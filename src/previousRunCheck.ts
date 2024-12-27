import path from 'path';
import { readJsonFile, writeJsonFile } from './utils';

import { Slot, Week } from './types';
import { log } from 'console';

const compareResultWithPreviousRun = async (
  week: Week,
  openSixOrEightSlots: Record<number, Slot[]>,
) => {
  log(
    `Comparing previous run against current open slots: ${JSON.stringify(openSixOrEightSlots, null, 2)}`,
  );

  const previousRunFilePath = path.resolve(
    __dirname,
    `../${week}-previousRun.json`,
  );

  const previousRun = (await readJsonFile(previousRunFilePath)) as Record<
    number,
    Slot[]
  > | null;

  // Update previous run json with the current result
  await writeJsonFile(
    previousRunFilePath,
    JSON.stringify(openSixOrEightSlots, null, 2),
  );

  if (!previousRun) {
    log('No previous run found');

    return openSixOrEightSlots;
  }

  log(
    `Found previous run with contents: ${JSON.stringify(previousRun, null, 2)}`,
  );

  return Object.keys(openSixOrEightSlots).reduce(
    (slotsThatHaveNotBeenAlertedYet, dayOfTheWeekString) => {
      const dayOfTheWeek = Number.parseInt(dayOfTheWeekString, 10);

      const slotsInWeek = openSixOrEightSlots[dayOfTheWeek];
      const slotsInWeekPreviousRun = previousRun[dayOfTheWeek];

      // Keep slots that were available now but not avaialabe before.
      const slotsToKeep = slotsInWeek.filter((slot) => {
        const slotInPreviousWeek = slotsInWeekPreviousRun?.find(
          (slotInPreviousRun) => slotInPreviousRun.time === slot.time,
        );

        // If the slot was in the previous object it means it was bookable
        return !slotInPreviousWeek;
      });

      if (slotsToKeep.length > 0) {
        return {
          ...slotsThatHaveNotBeenAlertedYet,
          [dayOfTheWeekString]: slotsToKeep,
        };
      }

      return slotsThatHaveNotBeenAlertedYet;
    },
    {} as Record<string, Slot[]>,
  );
};

export { compareResultWithPreviousRun };
