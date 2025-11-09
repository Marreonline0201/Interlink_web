// Simplified affinity utilities focusing solely on schedule overlap.

const buildAffinityContext = ({ candidates = [] }) => ({
  candidateAffinities: new Map(
    candidates.map((candidate) => [
      candidate.id,
      {
        candidate,
        clusterIndex: 0,
        clusterId: "cluster-1",
        similarity: 0,
        sharedHobbies: [],
        sharedInterests: [],
        sameMajor: false,
        traitHighlights: [],
      },
    ])
  ),
  getClusterLabel() {
    return "Schedule Match";
  },
});

const buildCompatibilitySummary = ({ scheduleMinutes }) =>
  `${Math.round(scheduleMinutes)} shared minutes available`;

const computeCompatibilityScore = ({
  overlapMinutes,
  minimumOverlapTarget = 60,
}) => {
  const ratio = Math.min(
    overlapMinutes / Math.max(minimumOverlapTarget, 1),
    2
  );
  const normalized = Math.min(ratio / 2, 1);
  const score = Math.round(Math.max(45, normalized * 100));

  return {
    score,
    breakdown: {
      schedule: Number(normalized.toFixed(3)),
      affinity: 0,
      hobbies: 0,
      interests: 0,
      majorBonus: 0,
    },
  };
};

const computeGroupCompatibility = ({
  overlapMinutes,
  minimumOverlapTarget = 90,
}) => {
  const ratio = Math.min(
    overlapMinutes / Math.max(minimumOverlapTarget, 1),
    2
  );
  const normalized = Math.min(ratio / 2, 1);
  const score = Math.round(Math.max(45, normalized * 100));

  return {
    score,
    breakdown: {
      schedule: Number(normalized.toFixed(3)),
      affinity: 0,
      hobbies: 0,
      interests: 0,
      majorBonus: 0,
    },
    sharedHobbies: [],
    sharedInterests: [],
    summary: buildCompatibilitySummary({ scheduleMinutes: overlapMinutes }),
    clusterLabels: ["Schedule Match"],
  };
};

module.exports = {
  buildAffinityContext,
  computeCompatibilityScore,
  computeGroupCompatibility,
  buildCompatibilitySummary,
};

