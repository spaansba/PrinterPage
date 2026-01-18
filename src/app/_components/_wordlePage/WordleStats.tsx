"use client";

type Stats = {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<string, number>;
};

type WordleStatsProps = {
  stats: Stats;
};

function WordleStats({ stats }: WordleStatsProps) {
  const winPercentage =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  // Find max value for distribution bar scaling
  const maxDistribution = Math.max(
    ...Object.values(stats.guessDistribution),
    1,
  );

  return (
    <div className="border-t border-gray-300 pt-2 mt-1">
      <div className="text-xs font-medium text-gray-700 mb-2">Statistics</div>

      {/* Stats row */}
      <div className="flex justify-around text-center mb-3">
        <div>
          <div className="text-lg font-bold">{stats.gamesPlayed}</div>
          <div className="text-[10px] text-gray-500">Played</div>
        </div>
        <div>
          <div className="text-lg font-bold">{winPercentage}</div>
          <div className="text-[10px] text-gray-500">Win %</div>
        </div>
        <div>
          <div className="text-lg font-bold">{stats.currentStreak}</div>
          <div className="text-[10px] text-gray-500">Streak</div>
        </div>
        <div>
          <div className="text-lg font-bold">{stats.maxStreak}</div>
          <div className="text-[10px] text-gray-500">Best</div>
        </div>
      </div>

      {/* Distribution */}
      {stats.gamesPlayed > 0 && (
        <div>
          <div className="text-[10px] text-gray-500 mb-1">Guess Distribution</div>
          <div className="flex flex-col gap-[2px]">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const count = stats.guessDistribution[String(num)] || 0;
              const width = Math.max((count / maxDistribution) * 100, 8);

              return (
                <div key={num} className="flex items-center gap-1">
                  <span className="text-[10px] w-3 text-gray-500">{num}</span>
                  <div
                    className="bg-gray-400 text-white text-[10px] px-1 min-w-[16px] text-right"
                    style={{ width: `${width}%` }}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default WordleStats;
