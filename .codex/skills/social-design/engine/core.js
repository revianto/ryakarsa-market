/* Browser-side core: pattern registry, escaping, chrome, and slide rendering.
   Pattern files call UC.register({ name, required, span, cta, render(slide, ctx) }).
   render() returns the HTML for the content area only — chrome (wordmark,
   handle, swipe) is added here so it sits at identical coordinates on every slide. */
(function () {
  const PATTERNS = {};

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function register(p) { PATTERNS[p.name] = p; }

  // Image from the brand folder, or a loud placeholder — never a fake photo.
  function image(ctx, src, alt) {
    if (!src) return `<div class="ss-placeholder">[FOTO — ${esc(alt || 'isi dengan foto asli')}]</div>`;
    return `<img src="${esc(ctx.assetBase + src)}" alt="${esc(alt || '')}">`;
  }

  function canvasVars(ctx, widthMultiplier) {
    const f = ctx.format;
    const u = f.width / 1080;
    const padTop = Math.max(f.margin, f.safeTop);
    const footBottom = Math.max(f.margin, f.safeBottom > 0 ? Math.min(f.safeBottom, f.margin + 20) : f.margin);
    // Content must end above the safe zone, and above the footer row.
    const footerTop = footBottom + 40 * u + 24 * u;
    const bodyClear = Math.max(f.safeBottom, footerTop) - f.margin;
    return [
      `--w:${f.width * widthMultiplier}px`, `--h:${f.height}px`, `--u:${u}px`, `--m:${f.margin}px`,
      `--pad-top:${padTop}px`, `--pad-bottom:${f.margin}px`, `--foot-bottom:${footBottom}px`,
      `--body-clear:${Math.max(0, bodyClear)}px`,
      `--display-weight:${ctx.type.displayWeight}`, `--body-weight:${ctx.type.bodyWeight}`,
    ].join(';');
  }

  // A slide over a photo (pattern "photo") can override chrome color, since
  // legibility there depends on the image, not the brand token for this ground.
  // A CSS custom property, not `color` directly: every chrome element (.ss-wordmark,
  // .ss-handle, .ss-swipe, .ss-link) already sets its own `color` from the brand tokens,
  // so a `color` on this wrapping <header>/<footer> would never inherit down to them —
  // inheritance only fills in a property a descendant leaves unset. var(--chrome-color, X)
  // in each of those rules lets this override win when present, X apply otherwise.
  function chromeStyle(slide) {
    if (slide.chromeOn === 'light') return 'style="--chrome-color:#FFFFFF"';
    if (slide.chromeOn === 'dark') return 'style="--chrome-color:#1A1A1A"';
    return '';
  }

  function chromeHead(ctx, slide = {}) {
    const handle = ctx.chrome.showHandle && ctx.brand.handle
      ? `<span class="ss-handle">${esc(ctx.brand.handle)}</span>` : '<span></span>';
    return `<header class="ss-head" ${chromeStyle(slide)}><span class="ss-wordmark">${esc(ctx.brand.wordmark || ctx.brand.name)}</span>${handle}</header>`;
  }

  function chromeFoot(ctx, slide) {
    const swipe = ctx.showSwipe ? `<span class="ss-swipe ss-label">${esc(ctx.chrome.swipeLabel)}</span>` : '<span></span>';
    const link = slide.link ? `<span class="ss-link">${esc(slide.link)}</span>` : '<span></span>';
    return `<footer class="ss-foot" ${chromeStyle(slide)}>${swipe}${link}</footer>`;
  }

  // Renders one deck slide (which may span several output images) into #stage.
  function renderSlide(slide, ctx) {
    const p = PATTERNS[slide.pattern];
    if (!p) throw new Error(`Unknown pattern "${slide.pattern}"`);
    const span = p.span || 1;
    const alt = slide.bg === 'alt' ? ' ss-alt' : '';
    const stage = document.getElementById('stage');

    if (span === 1) {
      stage.innerHTML =
        `<section class="ss-canvas${alt}" style="${canvasVars(ctx, 1)}">` +
        chromeHead(ctx, slide) + `<div class="ss-body">${p.render(slide, ctx)}</div>` + chromeFoot(ctx, slide) +
        `</section>`;
      return;
    }
    // Connected layout: one wide canvas; chrome repeats per output-width segment
    // so the wordmark/handle/swipe keep their coordinates on each cut image.
    const f = ctx.format;
    const chromeSegments = Array.from({ length: span }, (_, i) =>
      `<div style="position:absolute;top:0;left:${i * f.width}px;width:${f.width}px;height:${f.height}px;` +
      `padding:${Math.max(f.margin, f.safeTop)}px ${f.margin}px;pointer-events:none">` +
      chromeHead(ctx, slide) + chromeFoot({ ...ctx, showSwipe: ctx.showSwipe || i < span - 1 }, slide) + `</div>`
    ).join('');
    stage.innerHTML =
      `<section class="ss-canvas${alt}" style="${canvasVars(ctx, span)};padding:0">` +
      p.render(slide, ctx) + chromeSegments + `</section>`;
  }

  window.UC = { register, renderSlide, esc, image, PATTERNS };
})();
