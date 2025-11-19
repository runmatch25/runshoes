"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type DistanceUnit = "kilometers" | "miles";
type WeightUnit = "kg" | "lbs";

const KM_PER_MILE = 1.60934;
const MI_PER_KM = 0.621371;
const KG_PER_LB = 0.453592;
const LB_PER_KG = 2.20462;

type UnitPreferencesContextValue = {
  distanceUnit: DistanceUnit;
  weightUnit: WeightUnit;
  toggleDistanceUnit: () => void;
  toggleWeightUnit: () => void;
  distanceLabel: "km" | "mi";
  weightLabel: "kg" | "lbs";
  toDisplayDistance: (valueInKm?: number | null) => number | null;
  toBaseDistance: (valueInDisplay: number) => number;
  formatDistance: (valueInKm?: number | null, precision?: number) => string | null;
  toDisplayWeight: (valueInKg?: number | null) => number | null;
  toBaseWeight: (valueInDisplay: number) => number;
  formatWeight: (valueInKg?: number | null, precision?: number) => string | null;
  toDisplayPace: (pace: { minutes?: number | null; seconds?: number | null }) => {
    minutes: number;
    seconds: number;
  } | null;
  toBasePace: (pace: { minutes?: number | null; seconds?: number | null }) => {
    minutes: number;
    seconds: number;
  } | null;
  formatPace: (pace: { minutes?: number | null; seconds?: number | null }) => string | null;
};

const UnitPreferencesContext = createContext<UnitPreferencesContextValue | undefined>(undefined);

const STORAGE_DISTANCE_KEY = "runshoes:distanceUnit";
const STORAGE_WEIGHT_KEY = "runshoes:weightUnit";

function clampSeconds(seconds: number) {
  const rounded = Math.round(seconds);
  if (rounded === 60) {
    return { minutesCarry: 1, seconds: 0 };
  }
  return { minutesCarry: 0, seconds: Math.max(0, rounded) };
}

export function UnitPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("kilometers");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const isInitialised = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || isInitialised.current) return;

    const storedDistance = window.localStorage.getItem(STORAGE_DISTANCE_KEY);
    const storedWeight = window.localStorage.getItem(STORAGE_WEIGHT_KEY);

    if (storedDistance === "kilometers" || storedDistance === "miles") {
      setDistanceUnit(storedDistance);
    }
    if (storedWeight === "kg" || storedWeight === "lbs") {
      setWeightUnit(storedWeight);
    }

    isInitialised.current = true;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_DISTANCE_KEY, distanceUnit);
  }, [distanceUnit]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_WEIGHT_KEY, weightUnit);
  }, [weightUnit]);

  const toDisplayDistance = useCallback(
    (valueInKm?: number | null) => {
      if (valueInKm === null || valueInKm === undefined || Number.isNaN(valueInKm)) return null;
      return distanceUnit === "kilometers" ? valueInKm : valueInKm * MI_PER_KM;
    },
    [distanceUnit],
  );

  const toBaseDistance = useCallback(
    (valueInDisplay: number) => {
      return distanceUnit === "kilometers" ? valueInDisplay : valueInDisplay * KM_PER_MILE;
    },
    [distanceUnit],
  );

  const formatDistance = useCallback(
    (valueInKm?: number | null, precision?: number) => {
      const converted = toDisplayDistance(valueInKm);
      if (converted === null) return null;
      const resolvedPrecision = precision !== undefined ? precision : 0;
      return `${converted.toFixed(resolvedPrecision)} ${
        distanceUnit === "kilometers" ? "km" : "mi"
      }`;
    },
    [distanceUnit, toDisplayDistance],
  );

  const toDisplayWeight = useCallback(
    (valueInKg?: number | null) => {
      if (valueInKg === null || valueInKg === undefined || Number.isNaN(valueInKg)) return null;
      return weightUnit === "kg" ? valueInKg : valueInKg * LB_PER_KG;
    },
    [weightUnit],
  );

  const toBaseWeight = useCallback(
    (valueInDisplay: number) => {
      return weightUnit === "kg" ? valueInDisplay : valueInDisplay * KG_PER_LB;
    },
    [weightUnit],
  );

  const formatWeight = useCallback(
    (valueInKg?: number | null, precision?: number) => {
      const converted = toDisplayWeight(valueInKg);
      if (converted === null) return null;
      const label = weightUnit === "kg" ? "kg" : "lbs";
      const resolvedPrecision = precision !== undefined ? precision : 0;
      return `${converted.toFixed(resolvedPrecision)} ${label}`;
    },
    [toDisplayWeight, weightUnit],
  );

  const toDisplayPace = useCallback(
    ({ minutes, seconds }: { minutes?: number | null; seconds?: number | null }) => {
      if (
        minutes === null ||
        minutes === undefined ||
        seconds === null ||
        seconds === undefined
      ) {
        return null;
      }

      const totalSeconds = minutes * 60 + seconds;
      if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
        return null;
      }

      if (distanceUnit === "kilometers") {
        return { minutes, seconds };
      }

      const totalDisplaySeconds = totalSeconds * KM_PER_MILE;
      let displayMinutes = Math.floor(totalDisplaySeconds / 60);
      const { minutesCarry, seconds: clampedSeconds } = clampSeconds(totalDisplaySeconds % 60);
      displayMinutes += minutesCarry;
      return { minutes: displayMinutes, seconds: clampedSeconds };
    },
    [distanceUnit],
  );

  const toBasePace = useCallback(
    ({ minutes, seconds }: { minutes?: number | null; seconds?: number | null }) => {
      if (
        minutes === null ||
        minutes === undefined ||
        seconds === null ||
        seconds === undefined
      ) {
        return null;
      }

      const totalSeconds = minutes * 60 + seconds;
      if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
        return null;
      }

      if (distanceUnit === "kilometers") {
        return { minutes, seconds };
      }

      const baseSeconds = totalSeconds / KM_PER_MILE;
      let baseMinutes = Math.floor(baseSeconds / 60);
      const { minutesCarry, seconds: clampedSeconds } = clampSeconds(baseSeconds % 60);
      baseMinutes += minutesCarry;
      return { minutes: baseMinutes, seconds: clampedSeconds };
    },
    [distanceUnit],
  );

  const formatPace = useCallback(
    ({ minutes, seconds }: { minutes?: number | null; seconds?: number | null }) => {
      const display = toDisplayPace({ minutes, seconds });
      if (!display) return null;
      const paddedSeconds = display.seconds.toString().padStart(2, "0");
      const unitLabel = distanceUnit === "kilometers" ? "km" : "mi";
      return `${display.minutes}m ${paddedSeconds}s / ${unitLabel}`;
    },
    [distanceUnit, toDisplayPace],
  );

  const value = useMemo<UnitPreferencesContextValue>(
    () => ({
      distanceUnit,
      weightUnit,
      toggleDistanceUnit: () =>
        setDistanceUnit((unit) => (unit === "kilometers" ? "miles" : "kilometers")),
      toggleWeightUnit: () => setWeightUnit((unit) => (unit === "kg" ? "lbs" : "kg")),
      distanceLabel: distanceUnit === "kilometers" ? "km" : "mi",
      weightLabel: weightUnit === "kg" ? "kg" : "lbs",
      toDisplayDistance,
      toBaseDistance,
      formatDistance,
      toDisplayWeight,
      toBaseWeight,
      formatWeight,
      toDisplayPace,
      toBasePace,
      formatPace,
    }),
    [
      distanceUnit,
      weightUnit,
      toDisplayDistance,
      toBaseDistance,
      formatDistance,
      toDisplayWeight,
      toBaseWeight,
      formatWeight,
      toDisplayPace,
      toBasePace,
      formatPace,
    ],
  );

  return (
    <UnitPreferencesContext.Provider value={value}>
      {children}
    </UnitPreferencesContext.Provider>
  );
}

export function useUnitPreferences() {
  const context = useContext(UnitPreferencesContext);
  if (!context) {
    throw new Error("useUnitPreferences must be used within a UnitPreferencesProvider");
  }
  return context;
}

