function pluralRu(n: number, one: string, few: string, many: string): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return few;
  return many;
}

export function LibraryStats({
  seriesCount,
  episodesCount,
  hours,
  days,
}: {
  seriesCount: number;
  episodesCount: number;
  hours: number;
  days: number;
}) {
  const stats = [
    { value: seriesCount, label: pluralRu(seriesCount, "сериал", "сериала", "сериалов") },
    { value: episodesCount, label: pluralRu(episodesCount, "серия", "серии", "серий") },
    { value: hours, label: pluralRu(hours, "час", "часа", "часов") },
    { value: days, label: pluralRu(days, "день", "дня", "дней") },
  ];

  return (
    <div className="library-stats">
      {stats.map((s) => (
        <div key={s.label} className="library-stat-circle">
          <span className="library-stat-value">{s.value}</span>
          <span className="library-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
