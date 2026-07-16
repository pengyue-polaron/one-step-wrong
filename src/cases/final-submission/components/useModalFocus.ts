"use client";

import { type RefObject, useEffect, useSyncExternalStore } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isFocusable(element: HTMLElement) {
  if (
    !element.matches(focusableSelector)
    || element.getAttribute("aria-disabled") === "true"
    || element.closest("[hidden], [inert], [aria-hidden='true']")
  ) {
    return false;
  }
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

function focusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(isFocusable);
}

function firstFocusableIn(elements: HTMLElement[]) {
  for (const element of elements) {
    if (isFocusable(element)) return element;
    const nested = focusableElements(element)[0];
    if (nested) return nested;
  }
  return null;
}

type ModalFocusOptions = {
  active: boolean;
  modalRef: RefObject<HTMLElement | null>;
  isolationRef: RefObject<HTMLElement | null>;
  initialFocusSelector: string;
  activeMediaQuery?: string;
  onEscape?: () => void;
};

export function useModalFocus({
  active,
  modalRef,
  isolationRef,
  initialFocusSelector,
  activeMediaQuery,
  onEscape,
}: ModalFocusOptions) {
  const mediaMatches = useSyncExternalStore(
    (onChange) => {
      if (!activeMediaQuery || typeof window.matchMedia !== "function") return () => undefined;
      const query = window.matchMedia(activeMediaQuery);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => !activeMediaQuery
      || typeof window.matchMedia !== "function"
      || window.matchMedia(activeMediaQuery).matches,
    () => true,
  );

  useEffect(() => {
    const activeMediaMatches = !activeMediaQuery
      || typeof window.matchMedia !== "function"
      || window.matchMedia(activeMediaQuery).matches;
    if (
      !active
      || !mediaMatches
      || !activeMediaMatches
      || !modalRef.current
      || !isolationRef.current
    ) {
      return;
    }

    const modal = modalRef.current;
    const isolationElement = isolationRef.current;
    const modalStyle = window.getComputedStyle(modal);
    const isolationStyle = window.getComputedStyle(isolationElement);
    if (
      modalStyle.display === "none"
      || modalStyle.visibility === "hidden"
      || isolationStyle.display === "none"
      || isolationStyle.visibility === "hidden"
    ) {
      return;
    }
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const backgroundElements = isolationElement.parentElement
      ? Array.from(isolationElement.parentElement.children)
        .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== isolationElement)
      : [];
    const backgroundState = backgroundElements.map((element) => ({
      element,
      hadInert: element.hasAttribute("inert"),
      ariaHidden: element.getAttribute("aria-hidden"),
    }));

    backgroundElements.forEach((element) => {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    });

    const initialFocus = modal.querySelector<HTMLElement>(initialFocusSelector);
    if (initialFocus && isFocusable(initialFocus)) {
      initialFocus.focus();
    } else {
      modal.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        event.stopPropagation();
        onEscape();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = focusableElements(modal);
      if (focusable.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1)!;
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !modal.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !modal.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      backgroundState.forEach(({ element, hadInert, ariaHidden }) => {
        if (!hadInert) element.removeAttribute("inert");
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });

      if (
        previouslyFocused
        && previouslyFocused !== document.body
        && previouslyFocused.isConnected
        && !previouslyFocused.closest("[inert]")
      ) {
        previouslyFocused.focus();
        return;
      }

      queueMicrotask(() => {
        firstFocusableIn(backgroundElements)?.focus();
      });
    };
  }, [active, activeMediaQuery, initialFocusSelector, isolationRef, mediaMatches, modalRef, onEscape]);
}
