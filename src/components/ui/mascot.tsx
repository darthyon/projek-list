import type * as React from "react";
import { cn } from "@/lib/utils";
import { WRITING_PATHS } from "./mascot-writing-paths";

/**
 * The mascot — one deadpan line-art character, five poses, each with one job.
 * Approved surfaces only (see DESIGN.md "Mascot"). Always decorative, never animated.
 * Drawn on a 64-unit grid, stroke 3, recolored via --mascot (cobalt light / pale blue dark).
 */
export type MascotPose = "writing" | "pointing" | "clap" | "arms-crossed" | "peeking";

interface MascotProps extends React.ComponentProps<"svg"> {
  pose: MascotPose;
}

/* Shared face so the deadpan expression never drifts between poses.
   Half-lidded eyes: flat top lid, bowl below, pupil hanging from the lid.
   `s` scales features while keeping rendered stroke weight at 3. */
function Face({ x, y, s = 1, mouth = true }: { x: number; y: number; s?: number; mouth?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={2.25 / s}>
      {/* brows */}
      <path d="M-9.5 -6.5 l5 -1" />
      <path d="M4.5 -7.5 l5 1" />
      {/* left eye: lid + bowl + pupil */}
      <path d="M-11 -1.5 h9" />
      <path d="M-11 -1.5 a4.5 4.5 0 0 0 9 0" />
      <circle cx={-6.5} cy={-0.2} r={1.2} fill="currentColor" stroke="none" />
      {/* right eye */}
      <path d="M2 -1.5 h9" />
      <path d="M2 -1.5 a4.5 4.5 0 0 0 9 0" />
      <circle cx={6.5} cy={-0.2} r={1.2} fill="currentColor" stroke="none" />
      {mouth && <path d="M-2 6.5 h5" />}
    </g>
  );
}

const VIEWBOX: Record<MascotPose, string> = {
  writing: "0 0 765 801",
  pointing: "0 0 64 64",
  clap: "0 0 64 64",
  "arms-crossed": "0 0 64 64",
  peeking: "0 0 64 36",
};

const POSES: Record<MascotPose, React.ReactNode> = {
  /* Hunched over a checklist, pencil down. Home hero.
     Hand-made by Yon (img-list.svg) — fill-based outline paths, not strokes. */
  writing: (
    <g fill="currentColor" stroke="none">
      {WRITING_PATHS.map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </g>
  ),
  /* Lazy lean, arm out. Checklist empty state — points at the add bar below. */
  pointing: (
    <>
      <circle cx={24} cy={15} r={13} />
      <Face x={24} y={16} />
      {/* blob body, leaning into the point */}
      <path d="M13 22 c-6 9 -7 21 -1 28 c4 5 10 5 14 1" />
      <path d="M35 23 c2 3 3 6 3.5 9" />
      {/* pointing arm, angled down toward the composer */}
      <path d="M37 33 c6 1 11 3 15.5 5.5" />
      <path d="M49 36 c2.5 1 4.5 2.5 5.5 4.5" strokeWidth={2.25} />
      {/* limp arm with lazy fingers */}
      <path d="M14 35 c-2 4 -1.5 8 1.5 11" />
      <path d="M16 46.5 l1 2.5 M18.5 46.5 l0.3 2.5" strokeWidth={2} />
    </>
  ),
  /* Deadpan clap. Trip summary. */
  clap: (
    <>
      <circle cx={28} cy={16} r={13} />
      <Face x={28} y={17} />
      {/* shoulders */}
      <path d="M16 26 c-5 7 -7 14 -7 22" />
      <path d="M40 26 c3 5 4.5 10 4.5 15" />
      {/* arms meeting, hands together */}
      <path d="M9 45 c7 3 14 2 19 -3" />
      <path d="M28 42 c2 -3 5 -5 8 -5.5" />
      {/* fingers */}
      <path d="M33 39 c1.5 -2 3.5 -3.5 6 -4 M35 42 c2 -2 4.5 -3.5 7 -4" strokeWidth={2.25} />
      {/* clap ticks */}
      <path d="M46 27 l4 -3 M49 34 h5 M47 41 l4 3" strokeWidth={2.5} />
    </>
  ),
  /* Arms crossed, waiting for you to decide. Archive dialog. */
  "arms-crossed": (
    <>
      <circle cx={32} cy={14} r={12.5} />
      <Face x={32} y={15} />
      {/* torso */}
      <path d="M22 24 c-5 8 -7 17 -6 26" />
      <path d="M42 24 c5 8 7 17 6 26" />
      {/* crossed arms */}
      <path d="M17 35 c9 7 21 7 30 -1" />
      <path d="M47 40 c-9 -7 -21 -7 -30 1" />
      {/* tucked fingers */}
      <path d="M38 34 c1.5 1 3 1.5 5 1.5 M38 37.5 c1.5 1 3 1.5 5 1.5" strokeWidth={2} />
      {/* stubby legs */}
      <path d="M27 50 v8 M37 50 v8" />
    </>
  ),
  /* Top of head over an edge. Shop Mode total dock. */
  peeking: (
    <>
      <path d="M6 36 c0 -17 11.5 -27 26 -27 s26 10 26 27" />
      <Face x={32} y={27} s={1.5} mouth={false} />
    </>
  ),
};

export function Mascot({ pose, className, ...props }: MascotProps) {
  return (
    <svg
      viewBox={VIEWBOX[pose]}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0 text-mascot", className)}
      {...props}
    >
      {POSES[pose]}
    </svg>
  );
}
