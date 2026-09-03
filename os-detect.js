(function () {
  function getDeviceOS() {
    const platform =
      (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform ||
      "";
    const value = platform.toLowerCase();

    if (value.includes("mac") || value.includes("iphone") || value.includes("ipad")) {
      return "macos";
    }
    if (value.includes("win")) {
      return "windows";
    }
    if (value.includes("linux") || value.includes("cros")) {
      return "linux";
    }
    return null;
  }

  const userOS = getDeviceOS();
  if (!userOS) return;

  const handledTabLists = new WeakSet();
  let currentPath = location.pathname;
  let userPickedTab = false;

  document.addEventListener(
    "mousedown",
    (event) => {
      if (!event.isTrusted || !event.target.closest) return;
      if (event.target.closest("button[role='tab']")) {
        userPickedTab = true;
      }
    },
    true
  );

  function isHydrated(tab) {
    return Object.keys(tab).some((key) => key.startsWith("__reactProps$"));
  }

  function select(tab) {
    const opts = { bubbles: true, cancelable: true, view: window, button: 0 };
    tab.dispatchEvent(new MouseEvent("mousedown", { ...opts, buttons: 1 }));
    tab.dispatchEvent(new MouseEvent("mouseup", opts));
  }

  function applyToTabLists() {
    if (location.pathname !== currentPath) {
      currentPath = location.pathname;
      userPickedTab = false;
    }
    if (userPickedTab) return;

    document.querySelectorAll("[role='tablist']").forEach((tabList) => {
      if (handledTabLists.has(tabList)) return;

      const tabs = Array.from(tabList.querySelectorAll("button[role='tab']"));
      if (tabs.length === 0 || !tabs.every(isHydrated)) return;

      handledTabLists.add(tabList);

      const match = tabs.find((tab) => tab.textContent.trim().toLowerCase() === userOS);
      if (match && match.getAttribute("aria-selected") !== "true") {
        select(match);
      }
    });
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyToTabLists();
    });
  }

  function start() {
    schedule();
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start);
  }
})();
