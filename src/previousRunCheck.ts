import path from 'path';
import { readJsonFile, writeJsonFile } from './utils';

import { Slot } from './types';
import { log } from 'console';

const previousRunFilePath = path.resolve(__dirname, '../previousRun.json');

const compareResultWithPreviousRun = async (
  openSixOrEightSlots: Record<number, Slot[]>,
) => {
  log('Comparing previous run');

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
      const slotsToKeep = slotsInWeek.filter(
        (slot) =>
          slotsInWeekPreviousRun.find(
            (slotInPreviousRun) => slotInPreviousRun.time === slot.time,
          )?.isAvailable === false,
      );

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
