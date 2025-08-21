import React, { useEffect, useRef, useState } from "react";

/**
 * Reusable image carousel (pure CSS + minimal JS)
 * props:
 *  - images: string[]  -> required (array de URLs)
 *  - autoPlay: boolean -> default true
 *  - interval: number  -> default 3500 ms
 *  - showArrows: boolean -> default true
 *  - showDots: boolean -> default true
 *  - loop: boolean -> default true
 *  - aspectRatio: string -> default "16 / 9" (CSS aspect-ratio)
 */
export default function Carousel({
  images = [],
  autoPlay = true,
  interval = 3500,
  showArrows = true,
  showDots = true,
  loop = true,
  aspectRatio = "16 / 9",
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const trackRef = useRef(null);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  if (!images || images.length === 0) return null;

  const goTo = (i) => {
    const last = images.length - 1;
    if (i < 0) setIndex(loop ? last : 0);
    else if (i > last) setIndex(loop ? 0 : last);
    else setIndex(i);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // autoplay
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, autoPlay, interval, images.length]);

  // pausa en hover (accesibilidad/UX)
  const pause = () => timerRef.current && clearInterval(timerRef.current);
  const resume = () => {
    if (autoPlay && images.length > 1) {
      timerRef.current = setInterval(next, interval);
    }
  };

  // teclado
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  // touch/swipe
  const onTouchStart = (e) => {
    pause();
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    // opcional: arrastre visual (pequeño)
    if (trackRef.current) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(calc(${-index * 100}% + ${touchDeltaX.current}px))`;
    }
  };
  const onTouchEnd = () => {
    if (trackRef.current) {
      trackRef.current.style.transition = "";
      trackRef.current.style.transform = `translateX(-${index * 100}%)`;
    }
    const threshold = 50; // px
    if (touchDeltaX.current > threshold) prev();
    else if (touchDeltaX.current < -threshold) next();
    touchStartX.current = null;
    touchDeltaX.current = 0;
    resume();
  };

  return (
    <div
      className="crs"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-roledescription="carrusel"
      aria-label="Carrusel de imágenes"
      style={{ aspectRatio }}
    >
      <div
        className="crs-viewport"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className="crs-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div className="crs-slide" key={i}>
              <img
                src={src}
                alt={`Imagen ${i + 1} de ${images.length}`}
                draggable="false"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {showArrows && images.length > 1 && (
        <>
          <button
            className="crs-arrow crs-arrow--left"
            onClick={prev}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            className="crs-arrow crs-arrow--right"
            onClick={next}
            aria-label="Siguiente"
          >
            ›
          </button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div className="crs-dots" role="tablist" aria-label="Indicadores">
          {images.map((_, i) => (
            <button
              key={i}
              className={`crs-dot ${i === index ? "is-active" : ""}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === index}
              aria-label={`Ir a la imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
