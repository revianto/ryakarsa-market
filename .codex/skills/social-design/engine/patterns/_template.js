/* Starter for a new pattern. Copy to <name>.js (files starting with "_" are not loaded).
   - required: fields the validator enforces before rendering.
   - span: 2 = connected layout across two output images (see bridge.js).
   - cta: true if this pattern carries the carousel's single call to action.
   Use classes from base.css (.ss-title, .ss-text, .ss-hair, ...) and --c-* colors —
   never hard-code colors, so every brand's tokens apply. */
UC.register({
  name: 'example',
  description: 'What this layout is for, in one line',
  required: ['title'],
  optional: ['body', 'bg'],
  render(s, ctx) {
    return `<h1 class="ss-title">${UC.esc(s.title)}</h1>`;
  },
});
