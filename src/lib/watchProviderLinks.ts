const PROVIDER_LINKS: { match: RegExp; url: (title: string) => string }[] = [
  { match: /netflix/i, url: (t) => `https://www.netflix.com/search?q=${enc(t)}` },
  { match: /amazon (prime video|video)/i, url: (t) => `https://www.amazon.com/gp/video/search?phrase=${enc(t)}` },
  { match: /apple tv/i, url: (t) => `https://tv.apple.com/search?term=${enc(t)}` },
  { match: /hbo max|^max$/i, url: (t) => `https://www.max.com/search?q=${enc(t)}` },
  { match: /hulu/i, url: (t) => `https://www.hulu.com/search?q=${enc(t)}` },
  { match: /disney/i, url: (t) => `https://www.disneyplus.com/search?q=${enc(t)}` },
  { match: /peacock/i, url: (t) => `https://www.peacocktv.com/search?q=${enc(t)}` },
  { match: /google play/i, url: (t) => `https://play.google.com/store/search?q=${enc(t)}&c=movies` },
  { match: /youtube/i, url: (t) => `https://www.youtube.com/results?search_query=${enc(t)}` },
  { match: /okko/i, url: (t) => `https://okko.tv/search?query=${enc(t)}` },
  { match: /amediateka/i, url: (t) => `https://amediateka.ru/search?query=${enc(t)}` },
  { match: /kinopoisk/i, url: (t) => `https://www.kinopoisk.ru/index.php?kp_query=${enc(t)}` },
  { match: /\bivi\b/i, url: (t) => `https://www.ivi.ru/search?q=${enc(t)}` },
  { match: /wink/i, url: (t) => `https://wink.rt.ru/search/?query=${enc(t)}` },
  { match: /\bstart\b/i, url: (t) => `https://start.ru/search?query=${enc(t)}` },
  { match: /megogo/i, url: (t) => `https://megogo.net/ru/search?query=${enc(t)}` },
  { match: /more\.?\s?tv/i, url: (t) => `https://more.tv/search?query=${enc(t)}` },
  { match: /tvigle/i, url: (t) => `https://tvigle.ru/search/?text=${enc(t)}` },
  { match: /fandango/i, url: (t) => `https://www.fandangoathome.com/search/${enc(t)}` },
];

function enc(value: string) {
  return encodeURIComponent(value);
}

export function buildWatchProviderUrl(providerName: string, seriesTitle: string) {
  const found = PROVIDER_LINKS.find((p) => p.match.test(providerName));
  if (found) return found.url(seriesTitle);
  return `https://www.google.com/search?q=${enc(`смотреть ${providerName} ${seriesTitle}`)}`;
}
