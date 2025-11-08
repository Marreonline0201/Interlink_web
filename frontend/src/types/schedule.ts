export type FreeTimeSlot = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
};

export type SerializedFreeTimeSlot = Omit<FreeTimeSlot, "start" | "end"> & {
  start: string;
  end: string;
};

