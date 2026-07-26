import Link from "next/link";
import { auth } from "@/lib/auth";
import { PosterTile } from "@/components/PosterTile";
import { CURATED_SERIES } from "@/lib/curatedSeries";

const LANE_COUNT = 7;
const TILES_PER_LANE = 5;
// у всех дорожек одна и та же скорость — иначе кладка постепенно "расползается",
// т.к. колонки со временем сбиваются друг относительно друга
const LANE_DURATION = 42;

// настоящая кирпичная кладка — это чередование ДВУХ смещений через колонку
// (0 и пол-плитки), а не постоянно нарастающий сдвиг (иначе выходит лестница)
const HALF_TILE_DELAY = -LANE_DURATION / TILES_PER_LANE / 2;

const LANES = Array.from({ length: LANE_COUNT }, (_, i) => ({
  duration: LANE_DURATION,
  delay: i % 2 === 0 ? 0 : HALF_TILE_DELAY,
}));

export default async function HomePage() {
  const session = await auth();
  const posters = CURATED_SERIES;

  return (
    <div className="landing-wrap">
      <div className="landing-scatter">
        {posters.length > 0 &&
          LANES.map((lane, laneIndex) => {
            // рендерим последовательность дважды подряд и крутим её ровно на
            // половину высоты — тогда цикл анимации бесшовный, без "пустых" фаз
            const tiles = Array.from({ length: TILES_PER_LANE * 2 }, (_, slot) => {
              const series =
                posters[(laneIndex * TILES_PER_LANE + (slot % TILES_PER_LANE)) % posters.length];
              return { series, key: slot };
            });

            return (
              <div key={laneIndex} className="poster-lane-outer">
                <div
                  className="poster-lane"
                  style={{
                    animationDuration: `${lane.duration}s`,
                    animationDelay: `${lane.delay}s`,
                  }}
                >
                  {tiles.map(({ series, key }) => (
                    <PosterTile
                      key={key}
                      tmdbId={series.id}
                      name={series.name}
                      posterPath={series.posterPath}
                    />
                  ))}
                </div>
              </div>
            );
          })}

        <div className="landing-center">
          <h1 className="brand-title">
            w
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/free-png.png" alt="i" className="brand-icon" />
            w
          </h1>
          <p>Личный трекер сериалов: что смотрите, что посмотрели, что в планах.</p>

          <div className="landing-auth-card">
            {session?.user ? (
              <>
                <p>С возвращением, {session.user.name}!</p>
                <div className="landing-auth-buttons">
                  <Link href="/library" className="primary">
                    Перейти в библиотеку
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p>Добро пожаловать</p>
                <div className="landing-auth-buttons">
                  <Link href="/login">Войти</Link>
                  <Link href="/register" className="primary">
                    Зарегистрироваться бесплатно
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
