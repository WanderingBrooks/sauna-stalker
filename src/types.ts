type Slot = {
  isAvailable: boolean;
  time: string;
};

type Day = Slot[];

type Week = 'thisWeek' | 'nextWeek';

type AvailableSlots = Partial<Record<number, Slot[]>>;

export type { Slot, Day, Week, AvailableSlots };
