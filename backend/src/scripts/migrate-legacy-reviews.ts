import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pace range definitions (matching ReviewWizard)
// Note: ">6:50/km" means slower than 6:50, so > 6:50
//       "<3:15/km" means faster than 3:15, so < 3:15
const paceRangeOptionsMetric = [
  {
    value: "pace-km-slower-than-6-50",
    label: ">6:50/km",
    minSeconds: 6 * 60 + 50 + 1, // > 6:50
    maxSeconds: Infinity,
  },
  {
    value: "pace-km-5-35-to-6-49",
    label: "5:35 – 6:49/km",
    minSeconds: 5 * 60 + 35,
    maxSeconds: 6 * 60 + 49,
  },
  {
    value: "pace-km-4-40-to-5-34",
    label: "4:40 – 5:34/km",
    minSeconds: 4 * 60 + 40,
    maxSeconds: 5 * 60 + 34,
  },
  {
    value: "pace-km-3-45-to-4-39",
    label: "3:45 – 4:39/km",
    minSeconds: 3 * 60 + 45,
    maxSeconds: 4 * 60 + 39,
  },
  {
    value: "pace-km-3-15-to-3-44",
    label: "3:15 – 3:44/km",
    minSeconds: 3 * 60 + 15,
    maxSeconds: 3 * 60 + 44,
  },
  {
    value: "pace-km-faster-than-3-15",
    label: "<3:15/km",
    minSeconds: 0,
    maxSeconds: 3 * 60 + 14, // < 3:15
  },
];

const paceRangeOptionsImperial = [
  {
    value: "pace-mile-slower-than-11",
    label: ">11:00/mile",
    minSeconds: 11 * 60 + 1, // > 11:00
    maxSeconds: Infinity,
  },
  {
    value: "pace-mile-9-31-to-10-59",
    label: "9:31 – 10:59/mile",
    minSeconds: 9 * 60 + 31,
    maxSeconds: 10 * 60 + 59,
  },
  {
    value: "pace-mile-8-01-to-9-30",
    label: "8:01 – 9:30/mile",
    minSeconds: 8 * 60 + 1,
    maxSeconds: 9 * 60 + 30,
  },
  {
    value: "pace-mile-6-31-to-8-00",
    label: "6:31 – 8:00/mile",
    minSeconds: 6 * 60 + 31,
    maxSeconds: 8 * 60 + 0,
  },
  {
    value: "pace-mile-5-51-to-6-30",
    label: "5:51 – 6:30/mile",
    minSeconds: 5 * 60 + 51,
    maxSeconds: 6 * 60 + 30,
  },
  {
    value: "pace-mile-faster-than-5-50",
    label: "<5:50/mile",
    minSeconds: 0,
    maxSeconds: 5 * 60 + 49, // < 5:50
  },
];

// Weight range definitions (matching ReviewWizard)
const weightRangeOptionsMetric = [
  {
    value: "weight-kg-under-60",
    label: "<60 kg",
    max: 59.9,
  },
  {
    value: "weight-kg-60-70",
    label: "60 – 70 kg",
    min: 60,
    max: 70,
  },
  {
    value: "weight-kg-70-80",
    label: "70 – 80 kg",
    min: 70,
    max: 80,
  },
  {
    value: "weight-kg-80-90",
    label: "80 – 90 kg",
    min: 80,
    max: 90,
  },
  {
    value: "weight-kg-90-100",
    label: "90 – 100 kg",
    min: 90,
    max: 100,
  },
  {
    value: "weight-kg-over-100",
    label: ">100 kg",
    min: 100.1,
  },
];

const weightRangeOptionsImperial = [
  {
    value: "weight-lbs-under-130",
    label: "<130 lbs",
    max: 129.9,
  },
  {
    value: "weight-lbs-130-150",
    label: "130 – 150 lbs",
    min: 130,
    max: 150,
  },
  {
    value: "weight-lbs-150-170",
    label: "150 – 170 lbs",
    min: 150,
    max: 170,
  },
  {
    value: "weight-lbs-170-190",
    label: "170 – 190 lbs",
    min: 170,
    max: 190,
  },
  {
    value: "weight-lbs-190-210",
    label: "190 – 210 lbs",
    min: 190,
    max: 210,
  },
  {
    value: "weight-lbs-over-210",
    label: ">210 lbs",
    min: 210.1,
  },
];

const KM_PER_MILE = 1.60934;

// Convert pace from min/km (base) to min/mile
function paceKmToMile(minutes: number, seconds: number): { minutes: number; seconds: number } {
  const totalSeconds = minutes * 60 + seconds;
  const mileSeconds = totalSeconds * KM_PER_MILE;
  const mileMinutes = Math.floor(mileSeconds / 60);
  const mileSecs = Math.round(mileSeconds % 60);
  return { minutes: mileMinutes, seconds: mileSecs >= 60 ? 0 : mileSecs };
}

// Convert weight from kg (base) to lbs
function weightKgToLbs(kg: number): number {
  return kg * 2.20462;
}

// Find matching pace range
function findPaceRange(minutes: number, seconds: number): string | null {
  const totalSeconds = minutes * 60 + seconds;

  // Try metric ranges first (since stored value is in min/km)
  for (const range of paceRangeOptionsMetric) {
    if (totalSeconds >= range.minSeconds && totalSeconds <= range.maxSeconds) {
      return range.value;
    }
  }

  // If not in metric ranges, try imperial (maybe user entered in miles)
  const milePace = paceKmToMile(minutes, seconds);
  const mileTotalSeconds = milePace.minutes * 60 + milePace.seconds;

  for (const range of paceRangeOptionsImperial) {
    if (mileTotalSeconds >= range.minSeconds && mileTotalSeconds <= range.maxSeconds) {
      return range.value;
    }
  }

  // Default to closest metric range
  if (totalSeconds > 6 * 60 + 50) {
    return "pace-km-slower-than-6-50";
  }
  if (totalSeconds < 3 * 60 + 15) {
    return "pace-km-faster-than-3-15";
  }
  return "pace-km-4-40-to-5-34"; // default middle range
}

// Find matching weight range
function findWeightRange(weightKg: number): string | null {
  // Try metric ranges first (since stored value is in kg)
  for (const range of weightRangeOptionsMetric) {
    if (range.min !== undefined && range.max !== undefined) {
      if (weightKg >= range.min && weightKg <= range.max) {
        return range.value;
      }
    } else if (range.max !== undefined) {
      if (weightKg < range.max) {
        return range.value;
      }
    } else if (range.min !== undefined) {
      if (weightKg >= range.min) {
        return range.value;
      }
    }
  }

  // If not in metric ranges, try imperial (maybe user entered in lbs)
  const weightLbs = weightKgToLbs(weightKg);
  for (const range of weightRangeOptionsImperial) {
    if (range.min !== undefined && range.max !== undefined) {
      if (weightLbs >= range.min && weightLbs <= range.max) {
        return range.value;
      }
    } else if (range.max !== undefined) {
      if (weightLbs < range.max) {
        return range.value;
      }
    } else if (range.min !== undefined) {
      if (weightLbs >= range.min) {
        return range.value;
      }
    }
  }

  // Default to closest metric range
  if (weightKg < 60) {
    return "weight-kg-under-60";
  }
  if (weightKg > 100) {
    return "weight-kg-over-100";
  }
  return "weight-kg-70-80"; // default middle range
}

async function migrateLegacyReviews() {
  console.log('Starting migration of legacy reviews...');

  // Find all reviews that have legacy values but no ranges
  const reviews = await prisma.review.findMany({
    where: {
      OR: [
        { paceMinutes: { not: null }, paceRange: null },
        { weight: { not: null }, weightRange: null },
      ],
    },
  });

  console.log(`Found ${reviews.length} reviews to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (const review of reviews) {
    let paceRange: string | null = review.paceRange;
    let weightRange: string | null = review.weightRange;

    // Migrate pace
    if (!paceRange && review.paceMinutes !== null && review.paceSeconds !== null) {
      paceRange = findPaceRange(review.paceMinutes, review.paceSeconds);
      console.log(
        `  Review ${review.id}: Pace ${review.paceMinutes}:${review.paceSeconds
          .toString()
          .padStart(2, '0')} -> ${paceRange}`,
      );
    }

    // Migrate weight
    if (!weightRange && review.weight !== null) {
      weightRange = findWeightRange(review.weight);
      console.log(`  Review ${review.id}: Weight ${review.weight}kg -> ${weightRange}`);
    }

    // Only update if we have changes
    if (paceRange !== review.paceRange || weightRange !== review.weightRange) {
      await prisma.review.update({
        where: { id: review.id },
        data: {
          paceRange: paceRange || undefined,
          weightRange: weightRange || undefined,
        },
      });
      migrated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`  Migrated: ${migrated} reviews`);
  console.log(`  Skipped: ${skipped} reviews`);
}

migrateLegacyReviews()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

