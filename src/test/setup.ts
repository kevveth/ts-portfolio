import "@testing-library/jest-dom/vitest";

// jsdom has no media-query implementation. General UI tests use a light OS;
// theme-specific tests replace this with an explicitly controlled preference.
if (typeof window !== "undefined" && !window.matchMedia) {
	window.matchMedia = (media) =>
		Object.assign(new EventTarget(), {
			matches: false,
			media,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
		});
}
