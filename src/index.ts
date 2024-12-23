import 'dotenv/config';
import path from 'path'

import { checkSaunaAvailability } from './pageScraper';
import { alertSaunaAvailability } from './emailSender';
import { Slot } from './types';


(async() => {
  const slotStatuses = await checkSaunaAvailability();

  if (slotStatuses){ 
    const openSixOrEightSlots = slotStatuses.reduce((reduced, day, index) => {
      const openSixOrEightSlotsInDay = day.filter(slot => 
        slot.isAvailable && ["18:00 - 20:00", "20:00 - 22:00"].includes(slot.time)
      );

      if (Array.isArray(openSixOrEightSlotsInDay) && openSixOrEightSlotsInDay.length > 0) {
        return {
          ...reduced,
          [index]: openSixOrEightSlotsInDay
        }
      }

      return reduced;
    }, {} as Record<number, Slot[]>)
    
    if (Object.keys(openSixOrEightSlots).length > 0) {
      return alertSaunaAvailability(openSixOrEightSlots);
    }
  }
})().then(() => process.exit(0));