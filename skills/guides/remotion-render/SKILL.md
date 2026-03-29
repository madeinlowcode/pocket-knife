---
name: remotion-render
description: "Create videos with React/Remotion. Use for: programmatic video, data-driven animations"
allowed-tools: Bash(npx *)
disable-model-invocation: true
---

# Remotion Render

Render programmatic videos with React and Remotion. Write components, define compositions, and export MP4/WebM/GIF files from the command line.

## Project Setup

```bash
npx create-video@latest
```

Choose a template when prompted (blank, hello-world, still, etc.). The scaffolded structure:

```
my-video/
  src/
    Root.tsx          # registers all compositions
    HelloWorld.tsx    # example composition component
  public/             # static assets (images, audio)
  remotion.config.ts  # optional config file
  package.json
```

Install dependencies after scaffolding:

```bash
npx remotion studio   # opens the preview UI at localhost:3000
```

## Creating a Composition

A composition is a React component paired with metadata (duration, fps, dimensions).

```tsx
// src/MyVideo.tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const MyVideo = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ color: "#fff", opacity, fontSize: 64 }}>Hello Remotion</h1>
    </AbsoluteFill>
  );
};
```

Register the composition in `src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { MyVideo } from "./MyVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
```

## Rendering

Render a single composition to a file:

```bash
npx remotion render MyVideo out/video.mp4
```

Render to WebM:

```bash
npx remotion render MyVideo out/video.webm --codec=vp8
```

Render a GIF:

```bash
npx remotion render MyVideo out/video.gif --codec=gif --every-nth-frame=2
```

Render a still (single frame):

```bash
npx remotion still MyVideo out/frame.png --frame=60
```

## Configuration (fps, Resolution, Codec)

### Via CLI flags

```bash
npx remotion render MyVideo out/video.mp4 \
  --fps=60 \
  --width=1280 \
  --height=720 \
  --codec=h264 \
  --crf=18 \
  --concurrency=4
```

Key flags:

| Flag | Default | Description |
|------|---------|-------------|
| `--codec` | `h264` | h264, h265, vp8, vp9, gif, prores |
| `--crf` | `18` | Quality (lower = better, larger file) |
| `--fps` | composition fps | Override frame rate |
| `--concurrency` | half CPUs | Parallel rendering threads |
| `--image-format` | `jpeg` | jpeg or png per-frame |
| `--every-nth-frame` | `1` | Skip frames (GIF size reduction) |

### Via remotion.config.ts

```ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(8);
Config.setCodec("h264");
Config.setCrf(18);
```

## Dynamic Data Injection

Pass props to compositions at render time using `--props`:

```bash
npx remotion render MyVideo out/video.mp4 \
  --props='{"title":"My Title","accent":"#ff0000"}'
```

Or point to a JSON file:

```bash
npx remotion render MyVideo out/video.mp4 --props=./data/props.json
```

Receive props in the component:

```tsx
type Props = { title: string; accent: string };

export const MyVideo: React.FC<Props> = ({ title, accent }) => {
  // use props to drive content
};
```

Define default props and a schema in `Root.tsx`:

```tsx
import { z } from "zod";

const schema = z.object({
  title: z.string(),
  accent: z.string(),
});

<Composition
  id="MyVideo"
  component={MyVideo}
  schema={schema}
  defaultProps={{ title: "Default Title", accent: "#0000ff" }}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
/>
```

## Audio Sync

Add an audio track and sync animations to it:

```tsx
import { Audio, useVideoConfig } from "remotion";

export const WithAudio = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/track.mp3")} />
      {/* animate components relative to frame / fps */}
    </AbsoluteFill>
  );
};
```

Use `@remotion/media-utils` to extract audio data for waveform visualizations:

```bash
npx remotion add @remotion/media-utils
```

```tsx
import { useAudioData, visualizeAudio } from "@remotion/media-utils";

const audioData = useAudioData(staticFile("audio/track.mp3"));
const visualization = visualizeAudio({ fps, frame, audioData, numberOfSamples: 64 });
```

## Template Patterns

### Lower Third

```tsx
const LowerThird: React.FC<{ name: string; title: string }> = ({ name, title }) => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 20], [-300, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", bottom: 80, left: slide }}>
        <p style={{ fontWeight: "bold" }}>{name}</p>
        <p>{title}</p>
      </div>
    </AbsoluteFill>
  );
};
```

### Sequence Composition

```tsx
import { Sequence } from "remotion";

export const Timeline = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={60}>
      <Intro />
    </Sequence>
    <Sequence from={60} durationInFrames={120}>
      <MainContent />
    </Sequence>
    <Sequence from={180} durationInFrames={60}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
```

## Batch Rendering

Render multiple compositions in one run using a script:

```bash
npx remotion render Intro out/intro.mp4 && \
npx remotion render Main out/main.mp4 && \
npx remotion render Outro out/outro.mp4
```

Or use the Lambda/Cloud renderer for parallelization at scale:

```bash
npx remotion lambda render MyVideo out/video.mp4
```

## Common Issues

- **Blank frames**: assets loaded asynchronously must use `delayRender` / `continueRender`
- **Font not loading**: wrap font loading with `delayRender` and use `FontFace` API
- **Slow render**: increase `--concurrency`, lower `--crf`, or switch to `jpeg` image format
- **Audio desync**: always specify `durationInFrames` to match audio length × fps exactly
