import { Request } from "express";
import { apiPuttResult, dbPuttResult, PuttType } from "./types";

export const getUserIdFromPath = (request: Request): number | undefined => {
  const userId: number | undefined = request.params["userId"]
    ? parseInt(request.params["userId"].toString())
    : undefined;
  return userId;
};

// Need certain headers for all requests. This is done as a very low level security measure to prevent unwanted SQL calls to GCP.
export const checkHeaders = (request: any): boolean => {
  const throwDataHeaderValue = request?.headers?.throwdata;
  if (!throwDataHeaderValue) {
    console.log("No required header");
    return false;
  }
  return true;
};

export const mapDbPuttResultToApiPuttResult = (
  dbPuttResult: dbPuttResult
): apiPuttResult =>
  ({
    distance: dbPuttResult.distance,
    isMade: !!dbPuttResult.isMade,
    isUndone: !!dbPuttResult.isUndone,
    name: dbPuttResult.name,
    puttResultId: dbPuttResult.puttResultId,
    puttTimestamp: dbPuttResult.puttTimestamp,
    userId: dbPuttResult.userId,
    type: mapPuttTypeFromStringToEnum(dbPuttResult.type),
  } as apiPuttResult);

// Converts a putt type from a string to an enum
const mapPuttTypeFromStringToEnum = (typeString: string): PuttType => {
  const puttTypeEnum: PuttType = PuttType[typeString as keyof typeof PuttType];

  // If the string can't be cast to the enum, puttTypeEnum will be undefined and then Unknown type is returned.
  return puttTypeEnum ?? PuttType.Unknown;
};
