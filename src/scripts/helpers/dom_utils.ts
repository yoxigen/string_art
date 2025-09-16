export function unHide(element: Element) {
  element.removeAttribute('hidden');
}

export function hide(element: Element) {
  element.setAttribute('hidden', 'hidden');
}

export function toggleHide(element: Element, isHidden?: boolean) {
  if (isHidden != null) {
    isHidden ? hide(element) : unHide(element);
  } else {
    if (element.hasAttribute('hidden')) {
      unHide(element);
    } else {
      hide(element);
    }
  }
}
