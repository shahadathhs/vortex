/**
 * Date filter presets for list/analytics queries.
 * Maps preset names to { from, to } date ranges.
 */

export const DateFilterPreset = {
  TODAY: 'TODAY',
  THIS_WEEK: 'THIS_WEEK',
  LAST_WEEK: 'LAST_WEEK',
  THIS_MONTH: 'THIS_MONTH',
  LAST_MONTH: 'LAST_MONTH',
  LAST_7_DAYS: 'LAST_7_DAYS',
  LAST_15_DAYS: 'LAST_15_DAYS',
  LAST_30_DAYS: 'LAST_30_DAYS',
  ALL: 'ALL',
} as const;

export type DateFilterPresetType =
  (typeof DateFilterPreset)[keyof typeof DateFilterPreset];

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}

function endOfDay(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(23, 59, 59, 999);
  return out;
}

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const day = out.getUTCDay();
  const diff = out.getUTCDate() - day + (day === 0 ? -6 : 1);
  out.setUTCDate(diff);
  return startOfDay(out);
}

function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const out = new Date(start);
  out.setUTCDate(out.getUTCDate() + 6);
  return endOfDay(out);
}

function startOfMonth(d: Date): Date {
  const out = new Date(d);
  out.setUTCDate(1);
  return startOfDay(out);
}

function endOfMonth(d: Date): Date {
  const out = new Date(d);
  out.setUTCMonth(out.getUTCMonth() + 1, 0);
  return endOfDay(out);
}

/**
 * Returns { from, to } for a preset, or null for ALL (no date filter).
 */
export function getDateRangeFromPreset(
  preset: string,
): { from: Date; to: Date } | null {
  if (!preset || preset === DateFilterPreset.ALL) {
    return null;
  }

  const now = new Date();

  switch (preset) {
    case DateFilterPreset.TODAY:
      return { from: startOfDay(now), to: endOfDay(now) };

    case DateFilterPreset.THIS_WEEK:
      return { from: startOfWeek(now), to: endOfWeek(now) };

    case DateFilterPreset.LAST_WEEK: {
      const lastWeek = new Date(now);
      lastWeek.setUTCDate(lastWeek.getUTCDate() - 7);
      return {
        from: startOfWeek(lastWeek),
        to: endOfWeek(lastWeek),
      };
    }

    case DateFilterPreset.THIS_MONTH:
      return { from: startOfMonth(now), to: endOfMonth(now) };

    case DateFilterPreset.LAST_MONTH: {
      const lastMonth = new Date(now);
      lastMonth.setUTCMonth(lastMonth.getUTCMonth() - 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    }

    case DateFilterPreset.LAST_7_DAYS: {
      const from = new Date(now);
      from.setUTCDate(from.getUTCDate() - 6);
      return { from: startOfDay(from), to: endOfDay(now) };
    }

    case DateFilterPreset.LAST_15_DAYS: {
      const from = new Date(now);
      from.setUTCDate(from.getUTCDate() - 14);
      return { from: startOfDay(from), to: endOfDay(now) };
    }

    case DateFilterPreset.LAST_30_DAYS: {
      const from = new Date(now);
      from.setUTCDate(from.getUTCDate() - 29);
      return { from: startOfDay(from), to: endOfDay(now) };
    }

    default:
      return null;
  }
}
