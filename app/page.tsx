"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wedding } from "./wedding";
import type { AnimationItem } from "lottie-web";
import Image from "next/image";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetPath = (path: string) => `${basePath}${path}`;

const weddingDate = new Date(wedding.date);
const coupleImages = wedding.photos.map((photo) => assetPath(`/assets/client/${photo}`));
const primarySlides = coupleImages;
const finalSlides = [...coupleImages].reverse();
const itinerary = wedding.itinerary;
const calendarUrl = "https://calendar.google.com/calendar/render?" + new URLSearchParams({
  action: "TEMPLATE", text: `Matrimonio de ${wedding.names}`,
  dates: `${wedding.calendarStart}/${wedding.calendarEnd}`,
  details: `Celebra nuestra boda. Ceremonia: ${wedding.ceremony.time}. Recepción: ${wedding.reception.time}.`,
  location: wedding.ceremony.name + ", " + wedding.ceremony.address, ctz: "America/Lima",
});
const whatsappUrl = (phone: string, message: string) =>
  `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`;
const youtubeEmbedUrl = `https://www.youtube-nocookie.com/embed/${wedding.youtubeId}?enablejsapi=1&autoplay=1&controls=0&loop=1&playlist=${wedding.youtubeId}&playsinline=1&rel=0`;

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type GateStage = "closed" | "opening" | "open" | "leaving";

const initialCountdown: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

type LottieAnimationProps = {
  src: string;
  className?: string;
  label?: string;
  reverse?: boolean;
  playOnView?: boolean;
};

function getCountdown(): Countdown {
  const remaining = Math.max(0, weddingDate.getTime() - Date.now());

  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
  };
}

function useCountdown() {
  const [countdown, setCountdown] = useState<Countdown>(initialCountdown);

  useEffect(() => {
    const update = () => setCountdown(getCountdown());
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return countdown;
}

function LottieAnimation({
  src,
  className = "",
  label,
  reverse = false,
  playOnView = true,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: AnimationItem | undefined;
    let observer: IntersectionObserver | undefined;
    let cancelled = false;

    const loadAnimation = async () => {
      const { default: lottie } = await import("lottie-web/build/player/lottie_light");
      if (cancelled || !containerRef.current) return;

      animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: !playOnView,
        path: assetPath(src),
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
        },
      });

      animation.addEventListener("DOMLoaded", () => {
        if (!animation || cancelled) return;

        if (reverse) {
          animation.setDirection(-1);
          animation.goToAndStop(animation.getDuration(true), true);
        }

        if (!playOnView || !containerRef.current) return;

        observer = new IntersectionObserver(
          ([entry]) => {
            if (!animation) return;
            if (entry.isIntersecting) animation.play();
            else animation.pause();
          },
          { threshold: 0.08 },
        );
        observer.observe(containerRef.current);
      });
    };

    void loadAnimation();

    return () => {
      cancelled = true;
      observer?.disconnect();
      animation?.destroy();
    };
  }, [playOnView, reverse, src]);

  return (
    <div
      ref={containerRef}
      className={`lottie-animation ${className}`.trim()}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

function MountainWave({ position, className = "" }: { position: "top" | "bottom"; className?: string }) {
  return (
    <div className={`mountain-wave mountain-wave-${position} ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path
          opacity="0.33"
          d="M473,67.3c-203.9,88.3-263.1-34-320.3,0C66,119.1,0,59.7,0,59.7V0h1000v59.7 c0,0-62.1,26.1-94.9,29.3c-32.8,3.3-62.8-12.3-75.8-22.1C806,49.6,745.3,8.7,694.9,4.7S492.4,59,473,67.3z"
        />
        <path
          opacity="0.66"
          d="M734,67.3c-45.5,0-77.2-23.2-129.1-39.1c-28.6-8.7-150.3-10.1-254,39.1 s-91.7-34.4-149.2,0C115.7,118.3,0,39.8,0,39.8V0h1000v36.5c0,0-28.2-18.5-92.1-18.5C810.2,18.1,775.7,67.3,734,67.3z"
        />
        <path d="M766.1,28.9c-200-57.5-266,65.5-395.1,19.5C242,1.8,242,5.4,184.8,20.6C128,35.8,132.3,44.9,89.9,52.5C28.6,63.7,0,0,0,0 h1000c0,0-9.9,40.9-83.6,48.1S829.6,47,766.1,28.9z" />
      </svg>
    </div>
  );
}

function Slideshow({
  images,
  className,
  bottomWave = false,
}: {
  images: string[];
  className: string;
  bottomWave?: boolean;
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % images.length);
    }, 2_000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <section className={`photo-slideshow ${className}`} aria-label="Fotografías de los novios">
      <div className="photo-slides" aria-hidden="true">
        {images.map((image, index) => (
          <div
            className={`photo-slide${index === activeSlide ? " is-active" : ""}`}
            key={image}
            style={{ backgroundImage: `url("${image}")` }}
          />
        ))}
      </div>
      <MountainWave position="top" className="photo-wave" />
      {bottomWave && <MountainWave position="bottom" className="photo-wave" />}
    </section>
  );
}

function HeartDivider() {
  return (
    <div className="heart-divider" aria-hidden="true">
      <span />
      <svg viewBox="0 0 512 512">
        <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z" />
      </svg>
      <span />
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="calendar-icon" viewBox="0 0 448 512" aria-hidden="true">
      <path d="M148 288h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12zm108-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm96 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 96v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm192 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm96-260v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h48V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h128V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h48c26.5 0 48 21.5 48 48zm-48 346V160H48v298c0 3.3 2.7 6 6 6h340c3.3 0 6-2.7 6-6z" />
    </svg>
  );
}

export default function Home() {
  const [gateVisible, setGateVisible] = useState(true);
  const [gateStage, setGateStage] = useState<GateStage>("closed");
  const [guestName, setGuestName] = useState("Invitado especial");
  const [guestPasses, setGuestPasses] = useState(2);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicLoaded, setMusicLoaded] = useState(false);
  const musicPlayerRef = useRef<HTMLIFrameElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const moveLightbox = useCallback((direction: number) => {
    setLightboxIndex((current) => current === null ? null : (current + direction + coupleImages.length) % coupleImages.length);
  }, []);
  useEffect(() => {
    if (lightboxIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKey); };
  }, [closeLightbox, lightboxIndex, moveLightbox]);
  const confirmationMessage = `Hola, soy ${guestName}. Confirmo mi asistencia a la boda de ${wedding.names} para ${guestPasses} ${guestPasses === 1 ? "persona" : "personas"}.`;
  const countdown = useCountdown();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = gateVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [gateVisible]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedName = params.get("n")?.trim().replace(/\s+/g, " ");
    const requestedPasses = Number.parseInt(params.get("p") ?? "", 10);
    const timer = window.setTimeout(() => {
      if (requestedName) setGuestName(requestedName.slice(0, 64));
      if (Number.isFinite(requestedPasses)) {
        setGuestPasses(Math.min(20, Math.max(1, requestedPasses)));
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (gateStage !== "opening") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        setGateStage("open");
      },
      reducedMotion ? 30 : 1_850,
    );

    return () => window.clearTimeout(timer);
  }, [gateStage]);

  useEffect(() => {
    if (gateStage !== "leaving") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        setGateVisible(false);
        window.scrollTo({ top: 0, behavior: "auto" });
      },
      reducedMotion ? 30 : 760,
    );

    return () => window.clearTimeout(timer);
  }, [gateStage]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const openEnvelope = () => {
    if (gateStage !== "closed") return;
    setGateStage("opening");
  };

  const openInvitation = () => {
    if (gateStage !== "open") return;
    setGateStage("leaving");

    setMusicLoaded(true);
    setMusicPlaying(true);
  };

  const toggleMusic = () => {
    const nextPlaying = !musicPlaying;
    setMusicLoaded(true);
    musicPlayerRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: nextPlaying ? "playVideo" : "pauseVideo", args: [] }),
      "https://www.youtube-nocookie.com",
    );
    setMusicPlaying(nextPlaying);
  };

  return (
    <>
      {musicLoaded && (
        <iframe ref={musicPlayerRef} className="music-player" src={youtubeEmbedUrl}
          title="Música de la invitación" allow="autoplay; encrypted-media"
          onLoad={() => {
            if (!musicPlaying) musicPlayerRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "https://www.youtube-nocookie.com",
            );
          }} />
      )}

      {gateVisible && (
        <div
          className={`invitation-gate is-${gateStage}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
        >
          <div className="gate-content">
            <header className="gate-intro">
              <p>El día más importante de nuestras vidas ha llegado</p>
              <h2 id="gate-title">¡Nos casamos!</h2>
            </header>

            <div className="gate-scene">
              <div className="sand-envelope">
                <span className="envelope-back" aria-hidden="true" />
                <span className="envelope-open-flap" aria-hidden="true" />

                <span className="envelope-liner-card" aria-hidden="true">
                  <Image className="envelope-couple-photo" src={coupleImages[0]} alt="" width={500} height={680} unoptimized priority />
                </span>

                <span className="gate-pass-card" aria-live="polite">
                  <span className="gate-pass-heading">Reservado<br />para:</span>
                  <strong>{guestName}</strong>
                  <em>{guestPasses === 1 ? "1 persona" : `${guestPasses} personas`}</em>
                </span>

                <span className="envelope-front" aria-hidden="true" />
                <span className="envelope-closed-flap" aria-hidden="true" />

                <button
                  className="envelope-trigger"
                  type="button"
                  onClick={openEnvelope}
                  aria-label="Abrir el sobre"
                  aria-expanded={gateStage !== "closed"}
                  disabled={gateStage !== "closed"}
                >
                  <span className="envelope-click-copy">Clic aquí</span>
                  <span className="envelope-seal" aria-hidden="true">
                    <Image
                      src={assetPath("/assets/client/wax-seal-ochre.png")}
                      alt=""
                      width={320}
                      height={320}
                      sizes="50px"
                      priority
                      unoptimized
                    />
                  </span>
                </button>

                <button
                  className="gate-details-button"
                  type="button"
                  onClick={openInvitation}
                  disabled={gateStage !== "open"}
                >
                  <span>Ver más<br />detalles</span>
                </button>
              </div>
            </div>

            <p className="gate-couple">{wedding.names.replace(" y ", " & ")}</p>
          </div>
        </div>
      )}

      <main aria-hidden={gateVisible ? true : undefined} inert={gateVisible ? true : undefined}>
        <section className="hero" id="cabecera">
          <svg className="hero-mask-defs" width="0" height="0" aria-hidden="true">
            <defs>
              <mask
                id="frozen-cut-right"
                maskUnits="objectBoundingBox"
                maskContentUnits="objectBoundingBox"
              >
                <rect x="0" y="0" width="1" height="1" fill="white" />
                <path
                  transform="translate(1,0) scale(-1,1.3)"
                  fill="black"
                  d="M0.059,0.0004 C0.005,0.087 0.005,0.195 0.059,0.378 S0.005,0.792 0.005,0.792 H0 V0 Z"
                />
              </mask>
            </defs>
          </svg>

          <div className="hero-media frozen-cut-right">
            <Image
              className="hero-photo"
              src={coupleImages[wedding.heroIndex]}
              alt={wedding.names}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized
            />
            <div className="hero-media-shade" />
            <MountainWave position="bottom" className="hero-wave" />
          </div>

          <div className="hero-copy">
            <div className="hero-copy-inner" data-reveal>
              <p className="eyebrow">¡NOS CASAMOS!</p>
              <h1>{wedding.names}</h1>
              {wedding.fullNames && <p className="couple-full-names">{wedding.fullNames}</p>}
              <p className="hero-invitation">
                Tenemos el honor
                <br />
                de invitarte a nuestra boda
              </p>
            </div>
          </div>
        </section>

        <div className="hero-spacer" aria-hidden="true" />

        <section className="warm-band">
          <p>
{wedding.verse}
            {wedding.verseReference && <small>{wedding.verseReference}</small>}
          </p>
        </section>

        <section className="story section-pad">
          <div className="narrow-copy" data-reveal>
            <LottieAnimation
              className="couple-lottie line-lottie"
              src="/assets/lottie/couple.json"
              reverse
            />
            {wedding.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        <section className="family section-pad">
          <div className="section-shell">
            <HeartDivider />
            <p className="solemn family-intro" data-reveal>
              {wedding.familyIntro}
            </p>
            <div className="family-grid parents-grid">
              {wedding.families.map((family) => (
                <article key={family.title} data-reveal>
                  <h2>{family.title}</h2>
                  <p className="family-names">{family.names.map((name) => <span key={name}>{name}</span>)}</p>
                </article>
              ))}
            </div>
            {wedding.attendants.length > 0 && <div className="family-grid attendants-grid">
              {wedding.attendants.map((group) => (
                <article key={group.title} data-reveal>
                  <h2>{group.title}</h2>
                  <p className="family-names">{group.names.map((name) => <span key={name}>{name}</span>)}</p>
                </article>
              ))}
            </div>}
          </div>
        </section>

        <section className="date-section section-pad">
          <div className="section-shell date-shell">
            <LottieAnimation className="hearts-lottie" src="/assets/lottie/hearts.json" />
            <p className="script-heading" data-reveal>
              Queremos que nos acompañes en nuestro día:
            </p>
            <h2 className="wedding-date" data-reveal>
              {wedding.dateLabel}
            </h2>
            <p className="script-heading faltan" data-reveal>
              Faltan
            </p>

            <div className="countdown" aria-label="Cuenta regresiva para la boda">
              {(
                [
                  [countdown.days, "Días"],
                  [countdown.hours, "Hrs"],
                  [countdown.minutes, "Mins"],
                  [countdown.seconds, "Segs"],
                ] as const
              ).map(([value, label]) => (
                <div className="countdown-unit" key={label}>
                  <strong>{String(value).padStart(2, "0")}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <a className="outline-button pulse" href={calendarUrl} target="_blank" rel="noreferrer">
              <CalendarIcon /> Agendar el Evento
            </a>
            <LottieAnimation className="hearts-lottie hearts-lottie-bottom" src="/assets/lottie/hearts.json" />
          </div>
        </section>

        <section className="venue-section section-pad">
          <div className="venue-grid section-shell">
            <article className="soft-card venue-card" data-reveal>
              <LottieAnimation
                className="venue-lottie line-lottie"
                src="/assets/lottie/church.json"
                label="Iglesia"
                reverse
              />
              <p>La <strong>Ceremonia</strong><br />se realizará a las<br />
                <strong>{wedding.ceremony.time}</strong><br />
                <strong>{wedding.ceremony.name}</strong><br />{wedding.ceremony.address}
              </p>
              <a className="outline-button" href={wedding.ceremony.map} target="_blank" rel="noreferrer">
                Ver Ubicación
              </a>
            </article>

            <article className="soft-card venue-card" data-reveal>
              <LottieAnimation
                className="venue-lottie line-lottie"
                src="/assets/lottie/reception.json"
                label="Recepción social"
                reverse
              />
              <p>La <strong>Recepción</strong><br />
                se realizará a las <strong>{wedding.reception.time}</strong><br />
                <strong>{wedding.reception.name}</strong><br />{wedding.reception.address}
              </p>
              <a className="outline-button" href={wedding.reception.map} target="_blank" rel="noreferrer">
                Ver Ubicación
              </a>
            </article>
          </div>

          <article className="soft-card dress-card section-shell" data-reveal>
            <div className="dress-icons" aria-label="Vestimenta elegante">
              <LottieAnimation className="dress-lottie line-lottie" src="/assets/lottie/suit.json" reverse />
              <LottieAnimation className="dress-lottie line-lottie" src="/assets/lottie/dress.json" reverse />
            </div>
            <h2>Código de Vestimenta</h2>
            {wedding.dressLevel && <p className="dress-level">{wedding.dressLevel}</p>}
            {wedding.dressNote && <p className="dress-note">{wedding.dressNote}</p>}
            <p className="reserved-colors-title">Por favor no utilizar</p>
            <div className="reserved-colors" aria-label="Colores reservados">
              {wedding.reservedColors.map((color) => (
                <span className="color-swatch" key={color.name}><i style={{ backgroundColor: color.color }} />{color.name}</span>
              ))}
            </div>
          </article>
        </section>

        <section className="timeline-section section-pad" id="itinerario">
          <div className="section-shell compact-shell">
            <Image
              className="ornament-divider"
              src={assetPath("/assets/separator.svg")}
              alt=""
              width={190}
              height={40}
              unoptimized
            />
            <h2 className="script-title" data-reveal>
              Itinerario
            </h2>
            <div className="timeline-list" data-reveal>
              {itinerary.map((item, index) => {
                const rangeTime = item.time.includes("–")
                  ? item.time.match(/^(.*?)\s+([ap]\.\s*m\.)$/)
                  : null;
                const animation = (
                  <LottieAnimation
                    className="timeline-lottie line-lottie"
                    src={item.animation}
                    label={item.title}
                    reverse
                  />
                );
                const copy = (
                  <div className="timeline-copy">
                    <time dateTime={item.dateTime} className={rangeTime ? "timeline-time-range" : undefined}>
                      {rangeTime ? (
                        <>
                          <span className="timeline-time-value">{rangeTime[1]}</span>{" "}
                          <span className="timeline-time-period">{rangeTime[2]}</span>
                        </>
                      ) : item.time}
                    </time>
                    <p>
                      <strong>{item.title}</strong>
                      {item.detail && (
                        <>
                          <br />
                          {item.detail}
                        </>
                      )}
                    </p>
                  </div>
                );

                return (
                  <article className={`timeline-row${index % 2 ? " is-reversed" : ""}`} key={item.time}>
                    <div className="timeline-side timeline-side-left">{index % 2 ? copy : animation}</div>
                    <div className="timeline-track" aria-hidden="true">
                      <span />
                    </div>
                    <div className="timeline-side timeline-side-right">{index % 2 ? animation : copy}</div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="after-gallery-cards section-pad" aria-label="Información para invitados">
          <div className="section-shell after-gallery-grid">
            <article className="soft-card info-card" data-reveal>
              <LottieAnimation
                className="info-lottie line-lottie"
                src="/assets/lottie/gift.json"
                label="Regalo"
                reverse
              />
              <h2>Sugerencia de Regalo</h2>
              <p className="gift-message">{wedding.giftMessage}</p>
              {wedding.bank.length > 0 && <div className="gift-detail">
                <LottieAnimation className="envelopes-lottie line-lottie" src="/assets/lottie/envelopes.json" />
                {wedding.bank.map((method) => <div className="gift-method" key={method.label}>
                  <span>{method.label}</span><strong>{method.value}</strong>
                </div>)}
              </div>}
            </article>
          </div>
        </section>

        <section className="gallery-section" aria-label="Galería de fotografías">
          <div className={`gallery-grid client-gallery gallery-count-${coupleImages.length}`}>
            {coupleImages.map((src, index) => (
              <button type="button" className="gallery-item" key={src}
                onClick={() => setLightboxIndex(index)} aria-label={`Abrir fotografía ${index + 1}`}>
                <Image src={src} alt={`${wedding.names} · fotografía ${index + 1}`}
                  width={700} height={1000} unoptimized loading="lazy" />
              </button>
            ))}
          </div>
        </section>
        <section className="guest-extras section-pad">
          <div className="section-shell">
            <article className="soft-card info-card" data-reveal>
              <LottieAnimation className="info-lottie line-lottie" src="/assets/lottie/share-photos.json" reverse />
              <h2>Comparte tus fotografías</h2>
              <p>Ayúdanos a hacer eterno este día. Comparte las fotografías que captures durante nuestra boda.</p>
              <a className="outline-button" target="_blank" rel="noreferrer"
                href={whatsappUrl(wedding.contacts[0].phone, `Hola, les comparto fotografías de la boda de ${wedding.names}.`)}>
                Compartir fotografías
              </a>
            </article>
            {wedding.songSuggestions && <article className="soft-card info-card song-card" data-reveal>
              <LottieAnimation className="info-lottie line-lottie" src="/assets/lottie/music.json" reverse />
              <h2>¿Qué canción no puede faltar?</h2>
              <p>Ayúdanos a elegir la música para celebrar juntos.</p>
              <form onSubmit={(event) => {
                event.preventDefault();
                window.open(whatsappUrl(wedding.contacts[0].phone,
                  `Hola, soy ${guestName}. Para la boda de ${wedding.names} sugiero la canción: ${song.trim()}${artist.trim() ? " — " + artist.trim() : ""}.`), "_blank", "noopener,noreferrer");
              }}>
                <label htmlFor="song-title">Canción</label>
                <input id="song-title" value={song} onChange={(event) => setSong(event.target.value)} required maxLength={120} placeholder="Nombre de la canción" />
                <label htmlFor="song-artist">Artista (opcional)</label>
                <input id="song-artist" value={artist} onChange={(event) => setArtist(event.target.value)} maxLength={120} placeholder="Nombre del artista" />
                <button className="outline-button" type="submit">Enviar sugerencia por WhatsApp</button>
              </form>
            </article>}
          </div>
        </section>

        <Slideshow images={primarySlides} className="primary-slideshow" bottomWave />

        <section className="final-message section-pad">
          <div className="narrow-copy" data-reveal>
            <LottieAnimation
              className="closing-couple-lottie line-lottie"
              src="/assets/lottie/couple.json"
              reverse
            />
            <p>
              Gracias por acompañarnos en el día más especial de nuestra historia.
              Su compañía en este día es el mayor regalo que podemos recibir.
              Gracias por sus oraciones, su cariño y por ser parte de nuestro camino.
              Estamos agradecidos con Dios y con la vida por permitirnos celebrar
              este momento con ustedes; nuestra familia y amigos más queridos.
            </p>
            <h2>Con todo nuestro amor</h2>
            <p className="signature">{wedding.names}</p>
            <LottieAnimation className="hearts-lottie final-hearts" src="/assets/lottie/hearts.json" />
          </div>
        </section>

        <section className="rsvp-section section-pad" aria-label="Confirmación de asistencia">
          <article className="rsvp-card soft-card" data-reveal>
            <h2>Confirma tu asistencia</h2>
            <p className="rsvp-emphasis">
              <strong>Tu presencia es valiosa,</strong>
              <span>pero tu sinceridad lo es aún más.</span>
            </p>
            <p className="rsvp-copy">
              Tu confirmación nos permite compartir este día contigo de la mejor
              manera posible. Nos encantaría que seas parte.
            </p>
            <p className="rsvp-instruction">Confirma tu asistencia directamente por WhatsApp.</p>
            <div className="rsvp-contacts">
              {wedding.contacts.map((contact) => (
                <div key={contact.phone}>
                  <p className="rsvp-note">{contact.name} · {contact.role}</p>
                  <a className="outline-button rsvp-button" href={whatsappUrl(contact.phone, confirmationMessage)} target="_blank" rel="noreferrer">
                    Confirmar con {contact.name}
                  </a>
                </div>
              ))}
            </div>
          </article>
        </section>

        <Slideshow images={finalSlides} className="final-slideshow" />

        <footer>
          <span>{wedding.initials[0]}</span>
          <b>&amp;</b>
          <span>{wedding.initials[1]}</span>
          <p className="footer-date">{wedding.footerDate}</p>
          <a
            className="footer-credit"
            href="https://www.facebook.com/share/1GEf98Ai3S/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
          >
            Elaborado con amor por <strong>GiftClick</strong>
          </a>
        </footer>
      </main>

      {!gateVisible && (
        <button
          className={`music-button${musicPlaying ? " is-playing" : ""}`}
          type="button"
          onClick={toggleMusic}
          aria-label={musicPlaying ? "Pausar música" : "Reproducir música"}
          aria-pressed={musicPlaying}
        >
          <LottieAnimation
            className="music-lottie"
            src="/assets/lottie/music.json"
            reverse
            playOnView={false}
          />
        </button>
      )}

      {lightboxIndex !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Visor de fotografías">
        <button className="lightbox-close" type="button" onClick={closeLightbox} aria-label="Cerrar">×</button>
        <button className="lightbox-arrow lightbox-prev" type="button" onClick={() => moveLightbox(-1)} aria-label="Fotografía anterior">‹</button>
        <Image src={coupleImages[lightboxIndex]} alt={wedding.names} width={1400} height={1800} unoptimized />
        <p>{lightboxIndex + 1} / {coupleImages.length}</p>
        <button className="lightbox-arrow lightbox-next" type="button" onClick={() => moveLightbox(1)} aria-label="Fotografía siguiente">›</button>
      </div>}
    </>
  );
}
