/* @ds-bundle: {"format":4,"namespace":"KidoKidoUser","components":[{"name":"Icon"},{"name":"Button"},{"name":"TextField"},{"name":"Select"},{"name":"SearchBar"},{"name":"Checkbox"},{"name":"Radio"},{"name":"Badge"},{"name":"Pagination"},{"name":"PageHeader"},{"name":"Breadcrumb"},{"name":"SideNav"},{"name":"AppHeader"},{"name":"AppShell"},{"name":"Card"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }

  /* Icon — path lay nguyen tu SVG inline tren website (MUI icons + icon rieng) */
  var ICONS = {
    "arrow-drop-down": { vb: "0 0 24 24", d: ["M7 10l5 5 5-5z"] },
    "visibility": { vb: "0 0 24 24", d: ["M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"] },
    "radio-unchecked": { vb: "0 0 24 24", d: ["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"] },
    "radio-checked": { vb: "0 0 24 24", d: ["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z", "M8.465 8.465C9.37 7.56 10.62 7 12 7C14.76 7 17 9.24 17 12C17 13.38 16.44 14.63 15.535 15.535C14.63 16.44 13.38 17 12 17C9.24 17 7 14.76 7 12C7 10.62 7.56 9.37 8.465 8.465Z"] },
    "navigate-before": { vb: "0 0 24 24", d: ["M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"] },
    "navigate-next": { vb: "0 0 24 24", d: ["M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"] },
    "favorite-border": { vb: "0 0 24 24", d: ["M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"] },
    "checkbox": { vb: "0 0 24 24", d: ["M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"] },
    "new-window": { vb: "0 0 10 10", d: ["M2.085 1C2.18844 0.707422 2.38008 0.454129 2.63351 0.275028C2.88694 0.0959278 3.18967 -0.00016248 3.5 2.06237e-07H7C7.79565 2.06237e-07 8.55871 0.316071 9.12132 0.87868C9.68393 1.44129 10 2.20435 10 3V6.5C10.0002 6.81033 9.90407 7.11306 9.72497 7.36649C9.54587 7.61992 9.29258 7.81156 9 7.915V3C9 2.46957 8.78929 1.96086 8.41421 1.58579C8.03914 1.21071 7.53043 1 7 1H2.085ZM1.5 2H6.5C6.89782 2 7.27936 2.15804 7.56066 2.43934C7.84196 2.72064 8 3.10218 8 3.5V8.5C8 8.89782 7.84196 9.27936 7.56066 9.56066C7.27936 9.84196 6.89782 10 6.5 10H1.5C1.10218 10 0.720644 9.84196 0.43934 9.56066C0.158035 9.27936 0 8.89782 0 8.5V3.5C0 3.10218 0.158035 2.72064 0.43934 2.43934C0.720644 2.15804 1.10218 2 1.5 2ZM1.5 3C1.36739 3 1.24021 3.05268 1.14645 3.14645C1.05268 3.24022 1 3.36739 1 3.5V8.5C1 8.63261 1.05268 8.75979 1.14645 8.85355C1.24021 8.94732 1.36739 9 1.5 9H6.5C6.63261 9 6.75979 8.94732 6.85355 8.85355C6.94732 8.75979 7 8.63261 7 8.5V3.5C7 3.36739 6.94732 3.24022 6.85355 3.14645C6.75979 3.05268 6.63261 3 6.5 3H1.5Z"] },
    "calendar": { vb: "0 0 25 24", stroke: ["M8.5 2V5", "M16.5 2V5", "M4 9.09009H21", "M21.5 8.5V17C21.5 20 20 22 16.5 22H8.5C5 22 3.5 20 3.5 17V8.5C3.5 5.5 5 3.5 8.5 3.5H16.5C20 3.5 21.5 5.5 21.5 8.5Z"], dots: ["M16.1937 13.7H16.2027", "M16.1937 16.7H16.2027", "M12.4945 13.7H12.5035", "M12.4945 16.7H12.5035", "M8.79529 13.7H8.80427", "M8.79529 16.7H8.80427"] },
    "circular-progress": { vb: "22 22 44 44", circle: true }
  };

  function Icon(p) {
    var def = ICONS[p.name];
    if (!def) return null;
    var size = p.size || 24;
    var kids = [];
    if (def.circle) {
      kids.push(h("circle", { key: "c", cx: 44, cy: 44, r: 20.2, fill: "none", stroke: "currentColor", strokeWidth: 3.6 }));
    } else if (def.stroke) {
      def.stroke.forEach(function (d, i) { kids.push(h("path", { key: "s" + i, d: d, fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" })); });
      def.dots.forEach(function (d, i) { kids.push(h("path", { key: "d" + i, d: d, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" })); });
    } else {
      def.d.forEach(function (d, i) { kids.push(h("path", { key: i, d: d, fill: "currentColor" })); });
    }
    return h("svg", {
      className: cx("kk-icon", p.className), width: size, height: size, viewBox: def.vb,
      role: p.label ? "img" : undefined, "aria-label": p.label, "aria-hidden": p.label ? undefined : true
    }, kids);
  }

  function Button(p) {
    var variant = p.disabled ? "disabled" : (p.variant || "solid");
    return h("button", {
      type: p.type || "button", className: cx("kk-btn", "kk-btn--" + (p.size || "md"), "kk-btn--" + variant),
      disabled: p.disabled, onClick: p.onClick, style: p.width ? { width: p.width } : undefined
    }, p.icon ? h(Icon, { name: p.icon, size: 20 }) : null, p.children,
      p.trailingIcon ? h("span", { className: "kk-btn__trail" }, h(Icon, { name: p.trailingIcon, size: 24 })) : null);
  }

  function FieldShell(p, box) {
    return h("label", { className: "kk kk-field" },
      p.label ? h("span", { className: "kk-field__label" }, p.label, p.required ? h("span", { className: "kk-field__req" }, "[必須]") : null) : null,
      p.hint ? h("span", { className: "kk-field__hint" }, p.hint) : null,
      box,
      p.error ? h("span", { className: "kk-field__error" }, p.error) : null);
  }

  function TextField(p) {
    var box = h("span", { className: cx("kk-field__box", p.error && "kk-field__box--error") },
      h("input", { className: "kk-field__input", type: p.type || "text", placeholder: p.placeholder, defaultValue: p.value, onChange: p.onChange }),
      p.type === "password" ? h("span", { className: "kk-field__icon" }, h(Icon, { name: "visibility", size: 20, label: "パスワードを表示" })) : null,
      p.type === "date" ? h("span", { className: "kk-field__icon" }, h(Icon, { name: "calendar", size: 20 })) : null);
    return FieldShell(p, box);
  }

  function Select(p) {
    var box = h("span", { className: cx("kk-field__box", "kk-field__box--select", p.error && "kk-field__box--error"), role: "combobox" },
      p.value ? h("span", { className: "kk-field__val" }, p.value) : h("span", { className: "kk-field__ph" }, p.placeholder || ""),
      h("span", { className: "kk-field__icon" }, h(Icon, { name: "arrow-drop-down", size: 24 })));
    return FieldShell(p, box);
  }

  function SearchBar(p) {
    return h("div", { className: "kk kk-search" },
      h("span", { className: "kk-search__label" }, p.label),
      h("span", { className: "kk-search__box" }, p.value || p.placeholder,
        p.kind === "select" ? h("span", { className: "kk-field__icon" }, h(Icon, { name: "arrow-drop-down", size: 28 })) : null));
  }

  function Checkbox(p) {
    return h("label", { className: "kk kk-check" },
      p.checked
        ? h("span", { className: "kk-check__on", role: "checkbox", "aria-checked": true }, h(Icon, { name: "checkbox", size: 24 }))
        : h("span", { className: "kk-check__box", role: "checkbox", "aria-checked": false }),
      p.label);
  }

  function Radio(p) {
    return h("div", { className: "kk kk-radio-group", role: "radiogroup", "aria-label": p.label },
      (p.options || []).map(function (o) {
        var on = o === p.value;
        return h("label", { key: o, className: "kk-radio" },
          h("span", { className: cx("kk-radio__icon", on && "kk-radio__icon--on") }, h(Icon, { name: on ? "radio-checked" : "radio-unchecked", size: 25 })), o);
      }));
  }

  function Badge(p) {
    return h("span", { className: "kk kk-badge" }, p.children);
  }

  function Pagination(p) {
    var n = p.count || 1, cur = p.page || 1, items = [];
    items.push(h("li", { key: "prev" }, h("button", { className: "kk-pg__nav", "aria-label": "前のページ" }, h(Icon, { name: "navigate-before", size: 20 }))));
    for (var i = 1; i <= n; i++) {
      items.push(h("li", { key: i }, h("button", { className: cx("kk-pg__item", i === cur && "kk-pg__item--on"), "aria-current": i === cur ? "page" : undefined }, String(i))));
    }
    items.push(h("li", { key: "next" }, h("button", { className: "kk-pg__nav", "aria-label": "次のページ" }, h(Icon, { name: "navigate-next", size: 20 }))));
    return h("nav", { className: "kk" }, h("ul", { className: "kk-pg" }, items));
  }

  function PageHeader(p) {
    return h("header", { className: cx("kk kk-ph", p.variant === "mypage" && "kk-ph--mypage") },
      h("h1", { className: "kk-ph__title" }, p.title),
      p.subtitle ? h("p", { className: "kk-ph__sub" }, p.subtitle) : null);
  }

  function Breadcrumb(p) {
    var items = p.items || [];
    var out = [];
    items.forEach(function (t, i) {
      if (i) out.push(h("span", { key: "s" + i, className: "kk-bc__sep" }, h(Icon, { name: "navigate-next", size: 20 })));
      out.push(h("span", { key: i, className: i === 0 ? "kk-bc__home" : undefined }, t));
    });
    return h("nav", { className: "kk kk-bc", "aria-label": "breadcrumb" }, out);
  }

  function SideNav(p) {
    return h("nav", { className: "kk kk-side", style: p.width ? { width: p.width } : undefined },
      (p.items || []).map(function (it) {
        return h("div", { key: it.label, className: cx("kk-side__item", it.label === p.active && "kk-side__item--on") },
          it.icon ? h("span", { className: "kk-side__icon" }, h(Icon, { name: it.icon, size: 24 })) : null, it.label);
      }));
  }

  var NAV = [["当日", "利用"], ["回数券", "購入"], ["1DAYパス事", "前購入"], ["年間・マンスリー", "パス購入"], ["待ち時間/販", "売状況"]];
  function AppHeader(p) {
    var right = p.loggedIn
      ? [h("span", { key: "m", className: "kk-hd__iconbtn" }, "マイページ"), h("span", { key: "o", className: "kk-hd__iconbtn" }, "ログアウト")]
      : [h("span", { key: "s", className: "kk-hd__signup" }, "新規利用登録"), h("span", { key: "l", className: "kk-hd__login" }, "ログイン")];
    return h("header", { className: "kk kk-hd" },
      h("div", { className: "kk-hd__top" },
        h("span", { className: "kk-hd__ext" }, "キドキドとは", h(Icon, { name: "new-window", size: 16 })),
        h("span", { className: "kk-hd__ext" }, "プレイヴィルとは", h(Icon, { name: "new-window", size: 16 })),
        right),
      h("div", { className: "kk-hd__band" },
        h("div", { className: "kk-hd__brand" }, h("small", null, "ボーネルンド あそび場"), h("b", null, "受付"), h("b", null, "事前購入サイト")),
        h("nav", { className: "kk-hd__nav" }, NAV.map(function (n) {
          return h("span", { key: n[0], className: "kk-hd__navitem" }, n[0], h("br"), n[1]);
        }))));
  }

  var FOOT = ["利用規約", "プライバシーポリシー", "特定商取引に基づく表示", "料金プラン", "よくある質問", "店舗一覧", "お問い合わせ"];
  function AppShell(p) {
    return h("div", { className: "kk kk-shell", style: { position: "relative" } },
      h(AppHeader, { loggedIn: p.loggedIn }),
      h("div", { className: "kk-shell__body" },
        p.sideNav || null,
        h("main", { className: "kk-shell__main" }, h("div", { className: "kk-shell__inner" }, p.children))),
      h("footer", null,
        h("div", { className: "kk-shell__foot" }, FOOT.map(function (t) {
          return h("span", { key: t, className: "kk-shell__flink" }, h("span", null, h(Icon, { name: "navigate-next", size: 20 })), t);
        })),
        h("div", { className: "kk-shell__copy" }, "このホームページに掲載のイラスト・写真・文章の無断転載を禁じます。すべての著作権は株式会社ボーネルンドに帰属します。")));
  }

  function Card(p) {
    return h("section", { className: cx("kk kk-card", "kk-card--" + (p.tone || "raised")) },
      p.title ? h("h2", { className: "kk-card__title" }, p.title) : null, p.children);
  }

  window.KidoKidoUser = {
    Icon: Icon, Button: Button, TextField: TextField, Select: Select, SearchBar: SearchBar, Checkbox: Checkbox,
    Radio: Radio, Badge: Badge, Pagination: Pagination, PageHeader: PageHeader, Breadcrumb: Breadcrumb,
    SideNav: SideNav, AppHeader: AppHeader, AppShell: AppShell, Card: Card
  };
})();
