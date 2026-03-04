import { z } from 'zod';

import { DateFilterPreset } from '../utils/date-filters';

const presetValues = [
  DateFilterPreset.TODAY,
  DateFilterPreset.THIS_WEEK,
  DateFilterPreset.LAST_WEEK,
  DateFilterPreset.THIS_MONTH,
  DateFilterPreset.LAST_MONTH,
  DateFilterPreset.LAST_7_DAYS,
  DateFilterPreset.LAST_15_DAYS,
  DateFilterPreset.LAST_30_DAYS,
  DateFilterPreset.ALL,
] as const;

export const dateFilterPresetSchema = z.enum(presetValues).optional();
