import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { basename, dirname, join } from "path";
import type { ConversationLine, Lesson, ShadowingItem } from "../src/types/lesson";

const PROJECT_ROOT = join(__dirname, "..");
const LESSON_COUNT = 40;
const TTS_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";
/** Google Cloud 公式の中国語（普通話）ボイス名は cmn-CN-* 形式 */
const LANGUAGE_CODE = "cmn-CN";
const VOICE_NAME = "cmn-CN-Wavenet-B";
const FALLBACK_VOICE_NAME = "cmn-CN-Standard-B";

type PhraseSource = "shadowing" | "conversation";

type PhraseTask = {
  source: PhraseSource;
  item: ShadowingItem | ConversationLine;
};

type SynthesizeResponse = {
  audioContent?: string;
};

type GoogleApiError = {
  error?: {
    message?: string;
    code?: number;
  };
};

function loadEnvFiles(): void {
  for (const filename of [".env.local", ".env"]) {
    const filePath = join(PROJECT_ROOT, filename);
    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

function isLesson(value: unknown): value is Lesson {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "number" &&
    Array.isArray(record.shadowing_base) &&
    Array.isArray(record.conversation)
  );
}

function loadLesson(lessonNumber: number): Lesson {
  const padded = String(lessonNumber).padStart(2, "0");
  const filePath = join(PROJECT_ROOT, "src", "data", `lesson${padded}.json`);
  const raw = readFileSync(filePath, "utf-8");
  const parsed: unknown = JSON.parse(raw);

  if (!isLesson(parsed)) {
    throw new Error(`Invalid lesson JSON: lesson${padded}.json`);
  }

  return parsed;
}

function audioUrlToOutputPath(audioUrl: string): string {
  const relativePath = audioUrl.startsWith("/") ? audioUrl.slice(1) : audioUrl;
  return join(PROJECT_ROOT, "public", relativePath);
}

function getAudioFileLabel(audioUrl: string): string {
  return basename(audioUrl, ".mp3");
}

async function synthesizeSpeech(
  text: string,
  apiKey: string,
  voiceName: string,
): Promise<Buffer> {
  const url = `${TTS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: LANGUAGE_CODE,
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: "MP3",
      },
    }),
  });

  const body: unknown = await response.json();

  if (!response.ok) {
    const errorBody = body as GoogleApiError;
    const message =
      errorBody.error?.message ?? `HTTP ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const successBody = body as SynthesizeResponse;

  if (!successBody.audioContent) {
    throw new Error("TTS response did not include audioContent");
  }

  return Buffer.from(successBody.audioContent, "base64");
}

async function synthesizeWithFallback(
  text: string,
  apiKey: string,
): Promise<Buffer> {
  try {
    return await synthesizeSpeech(text, apiKey, VOICE_NAME);
  } catch (primaryError) {
    console.warn(
      `    warn: ${VOICE_NAME} failed, retrying with ${FALLBACK_VOICE_NAME}`,
    );
    try {
      return await synthesizeSpeech(text, apiKey, FALLBACK_VOICE_NAME);
    } catch (fallbackError) {
      const primaryMessage =
        primaryError instanceof Error ? primaryError.message : String(primaryError);
      const fallbackMessage =
        fallbackError instanceof Error
          ? fallbackError.message
          : String(fallbackError);
      throw new Error(`${primaryMessage} | fallback: ${fallbackMessage}`);
    }
  }
}

async function generatePhraseAudio(
  task: PhraseTask,
  lessonNumber: number,
  apiKey: string,
): Promise<void> {
  const paddedLesson = String(lessonNumber).padStart(2, "0");
  const audioUrl = task.item.audio;
  const outputPath = audioUrlToOutputPath(audioUrl);
  const fileLabel = getAudioFileLabel(audioUrl);
  const logPrefix = `[${paddedLesson}/40] lesson${paddedLesson} ${fileLabel}`;

  console.log(`${logPrefix}...`);

  if (existsSync(outputPath)) {
    console.log(`${logPrefix} skipped (already exists)`);
    return;
  }

  const text = task.item.chinese.trim();
  if (!text) {
    console.error(`${logPrefix} skipped (empty chinese text)`);
    return;
  }

  try {
    const audioBuffer = await synthesizeWithFallback(text, apiKey);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, audioBuffer);
    console.log(`${logPrefix} saved`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${logPrefix} failed: ${message}`);
  }
}

function buildPhraseTasks(lesson: Lesson): PhraseTask[] {
  const shadowingTasks: PhraseTask[] = lesson.shadowing_base.map((item) => ({
    source: "shadowing",
    item,
  }));

  const conversationTasks: PhraseTask[] = lesson.conversation.map((item) => ({
    source: "conversation",
    item,
  }));

  return [...shadowingTasks, ...conversationTasks];
}

async function main(): Promise<void> {
  loadEnvFiles();

  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
  if (!apiKey) {
    console.error(
      "GOOGLE_CLOUD_TTS_API_KEY is not set. Add it to .env.local and retry.",
    );
    process.exit(1);
  }

  console.log("Google Cloud TTS audio generation started");
  console.log(`Voice: ${VOICE_NAME} (fallback: ${FALLBACK_VOICE_NAME})`);
  console.log(`Output: public/audio/lesson{01-${String(LESSON_COUNT).padStart(2, "0")}}/`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let lessonNumber = 1; lessonNumber <= LESSON_COUNT; lessonNumber += 1) {
    const paddedLesson = String(lessonNumber).padStart(2, "0");

    let lesson: Lesson;
    try {
      lesson = loadLesson(lessonNumber);
      console.log(`\n[${paddedLesson}/40] Loading lesson${paddedLesson}.json`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${paddedLesson}/40] Failed to load lesson: ${message}`);
      continue;
    }

    const tasks = buildPhraseTasks(lesson);

    for (const task of tasks) {
      const outputPath = audioUrlToOutputPath(task.item.audio);
      const existedBefore = existsSync(outputPath);

      await generatePhraseAudio(task, lessonNumber, apiKey);

      if (existedBefore) {
        skipped += 1;
      } else if (existsSync(outputPath)) {
        generated += 1;
      } else {
        failed += 1;
      }
    }
  }

  console.log("\nDone.");
  console.log(`Generated: ${generated}`);
  console.log(`Skipped (existing): ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fatal error: ${message}`);
  process.exit(1);
});
