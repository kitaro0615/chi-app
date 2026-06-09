import { useCallback, useSyncExternalStore } from "react";

let audioElement: HTMLAudioElement | null = null;
let currentSrc: string | null = null;
let storeVersion = 0;

const listeners = new Set<() => void>();
const endedListeners = new Set<() => void>();

function emitChange(): void {
  storeVersion += 1;
  listeners.forEach((listener) => listener());
}

function emitEnded(): void {
  endedListeners.forEach((listener) => listener());
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
      emitEnded();
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
      emitEnded();
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

function pausePlayback(): void {
  if (!audioElement) {
    return;
  }

  audioElement.pause();
  emitChange();
}

function resumePlayback(): void {
  if (!audioElement || !currentSrc) {
    return;
  }

  const playPromise = audioElement.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      console.warn(`Audio failed to resume: ${currentSrc ?? "unknown source"}`);
      emitChange();
    });
  }

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
      emitEnded();
    });
  }

  emitChange();
}

/** 音声再生が終了したとき（またはエラー時）に呼ばれるリスナーを登録する */
export function subscribeAudioEnded(listener: () => void): () => void {
  endedListeners.add(listener);
  return () => {
    endedListeners.delete(listener);
  };
}

export function useAudio() {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const play = useCallback((src: string) => {
    playSrc(src);
  }, []);

  const stop = useCallback(() => {
    stopPlayback();
  }, []);

  const pause = useCallback(() => {
    pausePlayback();
  }, []);

  const resume = useCallback(() => {
    resumePlayback();
  }, []);

  const isPlaying = useCallback((src: string) => {
    if (currentSrc !== src || !audioElement) {
      return false;
    }

    return !audioElement.paused && !audioElement.ended;
  }, []);

  return { play, stop, pause, resume, isPlaying };
}
