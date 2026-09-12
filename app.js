// The Great Alaskan Bush Company — site interactions
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Scroll reveal (observes every .reveal element on the page)
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  // Current year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Member portal (DEMO — client-side only, localStorage). No real accounts.
  var STORE_KEY = "azabco_member_demo";
  var TIERS = {
    regular: {
      label: "Regular",
      perks: [
        "Member discount on cover charge (details TBD)",
        "Priority entry line",
        "Invitations & special offers",
        "Daily specials notifications"
      ]
    },
    vip: {
      label: "VIP",
      perks: [
        "Bigger cover-charge discount (details TBD)",
        "VIP room perks & priority booking",
        "Bottle service deals (details TBD)",
        "Guest passes for friends (details TBD)"
      ]
    },
    circle: {
      label: "Owner's Circle",
      perks: [
        "Maximum cover discounts (details TBD)",
        "Owners Suite access (details TBD)",
        "Private event invitations",
        "Dedicated host (details TBD)"
      ]
    }
  };

  function readMember() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { return null; }
  }
  function writeMember(m) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(m)); } catch (e) {}
  }
  function clearMember() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  }

  var authBox = document.getElementById("portal-auth");
  var dashBox = document.getElementById("portal-dash");
  var errBox = document.getElementById("portal-error");
  var signupForm = document.getElementById("portal-signup");
  var signinForm = document.getElementById("portal-signin");
  var tabs = document.querySelectorAll(".portal__tab");

  function setError(msg) { if (errBox) errBox.textContent = msg || ""; }

  function showAuth(mode) {
    if (authBox) authBox.hidden = false;
    if (dashBox) dashBox.hidden = true;
    setError("");
    tabs.forEach(function (t) { t.classList.toggle("active", t.dataset.mode === mode); });
    if (signupForm) signupForm.hidden = mode !== "signup";
    if (signinForm) signinForm.hidden = mode !== "signin";
  }

  function showDashboard(member) {
    if (authBox) authBox.hidden = true;
    if (dashBox) dashBox.hidden = false;
    var tier = TIERS[member.plan] || TIERS.regular;
    var nameEl = document.getElementById("portal-name");
    var tierEl = document.getElementById("portal-tier");
    var avatarEl = document.getElementById("portal-avatar");
    var perksEl = document.getElementById("portal-perks");
    if (nameEl) nameEl.textContent = member.name || "Member";
    if (tierEl) tierEl.textContent = tier.label + " Member";
    if (avatarEl) avatarEl.textContent = (member.name || "?").trim().charAt(0).toUpperCase();
    if (perksEl) {
      perksEl.innerHTML = "";
      tier.perks.forEach(function (p) {
        var li = document.createElement("li");
        li.textContent = p;
        perksEl.appendChild(li);
      });
    }
  }

  if (authBox && dashBox) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { showAuth(tab.dataset.mode); });
    });

    if (signupForm) {
      signupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = signupForm.name.value.trim();
        var email = signupForm.email.value.trim().toLowerCase();
        var pw = signupForm.password.value;
        var plan = signupForm.plan.value;
        if (!name || !email || pw.length < 4) {
          setError("Please add a name, a valid email, and a password (4+ characters).");
          return;
        }
        // Demo: never store raw passwords — store a simple digest only.
        var digest = 0;
        for (var i = 0; i < pw.length; i++) digest = (digest * 31 + pw.charCodeAt(i)) >>> 0;
        writeMember({ name: name, email: email, pw: "demo$" + digest, plan: plan });
        showDashboard({ name: name, plan: plan });
      });
    }

    if (signinForm) {
      signinForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = signinForm.email.value.trim().toLowerCase();
        var pw = signinForm.password.value;
        var member = readMember();
        if (!member || member.email !== email) {
          setError("No demo account found for that email on this browser. Try Sign Up first.");
          return;
        }
        var digest = 0;
        for (var j = 0; j < pw.length; j++) digest = (digest * 31 + pw.charCodeAt(j)) >>> 0;
        if (member.pw !== "demo$" + digest) {
          setError("Password doesn't match this demo account.");
          return;
        }
        showDashboard(member);
      });
    }

    var signoutBtn = document.getElementById("portal-signout");
    if (signoutBtn) {
      signoutBtn.addEventListener("click", function () {
        clearMember();
        showAuth("signin");
      });
    }

    // Tier CTA buttons pre-select the plan in the sign-up form.
    document.querySelectorAll("[data-plan]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var select = signupForm && signupForm.querySelector("select[name=plan]");
        if (select && TIERS[btn.dataset.plan]) select.value = btn.dataset.plan;
        showAuth("signup");
      });
    });

    // Restore session if a demo member was already signed up in this browser.
    var saved = readMember();
    if (saved && saved.email) showDashboard(saved);
    else showAuth("signup");
  }
})();
