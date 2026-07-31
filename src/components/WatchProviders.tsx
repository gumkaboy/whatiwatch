import { tmdbImageUrl, type WatchProvider } from "@/lib/tmdb";

function buildProviderHref(providerName: string, watchPageUrl: string, kinopoiskId: number | null) {
  // для Кинопоиска у нас есть точный ID (сверен по IMDb ID через их API),
  // поэтому ведём сразу на карточку тайтла, а не на промежуточную страницу TMDb
  if (kinopoiskId !== null && /kinopoisk/i.test(providerName)) {
    return `https://www.kinopoisk.ru/film/${kinopoiskId}/`;
  }
  return watchPageUrl;
}

export function WatchProviders({
  providers,
  watchPageUrl,
  kinopoiskId,
}: {
  providers: WatchProvider[];
  watchPageUrl: string | null;
  kinopoiskId: number | null;
}) {
  if (providers.length === 0 || !watchPageUrl) return null;

  return (
    <div className="watch-providers">
      <span className="watch-providers-label">Смотреть</span>
      <div className="watch-providers-row">
        {providers.map((p) => {
          const logo = tmdbImageUrl(p.logoPath, "w92");
          if (!logo) return null;
          return (
            <a
              key={p.providerId}
              href={buildProviderHref(p.providerName, watchPageUrl, kinopoiskId)}
              target="_blank"
              rel="noopener noreferrer"
              className="watch-provider-icon"
              title={p.providerName}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={p.providerName} />
            </a>
          );
        })}
      </div>
      <span className="watch-providers-attribution">Данные: JustWatch</span>
    </div>
  );
}
