export const ENERGY_EMPTY_COPY = "Pick a power sensor and an energy sensor in settings.";
export const ENERGY_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

function finiteOrNull(value: number | null): number | null {
  return value !== null && Number.isFinite(value) ? value : null;
}

function unitOf(unit: string | null): string {
  return (unit ?? "").trim().toLowerCase();
}

/** Normalize a Home Assistant power reading to kW. */
export function normalizePowerKw(value: number | null, unit: string | null): number | null {
  const finite = finiteOrNull(value);
  if (finite === null) return null;
  switch (unitOf(unit)) {
    case "w":
      return finite / 1000;
    case "mw":
      return finite * 1000;
    case "kw":
    default:
      return finite;
  }
}

/** Human-readable "now" power; falls back to the raw unit when unrecognized. */
export function formatPower(value: number | null, unit: string | null): string {
  const finite = finiteOrNull(value);
  if (finite === null) return "—";
  const normalizedUnit = unitOf(unit);
  if (
    normalizedUnit === "w" ||
    normalizedUnit === "kw" ||
    normalizedUnit === "mw" ||
    !normalizedUnit
  ) {
    const kw = normalizePowerKw(finite, unit) ?? 0;
    return `${kw.toFixed(2)} kW`;
  }
  return `${finite.toFixed(1)} ${unit}`;
}

/** Normalize a Home Assistant energy reading to kWh. */
export function normalizeEnergyKwh(value: number | null, unit: string | null): number | null {
  const finite = finiteOrNull(value);
  if (finite === null) return null;
  switch (unitOf(unit)) {
    case "wh":
      return finite / 1000;
    case "mwh":
      return finite * 1000;
    case "kwh":
    default:
      return finite;
  }
}

/** Human-readable energy total; falls back to the raw unit when unrecognized. */
export function formatEnergy(value: number | null, unit: string | null): string {
  const finite = finiteOrNull(value);
  if (finite === null) return "—";
  const normalizedUnit = unitOf(unit);
  if (
    normalizedUnit === "wh" ||
    normalizedUnit === "kwh" ||
    normalizedUnit === "mwh" ||
    !normalizedUnit
  ) {
    const kwh = normalizeEnergyKwh(finite, unit) ?? 0;
    return `${kwh.toFixed(2)} kWh`;
  }
  return `${finite.toFixed(2)} ${unit}`;
}

/** Cost for a kWh total at a per-kWh rate; `null` when either input is unusable. */
export function calculateEnergyCost(kwh: number | null, ratePerKwh: number): number | null {
  if (kwh === null || !Number.isFinite(kwh) || !Number.isFinite(ratePerKwh) || ratePerKwh <= 0) {
    return null;
  }
  return kwh * ratePerKwh;
}

export function formatCost(cost: number | null): string {
  return cost === null ? "—" : `$${cost.toFixed(2)}`;
}
