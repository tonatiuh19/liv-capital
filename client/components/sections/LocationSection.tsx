import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  ShoppingBag,
  Bike,
  GraduationCap,
  HeartPulse,
  Trees,
  Star,
  MapPin,
  Navigation,
  Clock,
  X,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLocation, POI } from "@/store/slices/locationSlice";

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_META = {
  mercados: {
    label: "Mercados y Centros Comerciales",
    Icon: ShoppingBag,
    markerColor: "#f5a623",
  },
  transporte: {
    label: "Transporte No Motorizado",
    Icon: Bike,
    markerColor: "#4caf50",
  },
  universidades: {
    label: "Centros Universitarios",
    Icon: GraduationCap,
    markerColor: "#2196f3",
  },
  hospitales: {
    label: "Hospitales",
    Icon: HeartPulse,
    markerColor: "#e53935",
  },
  parques: {
    label: "Parques",
    Icon: Trees,
    markerColor: "#43a047",
  },
  otros: {
    label: "Otros Puntos Importantes",
    Icon: Star,
    markerColor: "#9c27b0",
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

function formatWalkTime(seconds: number): string {
  const min = Math.round(seconds / 60);
  if (min < 1) return "< 1 min";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${min % 60}min`;
}

function numberedIcon(num: number, color: string, selected = false) {
  const size = selected ? 34 : 26;
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${color};color:#fff;
      width:${size}px;height:${size}px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:${selected ? 13 : 11}px;font-family:sans-serif;
      border:${selected ? "3px solid #fff" : "2px solid rgba(255,255,255,0.9)"};
      box-shadow:${selected ? "0 4px 14px rgba(0,0,0,0.5)" : "0 2px 6px rgba(0,0,0,0.35)"};
    ">${num}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

const livIcon = L.divIcon({
  className: "",
  html: `<div style="
    background:#2E3447;
    padding:8px 14px;border-radius:6px;
    box-shadow:0 4px 16px rgba(0,0,0,0.55);
    border:2px solid rgba(255,153,51,0.85);
    display:flex;align-items:center;justify-content:center;
    position:relative;z-index:1000;
  ">
    <img src="/images/logo_liv_white.png" style="height:30px;width:auto;display:block;" alt="LIV Capital" />
  </div>`,
  iconSize: [130, 50],
  iconAnchor: [65, 25],
  popupAnchor: [0, -30],
});

// ─── Re-centre map when coords change ────────────────────────────────────────
function MapCenterer({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

// ─── Route types & layer ──────────────────────────────────────────────────────
interface RouteInfo {
  distanceM: number;
  durationS: number;
}

function RouteLayer({
  center,
  poi,
  onRouteReady,
}: {
  center: { lat: number; lng: number };
  poi: POI | null;
  onRouteReady: (info: RouteInfo | null) => void;
}) {
  const map = useMap();
  const [coords, setCoords] = useState<[number, number][] | null>(null);

  useEffect(() => {
    if (!poi || poi.lat === null || poi.lng === null) {
      setCoords(null);
      onRouteReady(null);
      return;
    }

    let cancelled = false;
    setCoords(null);

    fetch(
      `https://router.project-osrm.org/route/v1/foot/${center.lng},${center.lat};${poi.lng},${poi.lat}?overview=full&geometries=geojson`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.routes?.[0]) return;
        const route = data.routes[0];
        const routeCoords: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng],
        );
        setCoords(routeCoords);
        onRouteReady({ distanceM: route.distance, durationS: route.duration });
        map.fitBounds(
          L.latLngBounds([
            [center.lat, center.lng],
            [poi.lat!, poi.lng!],
          ]),
          { padding: [60, 60], maxZoom: 16 },
        );
      })
      .catch(() => {
        if (cancelled) return;
        // Fallback: straight line with haversine distance estimate
        const fallback: [number, number][] = [
          [center.lat, center.lng],
          [poi.lat!, poi.lng!],
        ];
        setCoords(fallback);
        const R = 6371000;
        const dLat = ((poi.lat! - center.lat) * Math.PI) / 180;
        const dLng = ((poi.lng! - center.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((center.lat * Math.PI) / 180) *
            Math.cos((poi.lat! * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const distM = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        onRouteReady({ distanceM: distM, durationS: (distM / 80) * 60 });
        map.fitBounds(
          L.latLngBounds([
            [center.lat, center.lng],
            [poi.lat!, poi.lng!],
          ]),
          { padding: [60, 60], maxZoom: 16 },
        );
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poi?.id]);

  if (!coords) return null;

  return (
    <>
      {/* Drop shadow */}
      <Polyline
        positions={coords}
        pathOptions={{ color: "#000", weight: 10, opacity: 0.1 }}
      />
      {/* Solid navy base */}
      <Polyline
        positions={coords}
        pathOptions={{ color: "#2E3447", weight: 5, opacity: 0.88 }}
      />
      {/* Animated sand dashes */}
      <Polyline
        positions={coords}
        pathOptions={{
          color: "#ff9933",
          weight: 3,
          opacity: 1,
          dashArray: "10 8",
          className: "route-march",
        }}
      />
    </>
  );
}

// ─── Leaflet map panel ────────────────────────────────────────────────────────
function MapPanel({
  pois,
  selectedPoi,
  onSelectPOI,
  onClearRoute,
}: {
  pois: POI[];
  selectedPoi: POI | null;
  onSelectPOI: (id: number) => void;
  onClearRoute: () => void;
}) {
  const { center } = useAppSelector((s) => s.location);
  const mappablePois = pois.filter((p) => p.lat !== null && p.lng !== null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const handleRouteReady = useCallback((info: RouteInfo | null) => {
    setRouteInfo(info);
    setRouteLoading(false);
  }, []);

  useEffect(() => {
    if (selectedPoi) {
      setRouteLoading(true);
      setRouteInfo(null);
    } else {
      setRouteLoading(false);
      setRouteInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPoi?.id]);

  const selMeta = selectedPoi
    ? CATEGORY_META[selectedPoi.category as keyof typeof CATEGORY_META]
    : null;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        className="w-full h-full"
        zoomControl
        attributionControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        <MapCenterer lat={center.lat} lng={center.lng} />

        {/* LIV Capital */}
        <Marker
          position={[center.lat, center.lng]}
          icon={livIcon}
          zIndexOffset={1000}
        >
          <Popup>
            <span style={{ fontWeight: 700, fontFamily: "sans-serif" }}>
              LIV Capital
            </span>
          </Popup>
        </Marker>

        {/* POI markers */}
        {mappablePois.map((poi) => {
          const meta =
            CATEGORY_META[poi.category as keyof typeof CATEGORY_META];
          const isSelected = selectedPoi?.id === poi.id;
          return (
            <Marker
              key={poi.id}
              position={[poi.lat!, poi.lng!]}
              icon={numberedIcon(
                poi.display_order,
                meta?.markerColor ?? "#888",
                isSelected,
              )}
              zIndexOffset={isSelected ? 500 : 0}
              eventHandlers={{ click: () => onSelectPOI(poi.id) }}
            />
          );
        })}

        {/* Walking route */}
        <RouteLayer
          center={center}
          poi={selectedPoi}
          onRouteReady={handleRouteReady}
        />
      </MapContainer>

      {/* Route info card — floats over map */}
      <AnimatePresence>
        {(routeLoading || routeInfo) && selectedPoi && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
            className="absolute bottom-5 left-3 right-3 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:min-w-[270px] z-[1000] bg-navy text-white rounded-sm shadow-2xl border border-sand/40"
          >
            {/* POI name header */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-white/10">
              {selMeta && (
                <span
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold font-montserrat"
                  style={{ background: selMeta.markerColor, fontSize: 9 }}
                >
                  {selectedPoi.display_order}
                </span>
              )}
              <span className="font-montserrat text-sm font-semibold flex-1 truncate">
                {selectedPoi.name}
              </span>
              <button
                onClick={onClearRoute}
                className="shrink-0 text-white/40 hover:text-white transition-colors ml-1"
                aria-label="Cerrar ruta"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stats row */}
            <div className="px-4 py-2.5">
              {routeLoading ? (
                <div className="flex items-center gap-2 text-white/50">
                  <div className="w-3 h-3 border-2 border-sand border-t-transparent rounded-full animate-spin" />
                  <span className="font-montserrat text-xs">
                    Calculando ruta…
                  </span>
                </div>
              ) : routeInfo ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-sand" />
                    <span className="font-montserrat text-sm font-semibold">
                      {formatDistance(Math.round(routeInfo.distanceM))}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/15" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sand" />
                    <span className="font-montserrat text-sm">
                      {formatWalkTime(routeInfo.durationS)} a pie
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes route-march { to { stroke-dashoffset: -18; } }
        .route-march { animation: route-march 0.5s linear infinite; }
      `}</style>
    </div>
  );
}

// ─── POI list panel ───────────────────────────────────────────────────────────
function POIList({
  pois,
  selectedPoiId,
  onSelectPOI,
}: {
  pois: POI[];
  selectedPoiId: number | null;
  onSelectPOI: (id: number) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, POI[]>();
    for (const poi of pois) {
      if (!map.has(poi.category)) map.set(poi.category, []);
      map.get(poi.category)!.push(poi);
    }
    return map;
  }, [pois]);

  return (
    <div className="overflow-y-auto h-full bg-navy text-white">
      <div className="px-6 pt-6 pb-2">
        <h3 className="font-josefin-sans text-xl font-thin tracking-widest text-white/80 uppercase">
          Puntos de Interés
        </h3>
        <p className="font-montserrat text-[10px] text-white/30 mt-1">
          Toca un punto para trazar la ruta a pie
        </p>
        <div className="w-8 h-px bg-sand mt-2" />
      </div>

      {Array.from(grouped.entries()).map(([cat, items]) => {
        const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
        if (!meta) return null;
        const { Icon, label, markerColor } = meta;

        return (
          <div key={cat} className="mt-4">
            <div
              className="flex items-center gap-2 px-6 py-2 bg-white/5 border-l-2"
              style={{ borderColor: markerColor }}
            >
              <Icon
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: markerColor }}
              />
              <span className="font-montserrat text-xs font-semibold uppercase tracking-wider text-white/70">
                {label}
              </span>
            </div>

            {items.map((poi) => {
              const canRoute = poi.lat !== null && poi.lng !== null;
              const isSelected = selectedPoiId === poi.id;
              return (
                <div
                  key={poi.id}
                  onClick={() => canRoute && onSelectPOI(poi.id)}
                  className={[
                    "flex items-center gap-3 px-6 py-2.5 border-b border-white/5 transition-colors",
                    canRoute ? "cursor-pointer" : "cursor-default opacity-50",
                    isSelected
                      ? "bg-white/10 border-l-2 border-l-sand"
                      : canRoute
                        ? "hover:bg-white/5"
                        : "",
                  ].join(" ")}
                >
                  <div
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-montserrat transition-transform ${isSelected ? "scale-110" : ""}`}
                    style={{ background: markerColor }}
                  >
                    {poi.display_order}
                  </div>
                  <span className="font-montserrat text-sm text-white/85 flex-1 leading-snug">
                    {poi.name}
                  </span>
                  {isSelected ? (
                    <Navigation className="w-3 h-3 text-sand shrink-0" />
                  ) : (
                    <span
                      className="font-montserrat text-xs font-medium shrink-0"
                      style={{ color: markerColor }}
                    >
                      {formatDistance(poi.distance_meters)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <p className="px-6 py-4 text-white/30 text-xs font-montserrat italic">
        * Los marcadores aparecerán en el mapa una vez que se confirmen las
        coordenadas.
      </p>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function LocationSection() {
  const dispatch = useAppDispatch();
  const { pois, loading } = useAppSelector((s) => s.location);
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  const [selectedPoiId, setSelectedPoiId] = useState<number | null>(null);

  const selectedPoi = useMemo(
    () =>
      pois.find(
        (p) => p.id === selectedPoiId && p.lat !== null && p.lng !== null,
      ) ?? null,
    [pois, selectedPoiId],
  );

  const handleSelectPOI = useCallback(
    (id: number) => setSelectedPoiId((prev) => (prev === id ? null : id)),
    [],
  );

  const clearRoute = useCallback(() => setSelectedPoiId(null), []);

  useEffect(() => {
    dispatch(fetchLocation());
  }, [dispatch]);

  return (
    <section id="ubicacion" className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="section-title mb-4">Ubicación Estratégica</h2>
          <p className="text-lg text-text-secondary font-montserrat font-light">
            En el corazón de Guadalajara, conectado con lo mejor de la ciudad
          </p>
          <div className="w-16 h-1 bg-sand mx-auto mt-6" />
        </motion.div>
      </div>

      {/* Map + POI split */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="max-w-7xl mx-auto px-6"
      >
        <div
          className="flex flex-col lg:flex-row rounded-sm overflow-hidden shadow-2xl border border-stone-warm/20"
          style={{ minHeight: 520 }}
        >
          {/* Map — isolation:isolate traps Leaflet's internal z-indices */}
          <div
            className="w-full lg:w-[60%] h-[380px] lg:h-[580px]"
            style={{ isolation: "isolate" }}
          >
            {loading ? (
              <div className="w-full h-full bg-stone-light animate-pulse flex items-center justify-center">
                <MapPin className="w-8 h-8 text-stone-warm/50" />
              </div>
            ) : (
              <MapPanel
                pois={pois}
                selectedPoi={selectedPoi}
                onSelectPOI={handleSelectPOI}
                onClearRoute={clearRoute}
              />
            )}
          </div>

          {/* POI list */}
          <div className="w-full lg:w-[40%] h-[380px] lg:h-[580px]">
            {loading ? (
              <div className="w-full h-full bg-navy/90 animate-pulse" />
            ) : (
              <POIList
                pois={pois}
                selectedPoiId={selectedPoiId}
                onSelectPOI={handleSelectPOI}
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="inline-flex items-center gap-2 bg-navy/5 border border-navy/10 rounded-sm px-4 py-2">
            <MapPin className="w-4 h-4 text-sand shrink-0" />
            <span className="font-montserrat text-sm text-navy">
              Guadalajara, Jalisco —{" "}
              <span className="text-text-secondary font-light">
                Centro Urbano Premium
              </span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Bottom stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            title: "Conectividad",
            body: "Acceso directo a principales avenidas y sistema de transporte público",
          },
          {
            title: "Servicios",
            body: "Proximidad a escuelas, hospitales, comercio y espacios de ocio",
          },
          {
            title: "Lifestyle",
            body: "Restaurantes, cafés, entretenimiento y cultura a tu alcance",
          },
        ].map(({ title, body }) => (
          <div
            key={title}
            className="text-center p-8 bg-stone-light rounded-sm border border-stone-warm/30"
          >
            <MapPin className="w-8 h-8 text-sand mx-auto mb-4" />
            <h3 className="font-montserrat font-semibold text-navy mb-2">
              {title}
            </h3>
            <p className="text-sm text-text-secondary font-montserrat font-light">
              {body}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
