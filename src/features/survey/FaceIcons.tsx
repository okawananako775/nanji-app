import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function FaceBase({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" fill="none" aria-hidden {...props}>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
      {children}
    </svg>
  );
}

/** 1 — Very bad (X eyes) */
export function FaceVeryBad(props: IconProps) {
  return (
    <FaceBase {...props}>
      <path d="M16 18 L20 22 M20 18 L16 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 18 L32 22 M32 18 L28 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 33 Q24 28 30 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </FaceBase>
  );
}

/** 2 — Bad */
export function FaceBad(props: IconProps) {
  return (
    <FaceBase {...props}>
      <circle cx="18" cy="20" r="1.6" fill="currentColor" />
      <circle cx="30" cy="20" r="1.6" fill="currentColor" />
      <path d="M18 32 Q24 28 30 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </FaceBase>
  );
}

/** 3 — Neutral */
export function FaceNeutral(props: IconProps) {
  return (
    <FaceBase {...props}>
      <circle cx="18" cy="20" r="1.6" fill="currentColor" />
      <circle cx="30" cy="20" r="1.6" fill="currentColor" />
      <path d="M18 32 H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </FaceBase>
  );
}

/** 4 — Good */
export function FaceGood(props: IconProps) {
  return (
    <FaceBase {...props}>
      <circle cx="18" cy="20" r="1.6" fill="currentColor" />
      <circle cx="30" cy="20" r="1.6" fill="currentColor" />
      <path d="M18 31 Q24 36 30 31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </FaceBase>
  );
}

/** 5 — Very good (happy eyes) */
export function FaceVeryGood(props: IconProps) {
  return (
    <FaceBase {...props}>
      <path d="M15 21 Q18 17 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M27 21 Q30 17 33 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M17 30 Q24 38 31 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </FaceBase>
  );
}

export const FACE_ICONS = [FaceVeryBad, FaceBad, FaceNeutral, FaceGood, FaceVeryGood] as const;
