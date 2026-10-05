/* @ds-bundle: {"format":4,"namespace":"KidoKidoAdmin","components":[{"name":"Icon"},{"name":"Button"},{"name":"TextField"},{"name":"Select"},{"name":"Radio"},{"name":"Switch"},{"name":"Tabs"},{"name":"Card"},{"name":"Table"},{"name":"Pagination"},{"name":"Breadcrumb"},{"name":"PageHeader"},{"name":"SideNav"},{"name":"AppShell"},{"name":"Modal"},{"name":"Toast"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) { if (arguments[i]) out.push(arguments[i]); }
    return out.join(" ");
  }

  /* Path lấy nguyên từ SVG MUI thu được trên WEB-01 (assets/Icons). */
  var PATHS = {
    visibility: ["M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"],
    edit: ["m14.06 9.02.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"],
    "delete": ["M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"],
    "arrow-drop-down": ["M7 10l5 5 5-5z"],
    "navigate-before": ["M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"],
    "navigate-next": ["M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"],
    add: ["M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"],
    "add-circle": ["M12 7c-.55 0-1 .45-1 1v3H8c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V8c0-.55-.45-1-1-1zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"],
    "save-alt": ["M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67 2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"],
    "keyboard-arrow-down": ["M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"],
    "keyboard-arrow-up": ["M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"],
    clock: ["M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z", "M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"],
    circle: ["M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z"]
  };

  function Icon(p) {
    var size = p.size || 24;
    var d = PATHS[p.name] || PATHS.circle;
    return h("svg", {
      className: cx("kka-icon", p.className), width: size, height: size, viewBox: "0 0 24 24",
      role: p.label ? "img" : null, "aria-label": p.label || null, "aria-hidden": p.label ? null : "true"
    }, d.map(function (x, i) { return h("path", { key: i, d: x }); }));
  }

  function Button(p) {
    var variant = p.variant || "contained";
    return h("button", {
      type: "button", className: cx("kka-btn", "kka-btn--" + variant, p.size === "lg" && "kka-btn--lg", p.className),
      disabled: p.disabled || null, onClick: p.onClick, style: p.style
    }, p.startIcon ? h(Icon, { name: p.startIcon, size: 20 }) : null, p.children,
      p.endIcon ? h(Icon, { name: p.endIcon, size: 20 }) : null);
  }

  function Label(p) {
    if (!p.label) return null;
    return h("span", { className: cx("kka-label", p.bold && "kka-label--bold") }, p.label,
      p.required ? h("span", { className: "kka-req" }, "[必須]") : null);
  }

  function TextField(p) {
    var hasValue = p.value !== undefined && p.value !== null && p.value !== "";
    return h("label", { className: "kka-field", style: p.style },
      h(Label, { label: p.label, required: p.required, bold: p.boldLabel }),
      p.helper ? h("span", { className: "kka-helper" }, p.helper) : null,
      h("span", { className: cx("kka-input", p.pill && "kka-input--pill", p.disabled && "kka-input--disabled") },
        h("span", { className: cx("kka-input__value", !hasValue && "kka-input__ph") }, hasValue ? p.value : (p.placeholder || "")),
        p.endIcon ? h("span", { className: "kka-input__icon" }, h(Icon, { name: p.endIcon, size: 22 })) : null),
      p.error ? h("span", { className: "kka-error" }, p.error) : null);
  }

  function Select(p) {
    return h(TextField, {
      label: p.label, required: p.required, boldLabel: p.boldLabel, value: p.value, placeholder: p.placeholder,
      disabled: p.disabled, endIcon: "arrow-drop-down", style: p.style
    });
  }

  function Radio(p) {
    var opts = p.options || [];
    return h("div", { className: "kka-field", role: "radiogroup", "aria-label": p.label || null },
      h(Label, { label: p.label, required: p.required, bold: true }),
      h("div", { className: cx("kka-radio-group", p.column && "kka-radio-group--column") },
        opts.map(function (o) {
          var on = o === p.value;
          return h("span", { key: o, className: "kka-radio", role: "radio", "aria-checked": on ? "true" : "false" },
            h("span", { className: cx("kka-radio__dot", on && "kka-radio__dot--on") }), o);
        })));
  }

  function Switch(p) {
    return h("span", { className: cx("kka-switch", p.checked && "kka-switch--on"), role: "switch", "aria-checked": p.checked ? "true" : "false" },
      h("span", { className: "kka-switch__track" }, h("span", { className: "kka-switch__thumb" })),
      p.label !== undefined ? p.label : (p.checked ? "ON" : "OFF"));
  }

  function Tabs(p) {
    return h("div", { className: "kka-tabs", role: "tablist" }, (p.items || []).map(function (t) {
      var on = t === p.value;
      return h("div", { key: t, role: "tab", "aria-selected": on ? "true" : "false", className: cx("kka-tab", on && "kka-tab--active") }, t);
    }));
  }

  function Card(p) {
    return h("section", { className: "kka-card", style: p.style },
      p.title ? h("h2", { className: "kka-card__title" }, p.title) : null, p.children);
  }

  function Table(p) {
    var cols = p.columns || [];
    return h("div", { className: "kka-table-wrap" },
      h("table", { className: "kka-table" },
        h("thead", null, h("tr", null, cols.map(function (c) { return h("th", { key: c.key, style: c.width ? { width: c.width } : null }, c.title); }))),
        h("tbody", null, (p.rows || []).map(function (r, i) {
          return h("tr", { key: i }, cols.map(function (c) {
            var v = r[c.key];
            if (c.key === "actions") {
              v = h("span", { className: "kka-actions" },
                h("button", { type: "button", className: "kka-iconbtn", "aria-label": "details" }, h(Icon, { name: "visibility" })),
                h("button", { type: "button", className: "kka-iconbtn", "aria-label": "update", disabled: r.locked || null }, h(Icon, { name: "edit" })));
            }
            return h("td", { key: c.key, className: c.numeric ? "kka-num" : null }, v);
          }));
        }))));
  }

  function Pagination(p) {
    var page = p.page || 1, pages = p.pages || 1, items = [];
    for (var i = 1; i <= Math.min(pages, 5); i++) items.push(i);
    var cls = cx("kka-pager__item", p.outlined && "kka-pager__item--outlined");
    return h("nav", { className: "kka-pager", "aria-label": "pagination navigation" },
      h("span", null, "全て " + (p.total || 0) + " 件"),
      h("button", { type: "button", className: cls, "aria-label": "前のページへ", disabled: page === 1 || null }, h(Icon, { name: "navigate-before", size: 20 })),
      items.map(function (n) {
        return h("button", { key: n, type: "button", className: cx(cls, n === page && "kka-pager__item--active"), "aria-current": n === page ? "page" : null }, n);
      }),
      pages > 5 ? h("span", null, "…") : null,
      h("button", { type: "button", className: cls, "aria-label": "次のページへ" }, h(Icon, { name: "navigate-next", size: 20 })),
      h("span", { className: "kka-pager__size" }, (p.perPage || 10) + " / ページ"));
  }

  function Breadcrumb(p) {
    return h("ol", { className: "kka-crumbs" }, (p.items || []).map(function (t, i) { return h("li", { key: i }, t); }));
  }

  function PageHeader(p) {
    return h("div", { className: "kka-pagehead" }, h("h1", null, p.title),
      h(Breadcrumb, { items: p.breadcrumb || [p.title] }));
  }

  function SideNav(p) {
    return h("aside", { className: "kka-sidenav" },
      h("div", { className: "kka-sidenav__logo" }, h("div", { className: "kka-sidenav__logo-box", role: "img", "aria-label": "logo" })),
      (p.items || []).map(function (it) {
        var title = typeof it === "string" ? it : it.title;
        var on = title === p.active;
        var row = h("div", { key: title, className: cx("kka-nav", on && !it.children && "kka-nav--active", on && it.children && "kka-nav--open") },
          h(Icon, { name: "circle", size: 24 }), h("span", null, title),
          it.children ? h("span", { style: { marginLeft: "auto" } }, h(Icon, { name: on ? "keyboard-arrow-up" : "keyboard-arrow-down" })) : null);
        if (!(on && it.children)) return row;
        return h("div", { key: title }, row, it.children.map(function (c) {
          return h("div", { key: c, className: cx("kka-subnav", c === p.activeChild && "kka-subnav--active") }, "• " + c);
        }));
      }),
      h("div", { className: "kka-nav kka-nav--logout" }, h(Icon, { name: "circle", size: 24 }), h("span", null, "ログアウト")));
  }

  function AppShell(p) {
    return h("div", { className: "kka-shell kka-root" }, p.nav,
      h("main", { className: "kka-shell__main" }, p.title ? h(PageHeader, { title: p.title, breadcrumb: p.breadcrumb }) : null, p.children));
  }

  function Modal(p) {
    if (p.open === false) return null;
    return h("div", { className: "kka-modal-scrim" },
      h("div", { className: "kka-modal", role: "dialog", "aria-modal": "true" },
        p.title ? h("h2", { className: "kka-modal__title" }, p.title) : null,
        p.message ? h("p", { className: "kka-modal__msg" }, p.message) : null,
        h("div", { className: "kka-modal__actions" },
          h(Button, { variant: "outlined", onClick: p.onDismiss }, p.cancelLabel || "キャンセル"),
          h(Button, { variant: "contained", onClick: p.onAccept }, p.okLabel || "Ok"))));
  }

  var TOAST_TITLE = { success: "成功", error: "エラー", warning: "警告" };
  function Toast(p) {
    var type = p.type || "success";
    return h("div", { className: "kka-toast", role: "status" },
      h("div", null, h("p", { className: "kka-toast__title" }, p.title || TOAST_TITLE[type]), p.message || null));
  }

  window.KidoKidoAdmin = {
    Icon: Icon, Button: Button, TextField: TextField, Select: Select, Radio: Radio, Switch: Switch, Tabs: Tabs,
    Card: Card, Table: Table, Pagination: Pagination, Breadcrumb: Breadcrumb, PageHeader: PageHeader,
    SideNav: SideNav, AppShell: AppShell, Modal: Modal, Toast: Toast
  };
})();
