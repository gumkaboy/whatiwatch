function enc(value: string) {
  return encodeURIComponent(value);
}

// проверенные, реально рабочие поисковые URL самих сервисов
const VERIFIED_SEARCH_LINKS: { match: RegExp; url: (title: string) => string }[] = [
  { match: /netflix/i, url: (t) => `https://www.netflix.com/search?q=${enc(t)}` },
  { match: /youtube/i, url: (t) => `https://www.youtube.com/results?search_query=${enc(t)}` },
  { match: /google play/i, url: (t) => `https://play.google.com/store/search?q=${enc(t)}&c=movies` },
];

// остальные сервисы — у их внутреннего поиска непредсказуемый формат (проверено
// на Okko: угаданный /search?query= ничего не находит даже для существующих
// в их каталоге тайтлов), поэтому используем поиск Google с ограничением по
// домену сервиса — работает независимо от того, как устроен поиск на сайте
const PROVIDER_DOMAINS: { match: RegExp; domain: string }[] = [
  { match: /amazon (prime video|video)/i, domain: "amazon.com" },
  { match: /apple tv/i, domain: "tv.apple.com" },
  { match: /hbo max|^max$/i, domain: "max.com" },
  { match: /hulu/i, domain: "hulu.com" },
  { match: /disney/i, domain: "disneyplus.com" },
  { match: /peacock/i, domain: "peacocktv.com" },
  { match: /okko/i, domain: "okko.tv" },
  { match: /amediateka/i, domain: "amediateka.ru" },
  { match: /kinopoisk/i, domain: "kinopoisk.ru" },
  { match: /\bivi\b/i, domain: "ivi.ru" },
  { match: /wink/i, domain: "wink.rt.ru" },
  { match: /\bstart\b/i, domain: "start.ru" },
  { match: /megogo/i, domain: "megogo.net" },
  { match: /more\.?\s?tv/i, domain: "more.tv" },
  { match: /tvigle/i, domain: "tvigle.ru" },
  { match: /fandango/i, domain: "fandangoathome.com" },
];

export function buildWatchProviderUrl(providerName: string, seriesTitle: string) {
  const verified = VERIFIED_SEARCH_LINKS.find((p) => p.match.test(providerName));
  if (verified) return verified.url(seriesTitle);

  const domain = PROVIDER_DOMAINS.find((p) => p.match.test(providerName));
  if (domain) {
    return `https://www.google.com/search?q=${enc(`site:${domain.domain} ${seriesTitle}`)}`;
  }

  return `https://www.google.com/search?q=${enc(`смотреть ${providerName} ${seriesTitle}`)}`;
}
