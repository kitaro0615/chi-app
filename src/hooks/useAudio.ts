import { useCallback, useSyncExternalStore } from "react";

let audioElement: HTMLAudioElement | null = null;
let currentSrc: string | null = null;
let storeVersion = 0;

const listeners = new Set<() => void>();

function emitChange(): void {
  storeVersion += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): number {
  return storeVersion;
}

function getServerSnapshot(): number {
  return 0;
}

function ensureAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioElement) {
    audioElement = new Audio();
    audioElement.addEventListener("ended", () => {
      currentSrc = null;
      emitChange();
    });
    audioElement.addEventListener("pause", () => {
      emitChange();
    });
    audioElement.addEventListener("playing", () => {
      emitChange();
    });
    audioElement.addEventListener("error", () => {
      console.warn(
        `Audio failed to load or play: ${currentSrc ?? "unknown source"}`,
      );
      currentSrc = null;
      emitChange();
    });
  }

  return audioElement;
}

function stopPlayback(): void {
  if (!audioElement) {
    currentSrc = null;
    return;
  }

  audioElement.pause();
  audioElement.currentTime = 0;
  currentSrc = null;
  emitChange();
}

function playSrc(src: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const audio = ensureAudio();
  if (!audio) {
    console.warn(`Audio failed to load or play: ${src}`);
    return;
  }

  stopPlayback();

  currentSrc = src;
  audio.src = src;

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      console.warn(`Audio failed to load or play: ${src}`);
      currentSrc = null;
      emitChange();
    });
  }

  emitChange();
}

export function useAudio() {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const play = useCallback((src: string) => {
    playSrc(src);
  }, []);

  const stop = useCallback(() => {
    stopPlayback();
  }, []);

  const isPlaying = useCallback((src: string) => {
    if (currentSrc !== src || !audioElement) {
      return false;
    }

    return !audioElement.paused && !audioElement.ended;
  }, []);

  return { play, stop, isPlaying };
}
