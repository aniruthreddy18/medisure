"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

export type VideoData = {
  id: string;
  title: string;
  description: string | null;
  youtubeId: string | null;
  fileUrl: string | null;
  thumbnail: string | null;
};

/**
 * YouTube facade.
 *
 * A normal YouTube <iframe> pulls ~1MB of player JavaScript and sets cookies
 * on page load, whether or not anyone watches. We render the thumbnail with a
 * play button and only mount the real iframe after a click — the page stays
 * fast and no third-party tracking fires until the visitor opts in.
 */
export function VideoGrid({ videos }: { videos: VideoData[] }) {
  if (videos.length === 0) return null;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoCard({ video }: { video: VideoData }) {
  const [active, setActive] = useState(false);

  const poster =
    video.thumbnail ??
    (video.youtubeId ? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg` : null);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="relative aspect-video bg-brand-900">
        {active && video.youtubeId ? (
          <iframe
            className="absolute inset-0 size-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : active && video.fileUrl ? (
          <video className="absolute inset-0 size-full" src={video.fileUrl} controls autoPlay />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="group absolute inset-0 size-full"
            aria-label={`Play video: ${video.title}`}
          >
            {poster ? (
              <Image
                src={poster}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(120%_100%_at_30%_0%,var(--color-brand-600),var(--color-brand-950))]"
              />
            )}
            <span className="absolute inset-0 bg-brand-950/30 transition-colors group-hover:bg-brand-950/45" />
            <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-brand-800 shadow-lg transition-transform group-hover:scale-105">
              <Play className="size-6 translate-x-0.5 fill-current" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-display font-semibold text-brand-950">{video.title}</h3>
        {video.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{video.description}</p>
        )}
      </div>
    </article>
  );
}
