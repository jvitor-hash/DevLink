export function scrollToPage( top: number = 0, behavior: ScrollBehavior = "smooth" ) {
  window.scrollTo({ top, behavior });
}

export function scrollToElement( element: HTMLElement | null, behavior: ScrollBehavior = "smooth") {
  element?.scrollIntoView({ behavior, block: "start" });
}