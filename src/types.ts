export type dbPuttResult = {
  distance: number;
  isMade: number; // TINYINT(1)
  isUndone: number; // TINYINT(1)
  name: string;
  puttResultId: number;
  puttTimestamp: string; // Date, but returned as a string from the database
  userId: number;
};

export type apiPuttResult = {
  distance: number;
  isMade: boolean; // Converted to boolean
  isUndone: boolean; // Converted to boolean
  name: string;
  puttResultId: number;
  puttTimestamp: string;
  userId: number;
};

export type newPuttInsert = {
  distance: number;
  isMade: boolean;
  userId: number;
};
