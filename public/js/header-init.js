(() => {
  // ns-hugo-params:<stdin>
  var stdin_default = { prefix: "hb-", sticky: true };

  // <stdin>
  (() => {
    const nav = document.querySelector(".hb-header-nav");
    if (!nav) {
      return;
    }
    const topOffset = () => {
      const v = nav.clientHeight + 24;
      document.body.style.setProperty(`--${stdin_default.prefix}top-offset`, v + "px");
    };
    if (stdin_default.sticky) {
      topOffset();
      window.addEventListener("resize", () => {
        topOffset();
      });
    }
  })();
})();
