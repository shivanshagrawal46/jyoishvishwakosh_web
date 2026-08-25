import { useEffect } from 'react'

/**
 * Blocks the ordinary routes for lifting content off the site: the right-click
 * menu, copy and cut, and dragging an image out of the page.
 *
 * Form fields are exempt — a visitor still has to be able to type, select and
 * paste into the birth-detail and search inputs.
 *
 * This deters casual copying only. Anyone willing to open devtools or read the
 * page source can still take the text, and search engines are unaffected.
 */
const EVENTS = ['contextmenu', 'copy', 'cut', 'dragstart']

const inEditableField = (target) =>
  target instanceof Element &&
  target.closest('input, textarea, select, [contenteditable="true"]') !== null

export default function useContentGuard() {
  useEffect(() => {
    const block = (event) => {
      if (inEditableField(event.target)) return
      event.preventDefault()
    }

    EVENTS.forEach((type) => document.addEventListener(type, block))
    return () => EVENTS.forEach((type) => document.removeEventListener(type, block))
  }, [])
}
