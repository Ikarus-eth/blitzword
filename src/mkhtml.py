#!/usr/bin/env python3
"""Inline a built bundle into the deployable index.html.
Usage: python3 src/mkhtml.py <bundle.js> <out index.html>"""
import sys
bundle = open(sys.argv[1], encoding="utf-8").read().replace("</script", "<\\/script")
TPL = """<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no" />
<title>BlitzWort</title>
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="BlitzWort" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#EDF5FC" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
<link rel="icon" href="icon-512.png" />
<link rel="manifest" href="manifest.json" />
<style>
  html, body { height: 100%; margin: 0; padding: 0; background: #EDF5FC;
    overscroll-behavior: none; -webkit-user-select: none; user-select: none; }
  #root { min-height: 100dvh; }
  * { -webkit-touch-callout: none; }
</style>
</head>
<body>
<div id="root"></div>
<script>
window.addEventListener('error', function (e) {
  var el = document.getElementById('root');
  if (el && !el.children.length) {
    el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100dvh;font-family:sans-serif;color:#22314A;padding:24px;text-align:center;">Etwas ist beim Laden schiefgelaufen. Bitte Seite neu laden.</div>';
  }
});
</script>
<script>
__BUNDLE__
</script>
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
      reg.update().catch(function () {});
    }).catch(function () {});
  });
}
</script>
</body>
</html>
"""
open(sys.argv[2], "w", encoding="utf-8").write(TPL.replace("__BUNDLE__", bundle))
print("wrote", sys.argv[2])
