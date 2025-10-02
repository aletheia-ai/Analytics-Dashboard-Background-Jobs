import { PeopleCountingType } from "./person-counting-type";
import { RangeType } from "./range-type";
import { StoreType } from "./store-type";

export interface StatsType {
  store: StoreType | string;
  cameraId: string;
  range: RangeType;
  data: PeopleCountingType;
}
