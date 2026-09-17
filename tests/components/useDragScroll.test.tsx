import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useDragScroll } from "@/hooks/useDragScroll";

function mockPointerEvent(
  type: "pointerdown" | "pointermove" | "pointerup",
  element: HTMLElement,
  init: { clientX?: number; pointerId?: number } = {}
) {
  return {
    type,
    pointerType: "mouse",
    button: 0,
    pointerId: init.pointerId ?? 1,
    clientX: init.clientX ?? 0,
    currentTarget: element,
    preventDefault: vi.fn(),
  } as unknown as ReactPointerEvent;
}

describe("useDragScroll", () => {
  beforeEach(() => {
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
  });

  it("scrolls the container when pointer moves past threshold", () => {
    const element = document.createElement("div");
    Object.defineProperty(element, "scrollLeft", {
      writable: true,
      value: 100,
    });
    element.setPointerCapture = vi.fn();
    element.releasePointerCapture = vi.fn();

    const ref = { current: element };
    const { result } = renderHook(() => useDragScroll(ref));

    act(() => {
      result.current.dragHandlers.onPointerDown(
        mockPointerEvent("pointerdown", element, { clientX: 200, pointerId: 5 })
      );
    });

    const moveEvent = mockPointerEvent("pointermove", element, {
      clientX: 150,
      pointerId: 5,
    });

    act(() => {
      result.current.dragHandlers.onPointerMove(moveEvent);
    });

    expect(element.scrollLeft).toBe(150);
    expect(moveEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.consumeClick()).toBe(true);
  });

  it("does not treat small movement as a drag click", () => {
    const element = document.createElement("div");
    Object.defineProperty(element, "scrollLeft", {
      writable: true,
      value: 0,
    });
    element.setPointerCapture = vi.fn();
    element.releasePointerCapture = vi.fn();

    const ref = { current: element };
    const { result } = renderHook(() => useDragScroll(ref));

    act(() => {
      result.current.dragHandlers.onPointerDown(
        mockPointerEvent("pointerdown", element, { clientX: 100 })
      );
      result.current.dragHandlers.onPointerUp(
        mockPointerEvent("pointerup", element, { clientX: 103 })
      );
    });

    expect(result.current.consumeClick()).toBe(false);
  });
});
