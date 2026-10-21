export interface HaReadState<T> {
  data: T | null;
  lastUpdated: number | null;
}

export type HaReadEvent<T> =
  | { type: "success"; data: T; now: number }
  | { type: "failure" }
  | { type: "clear" };

export interface HaReadResult<T> {
  data: T | null;
  lastUpdated: number | null;
  isStale: boolean;
  error: string | null;
  isLoading: boolean;
  /** Success is the only transition that may be written to the widget cache. */
  persist: boolean;
}

export function reduceHaRead<T>(state: HaReadState<T>, event: HaReadEvent<T>): HaReadResult<T> {
  if (event.type === "clear") {
    return {
      data: null,
      lastUpdated: null,
      isStale: false,
      error: null,
      isLoading: false,
      persist: false,
    };
  }
  if (event.type === "failure") {
    return {
      data: state.data,
      lastUpdated: state.lastUpdated,
      isStale: state.data != null,
      error: null,
      isLoading: false,
      persist: false,
    };
  }
  return {
    data: event.data,
    lastUpdated: event.now,
    isStale: false,
    error: null,
    isLoading: false,
    persist: true,
  };
}

export interface EntityCacheRecord<T> {
  id: string;
  value: T;
}

export function packEntityList<T>(ids: string[], values: T[]): EntityCacheRecord<T>[] {
  return ids
    .map((id, index) => ({ id, value: values[index] }))
    .filter((record) => record.value != null)
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function unpackEntityList<T>(ids: string[], records: EntityCacheRecord<T>[]): T[] {
  const byId = new Map(records.map((record) => [record.id, record.value]));
  return ids.flatMap((id) => {
    const value = byId.get(id);
    return value == null ? [] : [value];
  });
}
