import { tmdbImageUrl, type WatchProvider } from "@/lib/tmdb";
import { buildWatchProviderUrl } from "@/lib/watchProviderLinks";

export function WatchProviders({
  providers,
  seriesTitle,
}: {
  providers: WatchProvider[];
  seriesTitle: string;
}) {
  if (providers.length === 0) return null;

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
              href={buildWatchProviderUrl(p.providerName, seriesTitle)}
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
