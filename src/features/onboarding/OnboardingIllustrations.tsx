import type { ReactNode, SVGProps } from "react";

type IllustrationProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

function IllustrationFrame({ title, children, ...props }: IllustrationProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden={!title} aria-label={title} {...props}>
      <rect width="320" height="200" rx="16" fill="var(--color-surface-control-tag)" />
      {children}
    </svg>
  );
}

/** 現在地取得 — 地図ピンとタイムゾーン */
export function LocationIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <circle cx="160" cy="92" r="52" stroke="var(--color-border-default)" strokeWidth="1.5" strokeDasharray="4 6" />
      <circle cx="160" cy="92" r="34" stroke="var(--color-border-strong)" strokeWidth="1.5" opacity="0.35" />
      <path
        d="M160 52c-14.36 0-26 11.64-26 26 0 19.5 26 46 26 46s26-26.5 26-46c0-14.36-11.64-26-26-26Z"
        fill="var(--color-surface-control-primary)"
      />
      <circle cx="160" cy="78" r="8" fill="var(--color-surface-elevated)" />
      <rect x="118" y="138" width="84" height="34" rx="17" fill="var(--color-surface-elevated)" stroke="var(--color-border-default)" />
      <circle cx="136" cy="155" r="6" fill="var(--color-timeslot-business-active)" />
      <rect x="150" y="149" width="40" height="6" rx="3" fill="var(--color-border-default)" />
      <rect x="150" y="159" width="28" height="4" rx="2" fill="var(--color-border-default)" opacity="0.6" />
    </IllustrationFrame>
  );
}

/** ツアー1 — タイムライン */
export function TimelineIllustration(props: IllustrationProps) {
  const columns = [
    { x: 52, label: "TYO", slots: ["#d8dfe9", "#eff0a4", "#eff0a4", "#d8dfe9"] },
    { x: 128, label: "LDN", slots: ["#374069", "#374069", "#d8dfe9", "#eff0a4"] },
    { x: 204, label: "NYC", slots: ["#374069", "#374069", "#374069", "#d8dfe9"] },
  ];

  return (
    <IllustrationFrame {...props}>
      {columns.map((col) => (
        <g key={col.label}>
          <rect x={col.x} y="36" width="64" height="128" rx="12" fill="var(--color-surface-elevated)" stroke="var(--color-border-default)" />
          <text x={col.x + 32} y="54" textAnchor="middle" fill="var(--color-text-primary)" fontSize="11" fontWeight="600" fontFamily="var(--font-ui)">
            {col.label}
          </text>
          {col.slots.map((fill, i) => (
            <rect key={i} x={col.x + 8} y={62 + i * 24} width="48" height="18" rx="6" fill={fill} />
          ))}
        </g>
      ))}
      <line x1="28" y1="98" x2="292" y2="98" stroke="var(--color-accent-current-time)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="98" r="4" fill="var(--color-accent-current-time)" />
    </IllustrationFrame>
  );
}

/** ツアー2 — 都市タグ */
export function CitiesIllustration(props: IllustrationProps) {
  const tags = [
    { x: 40, w: 72, active: true },
    { x: 120, w: 68, active: false },
    { x: 196, w: 84, active: false },
    { x: 72, y: 118, w: 76, active: false },
    { x: 158, y: 118, w: 90, active: false },
  ];

  return (
    <IllustrationFrame {...props}>
      <rect x="24" y="72" width="272" height="56" rx="28" fill="var(--color-surface-elevated)" stroke="var(--color-border-default)" />
      {tags.map((tag, i) => (
        <rect
          key={i}
          x={tag.x}
          y={tag.y ?? 88}
          width={tag.w}
          height="24"
          rx="12"
          fill={tag.active ? "var(--color-surface-control-primary)" : "transparent"}
          stroke={tag.active ? "none" : "var(--color-border-default)"}
        />
      ))}
      <circle cx="48" cy="100" r="5" fill={tags[0]!.active ? "var(--color-timeslot-business-active)" : "var(--color-border-default)"} />
      <rect x="62" y="96" width="36" height="8" rx="4" fill={tags[0]!.active ? "var(--color-text-on-primary)" : "var(--color-border-default)"} opacity={tags[0]!.active ? 1 : 0.7} />
      <rect x="132" y="96" width="44" height="8" rx="4" fill="var(--color-border-default)" opacity="0.7" />
      <rect x="214" y="96" width="52" height="8" rx="4" fill="var(--color-border-default)" opacity="0.7" />
      <rect x="88" y="126" width="48" height="8" rx="4" fill="var(--color-border-default)" opacity="0.7" />
      <rect x="174" y="126" width="58" height="8" rx="4" fill="var(--color-border-default)" opacity="0.7" />
      <g transform="translate(248 84)">
        <circle cx="12" cy="12" r="12" fill="var(--color-surface-control-primary)" />
        <path d="M12 7v10M7 12h10" stroke="var(--color-text-on-primary)" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </IllustrationFrame>
  );
}

/** ツアー3 — グループ */
export function GroupsIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <rect x="48" y="58" width="108" height="88" rx="14" fill="var(--color-surface-elevated)" stroke="var(--color-border-default)" />
      <rect x="68" y="48" width="108" height="88" rx="14" fill="var(--color-surface-elevated)" stroke="var(--color-border-strong)" />
      <rect x="88" y="68" width="144" height="88" rx="14" fill="var(--color-surface-elevated)" stroke="var(--color-border-default)" />
      <rect x="104" y="84" width="52" height="18" rx="9" fill="var(--color-surface-control-primary)" />
      <rect x="164" y="84" width="52" height="18" rx="9" fill="var(--color-border-default)" opacity="0.45" />
      <rect x="104" y="110" width="44" height="18" rx="9" fill="var(--color-border-default)" opacity="0.45" />
      <rect x="154" y="110" width="62" height="18" rx="9" fill="var(--color-border-default)" opacity="0.45" />
      <rect x="104" y="136" width="38" height="8" rx="4" fill="var(--color-text-on-primary)" opacity="0.85" />
      <circle cx="236" cy="132" r="16" fill="var(--color-surface-control-primary)" />
      <path d="M236 125v14M229 132h14" stroke="var(--color-text-on-primary)" strokeWidth="1.6" strokeLinecap="round" />
    </IllustrationFrame>
  );
}

/** ツアー4 — コピー */
export function CopyIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <rect x="72" y="44" width="176" height="112" rx="14" fill="var(--color-surface-elevated)" stroke="var(--color-border-default)" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x="88" y={58 + row * 28} width="48" height="18" rx="6" fill="var(--color-border-default)" opacity="0.35" />
          <rect x="144" y={58 + row * 28} width="88" height="18" rx="6" fill={row === 1 ? "var(--color-timeslot-business-active)" : "var(--color-timeslot-business-inactive)"} />
        </g>
      ))}
      <rect x="144" y="86" width="88" height="18" rx="6" fill="var(--color-surface-control-primary)" opacity="0.15" stroke="var(--color-surface-control-primary)" strokeWidth="1.5" />
      <circle cx="188" cy="95" r="14" fill="var(--color-surface-control-primary)" opacity="0.12" />
      <circle cx="188" cy="95" r="20" stroke="var(--color-surface-control-primary)" strokeWidth="1.5" opacity="0.25" />
      <rect x="182" y="88" width="12" height="14" rx="2" fill="none" stroke="var(--color-surface-control-primary)" strokeWidth="1.5" />
      <path d="M186 92h6v8h-6z" fill="var(--color-surface-control-primary)" opacity="0.5" />
    </IllustrationFrame>
  );
}

export type OnboardingIllustrationId = "location" | "tour1" | "tour2" | "tour3" | "tour4";

const ILLUSTRATIONS: Record<OnboardingIllustrationId, typeof LocationIllustration> = {
  location: LocationIllustration,
  tour1: TimelineIllustration,
  tour2: CitiesIllustration,
  tour3: GroupsIllustration,
  tour4: CopyIllustration,
};

export function OnboardingIllustration({ id, title }: { id: OnboardingIllustrationId; title: string }) {
  const Component = ILLUSTRATIONS[id];
  return <Component title={title} />;
}
