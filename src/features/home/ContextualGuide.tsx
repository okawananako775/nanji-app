import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { IconOnboarding } from "../../components/icons/Icons";
import styles from "./ContextualGuide.module.css";
import { useAnchorRect } from "./useAnchorRect";

const RING_SIZE = 40;
const TAIL_GAP = 4;
const BUBBLE_MAX_WIDTH = 360;
const DECOR_OVERHANG = 8;
const VIEWPORT_EDGE = 12;
const TAIL_SIZE = 14;
const TAIL_EDGE_INSET = 5;
/** 尻尾の先端が吹き出し端からはみ出す距離 */
const TAIL_TIP_EXTENT = (TAIL_SIZE / 2) * Math.SQRT2 - (TAIL_SIZE / 2 - TAIL_EDGE_INSET);

type GuidePlacement = "bottom" | "bottom-right" | "top" | "left";

interface ContextualGuideProps {
  targetRef: RefObject<HTMLElement | null>;
  message: string;
  placement?: GuidePlacement;
  active: boolean;
  onDismiss: () => void;
}

function getRingStyle(rect: DOMRect): CSSProperties {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return {
    left: centerX - RING_SIZE / 2,
    top: centerY - RING_SIZE / 2,
  };
}

function getBubbleMaxWidth(rect: DOMRect): number {
  return Math.min(
    BUBBLE_MAX_WIDTH,
    window.innerWidth - 24,
    rect.right - (VIEWPORT_EDGE + DECOR_OVERHANG),
  );
}

function getBubbleStyle(rect: DOMRect, placement: GuidePlacement): CSSProperties {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const ringRadius = RING_SIZE / 2;
  const maxWidth = getBubbleMaxWidth(rect);

  if (placement === "bottom-right") {
    const ringBottom = centerY + ringRadius;
    return {
      right: window.innerWidth - rect.right,
      top: ringBottom + TAIL_GAP + TAIL_TIP_EXTENT,
      maxWidth,
    };
  }

  if (placement === "top") {
    const ringTop = centerY - ringRadius;
    return {
      left: centerX,
      bottom: window.innerHeight - (ringTop - TAIL_GAP - TAIL_TIP_EXTENT),
      transform: "translateX(-50%)",
      maxWidth,
    };
  }

  if (placement === "left") {
    const ringLeft = centerX - ringRadius;
    return {
      right: window.innerWidth - (ringLeft - TAIL_GAP - TAIL_TIP_EXTENT),
      top: centerY,
      transform: "translateY(-50%)",
      maxWidth,
    };
  }

  const ringBottom = centerY + ringRadius;
  return {
    left: centerX,
    top: ringBottom + TAIL_GAP + TAIL_TIP_EXTENT,
    transform: "translateX(-50%)",
    maxWidth,
  };
}

export function ContextualGuide({
  targetRef,
  message,
  placement = "bottom",
  active,
  onDismiss,
}: ContextualGuideProps) {
  const { t } = useTranslation();
  const rect = useAnchorRect(targetRef, active);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubbleRect, setBubbleRect] = useState<DOMRect | null>(null);

  const ringStyle = useMemo(() => (rect ? getRingStyle(rect) : undefined), [rect]);
  const bubbleStyle = useMemo(
    () => (rect ? getBubbleStyle(rect, placement) : undefined),
    [rect, placement],
  );

  useLayoutEffect(() => {
    if (!active || !bubbleRef.current) {
      setBubbleRect(null);
      return;
    }

    const sync = () => {
      if (bubbleRef.current) {
        setBubbleRect(bubbleRef.current.getBoundingClientRect());
      }
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(bubbleRef.current);
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [active, message, placement, rect, bubbleStyle]);

  const tailLeft = useMemo(() => {
    if (!rect || !bubbleRect) return undefined;
    if (placement !== "bottom" && placement !== "bottom-right" && placement !== "top") return undefined;
    const ringCenterX = rect.left + rect.width / 2;
    return ringCenterX - bubbleRect.left;
  }, [rect, bubbleRect, placement]);

  const tailTop = useMemo(() => {
    if (!rect || !bubbleRect || placement !== "left") return undefined;
    const ringCenterY = rect.top + rect.height / 2;
    return ringCenterY - bubbleRect.top;
  }, [rect, bubbleRect, placement]);

  const tailStyle: CSSProperties | undefined = useMemo(() => {
    if (tailLeft !== undefined) {
      return { left: tailLeft };
    }
    if (tailTop !== undefined) {
      return { top: tailTop };
    }
    return undefined;
  }, [tailLeft, tailTop]);

  if (!active || !rect || !ringStyle || !bubbleStyle) return null;

  const tailClass =
    placement === "top"
      ? styles.bubbleTailBottom
      : placement === "left"
        ? styles.bubbleTailRight
        : styles.bubbleTailTop;

  return (
    <div className={styles.root} role="presentation">
      <button
        type="button"
        className={styles.backdrop}
        aria-label={t("guide.dismiss")}
        onClick={onDismiss}
      />
      <div className={styles.ring} style={ringStyle} aria-hidden />
      <div
        ref={bubbleRef}
        className={styles.bubble}
        style={bubbleStyle}
        role="dialog"
        aria-labelledby="contextual-guide-message"
        onClick={onDismiss}
      >
        <div className={`${styles.bubbleTail} ${tailClass}`} style={tailStyle} aria-hidden />
        <div className={styles.bubbleInner}>
          <div className={styles.decor} aria-hidden>
            <span className={styles.tipsLabel}>{t("guide.tips")}</span>
            <IconOnboarding className={styles.eyeIcon} aria-hidden />
          </div>
          <p id="contextual-guide-message" className={styles.message}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
