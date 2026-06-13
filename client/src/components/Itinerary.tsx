import { Itinerary, Stop } from '../lib/api';

const TAG_ICON: Record<string, string> = {
  hiking: '🥾', sports_watch: '🏟️', sports_play: '⚽', concerts: '🎶', museums: '🖼️',
  tours: '🧳', nightlife: '🍸', shopping: '🛍️', movies: '🎬', arcade: '🕹️', wellness: '💆',
  water: '🚣', comedy: '🎤', classes: '🎨', animals: '🐾', thrill: '🎢',
  italian: '🍝', mexican: '🌮', japanese: '🍣', chinese: '🥡', thai: '🍜', indian: '🍛',
  korean: '🍲', mediterranean: '🥙', american: '🍔', seafood: '🦞', vegetarian_food: '🥗',
  cafe: '☕', dessert: '🍰', breweries: '🍻',
};

function stopIcon(stop: Stop) {
  for (const t of stop.tags) if (TAG_ICON[t]) return TAG_ICON[t];
  return stop.kind === 'food' ? '🍽️' : '🎟️';
}

function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export function ItineraryView({ it }: { it: Itinerary }) {
  return (
    <div>
      <div className="summary-strip">
        <div className="stat">
          <b>${it.summary.estCostPerPerson}</b>
          per person
        </div>
        <div className="stat">
          <b>{it.summary.stopCount}</b>
          stops
        </div>
        <div className="stat">
          <b>{fmtDuration(it.summary.totalMinutes)}</b>
          total
        </div>
        <div className="stat">
          <b>{it.summary.maxDistanceMi} mi</b>
          farthest
        </div>
      </div>

      <div className="timeline" style={{ marginTop: 16 }}>
        {it.stops.map((s, i) => (
          <div key={i}>
            {s.travelFromPrevMin != null && (
              <div className="travel-note">↓ ~{s.travelFromPrevMin} min travel · {s.distanceMi} mi</div>
            )}
            <div className="tl-stop">
              <div className="tl-rail">
                <div className="tl-icon">{stopIcon(s)}</div>
                {i < it.stops.length - 1 && <div className="tl-line" />}
              </div>
              <div className="tl-body">
                <div className="tl-time">
                  {s.startTime} – {s.endTime}
                </div>
                <div className="tl-name">{s.name}</div>
                <div className="tl-meta">
                  <span>
                    {s.kind === 'food'
                      ? `${capitalize(s.meal || 'food')}`
                      : 'Activity'}
                  </span>
                  <span>·</span>
                  <span>{s.priceLabel === 'Free' ? 'Free' : `${s.priceLabel} · ~$${s.costPerPerson}/pp`}</span>
                  <span>·</span>
                  <span>{fmtDuration(s.durationMin)}</span>
                  <span>·</span>
                  <span>{s.indoor ? 'Indoor' : 'Outdoor'}</span>
                </div>
                <div className="tl-reasons">
                  {s.reasons.map((r, ri) => (
                    <span className="tag-pill" key={ri}>
                      {r}
                    </span>
                  ))}
                  <a className="tag-pill" href={s.mapUrl} target="_blank" rel="noreferrer">
                    📍 Map
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <a className="btn secondary" href={it.directionsUrl} target="_blank" rel="noreferrer" style={{ marginTop: 6 }}>
        🗺️ Open route in Maps
      </a>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
