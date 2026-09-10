/**
 * Pose scoring engine.
 * Today: guided hold coach (camera mirror + silhouette).
 * Swap `estimatePoseMatch` with MediaPipe / TFLite landmarks later.
 */

import { PoseGuide } from '../data/media';

export type PoseSample = {
  /** 0..1 confidence that the dancer matches the guide */
  match: number;
  timestamp: number;
};

export function estimatePoseMatch(
  _guide: PoseGuide,
  heldRatio: number,
  steadiness: number,
): number {
  const held = Math.max(0, Math.min(1, heldRatio));
  const steady = Math.max(0, Math.min(1, steadiness));
  return Math.round((held * 0.65 + steady * 0.35) * 100);
}

export function aggregateSessionScore(scores: number[]): number {
  if (!scores.length) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round(sum / scores.length);
}
