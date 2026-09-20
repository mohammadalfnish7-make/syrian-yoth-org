import { useRef, useCallback, type RefObject } from "react";

const DRAG_THRESHOLD_PX = 6;

type DragState = {
  active: boolean;
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  dragged: boolean;
  captured: boolean;
};

/**
 * Lightweight drag-to-scroll for horizontal overflow containers.
 * Uses native scrollLeft (browser-optimized) + Pointer Events (mouse/touch/pen).
 * Avoids per-frame React state updates for smooth 60fps dragging.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  const state = useRef<DragState>({
    active: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    dragged: false,
    captured: false,
  });

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      const element = ref.current;
      if (!element) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      state.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startScrollLeft: element.scrollLeft,
        dragged: false,
        captured: false,
      };
    },
    [ref]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const element = ref.current;
      const drag = state.current;
      if (!element || !drag.active || event.pointerId !== drag.pointerId) return;

      const deltaX = event.clientX - drag.startX;
      if (!drag.dragged && Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
        drag.dragged = true;
        drag.captured = true;
        element.setPointerCapture(event.pointerId);
        element.classList.add("drag-scroll--active");
      }

      if (drag.dragged) {
        event.preventDefault();
        const isRtl = getComputedStyle(element).direction === "rtl";
        element.scrollLeft = drag.startScrollLeft + (isRtl ? deltaX : -deltaX);
      }
    },
    [ref]
  );

  const endDrag = useCallback(
    (event: React.PointerEvent) => {
      const element = ref.current;
      const drag = state.current;
      if (!element || !drag.active || event.pointerId !== drag.pointerId) return;

      drag.active = false;
      if (drag.captured) {
        element.releasePointerCapture(event.pointerId);
        element.classList.remove("drag-scroll--active");
        drag.captured = false;
      }
    },
    [ref]
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      endDrag(event);
    },
    [endDrag]
  );

  const onPointerCancel = useCallback(
    (event: React.PointerEvent) => {
      endDrag(event);
    },
    [endDrag]
  );

  const consumeClick = useCallback(() => {
    const wasDrag = state.current.dragged;
    state.current.dragged = false;
    return wasDrag;
  }, []);

  return {
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
    consumeClick,
  };
}
