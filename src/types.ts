export type dbPuttResult = {
  distance: number;
  isMade: number; // TINYINT(1)
  isUndone: number; // TINYINT(1)
  name: string;
  puttResultId: number;
  puttTimestamp: Date;
  userId: number;
};

export type apiPuttResult = {
  distance: number;
  isMade: boolean; // Converted to boolean
  isUndone: boolean; // Converted to boolean
  name: string;
  puttResultId: number;
  puttTimestamp: Date;
  userId: number;
};
