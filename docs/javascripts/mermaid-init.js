// Render ```mermaid fenced code blocks client-side.
// MkDocs readthedocs theme outputs fenced code as:
//   <pre><code class="language-mermaid">...</code></pre>
// We convert those to <div class="mermaid"> before mermaid.js runs,
// but AFTER highlight.js (hljs) may have already touched them.
document.addEventListener("DOMContentLoaded", function () {
  if (!window.mermaid) return;
  mermaid.initialize({ startOnLoad: false, theme: "default" });

  // Collect raw mermaid source BEFORE hljs mangles the textContent.
  // Use the original textContent (hljs adds <span> tags but textContent
  // still returns the concatenated text — which is the raw diagram source).
  var blocks = document.querySelectorAll("pre code.language-mermaid");
  blocks.forEach(function (block) {
    var pre = block.parentElement;
    var div = document.createElement("div");
    div.className = "mermaid";
    div.textContent = block.textContent; // decode HTML entities automatically
    pre.replaceWith(div);
  });

  // Zoom styles
  var style = document.createElement("style");
  style.textContent =
    ".mermaid-wrap{display:block;text-align:center;margin:12px 0;}" +
    ".mermaid-wrap svg{cursor:zoom-in;}" +
    ".mermaid-hint{display:block;font-size:11px;color:#999;margin-top:4px;user-select:none;}";
  document.head.appendChild(style);

  // After render, attach click-to-open-in-new-tab on each diagram
  function attachZoom() {
    document.querySelectorAll(".mermaid:not(.mz)").forEach(function (div) {
      div.classList.add("mz");

      // Wrap
      var wrap = document.createElement("div");
      wrap.className = "mermaid-wrap";
      div.parentNode.insertBefore(wrap, div);
      wrap.appendChild(div);

      // Hint label
      var hint = document.createElement("span");
      hint.className = "mermaid-hint";
      hint.textContent = "🔍 Click để mở phóng to";
      wrap.appendChild(hint);

      // Click: serialize SVG → Blob URL → new tab
      wrap.addEventListener("click", function () {
        var svg = div.querySelector("svg");
        if (!svg) return;
        var svgStr = new XMLSerializer().serializeToString(svg);
        // Ensure xmlns so browser renders as image/svg+xml
        if (!svgStr.includes("xmlns=")) {
          svgStr = svgStr.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        var blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        // Revoke after a short delay so the new tab has time to load it
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      });
    });
  }

  var p = mermaid.run();
  if (p && typeof p.then === "function") {
    p.then(attachZoom);
  } else {
    setTimeout(attachZoom, 800);
  }
});
