type Slot = {
  isAvailable: boolean;
  time: string;
};

type Day = Slot[];

type Week = 'thisWeek' | 'nextWeek';

export type { Slot, Day, Week };
