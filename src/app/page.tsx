import Link from "next/link";
import { getPopularSeries } from "@/lib/tmdb";
import { auth } from "@/lib/auth";
import { PosterTile } from "@/components/PosterTile";

const LANES = [
  { left: "1%", width: 110, duration: 22, delay: -2 },
  { left: "9%", width: 90, duration: 18, delay: -9 },
  { left: "17%", width: 130, duration: 26, delay: -4 },
  { left: "25%", width: 100, duration: 20, delay: -14 },
  { left: "33%", width: 115, duration: 24, delay: -7 },
  { left: "41%", width: 95, duration: 19, delay: -1 },
  { left: "49%", width: 120, duration: 23, delay: -11 },
  { left: "57%", width: 100, duration: 17, delay: -5 },
  { left: "65%", width: 130, duration: 25, delay: -16 },
  { left: "73%", width: 95, duration: 21, delay: -3 },
  { left: "81%", width: 115, duration: 19, delay: -12 },
  { left: "89%", width: 105, duration: 23, delay: -8 },
] as const;

const ROTATIONS = [-8, 6, -5, 4, -6, 5, -4, 7] as const;

export default async function HomePage() {
  const [session, popular] = await Promise.all([
    auth(),
    getPopularSeries().catch(() => null),
  ]);

  const posters = popular?.results ?? [];

  return (
    <div className="landing-wrap">
      <div className="landing-scatter">
        {posters.length > 0 &&
          LANES.map((lane, laneIndex) => (
            <div
              key={laneIndex}
              className="poster-lane"
              style={{
                left: lane.left,
                animationDuration: `${lane.duration}s`,
                animationDelay: `${lane.delay}s`,
              }}
            >
              {[0, 1, 2].map((slot) => {
                const series = posters[(laneIndex * 3 + slot) % posters.length];
                const rotate = ROTATIONS[(laneIndex * 3 + slot) % ROTATIONS.length];
                return (
                  <PosterTile
                    key={slot}
                    tmdbId={series.id}
                    name={series.name}
                    posterPath={series.poster_path}
                    style={
                      {
                        width: lane.width,
                        "--rotate": `${rotate}deg`,
                      } as React.CSSProperties
                    }
                  />
                );
              })}
            </div>
          ))}

        <div className="landing-center">
          <h1>Series Tracker</h1>
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
