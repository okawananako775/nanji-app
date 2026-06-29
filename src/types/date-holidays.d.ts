declare module "date-holidays" {
  type HolidayType = "public" | "bank" | "optional" | "school" | "observance";

  interface HolidayEntry {
    type: HolidayType;
    name: string;
  }

  export default class Holidays {
    constructor(country?: string, state?: string, region?: string);
    setTimezone(timezone: string): this;
    isHoliday(date: Date | string): false | HolidayEntry[];
  }
}
