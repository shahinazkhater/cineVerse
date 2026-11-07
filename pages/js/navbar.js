import { escapeHtml, getCurrentUser, initials } from "./auth.js";

async function renderNavbar() {
  const container = document.getElementById("navbar");
  if (!container) return;

  const user = await getCurrentUser();
  const currentPath = window.location.pathname;

  const navLinks = [
    { label: "Movies", href: "/home.html", active: currentPath.endsWith("home.html") || currentPath === "/" },
    { label: "Actors", href: "/actors.html", active: currentPath.endsWith("actors.html") },
    ...(user ? [{ label: "My Reviews", href: "/my-reviews.html", active: currentPath.endsWith("my-reviews.html") }] : []),
  ];

  const linksHtml = navLinks
    .map(
      (link) => `
      <li>
        <a href="${link.href}" class="font-medium ${link.active ? "text-primary font-semibold border-b-2 border-primary rounded-none" : "hover:text-primary transition"}">
          ${link.label}
        </a>
      </li>`
    )
    .join("");

  const authSection = user
    ? `
      <div class="flex items-center gap-3">
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar border border-base-content/20">
            <div class="w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              ${
                user.image
                  ? `<img src="/uploads/${user.image}" alt="${escapeHtml(user.username)}" />`
                  : `<span>${initials(user.username)}</span>`
              }
            </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[50] p-2 shadow-2xl bg-base-200 rounded-box w-52 border border-base-300">
            <li class="menu-title px-4 py-2 border-b border-base-300 mb-1">
              <span class="text-xs uppercase tracking-wider text-base-content/60">Signed in as</span>
              <p class="font-bold text-base-content text-sm truncate">${escapeHtml(user.username)}</p>
            </li>
            <li><a href="/home.html">Browse Movies</a></li>
            <li><a href="/actors.html">Browse Actors</a></li>
            <li><a href="/my-reviews.html">My Reviews</a></li>
            <div class="divider my-1"></div>
            <li>
              <button id="logoutBtn" class="text-error hover:bg-error/10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>`
    : `
      <div class="flex items-center gap-2">
        <a href="/login.html" class="btn btn-ghost btn-sm font-medium">Log in</a>
        <a href="/register.html" class="btn btn-primary btn-sm font-semibold shadow-md">Sign up</a>
      </div>`;

  container.innerHTML = `
    <nav class="navbar bg-base-200/95 backdrop-blur border-b border-base-300 sticky top-0 z-40 px-4 lg:px-8">
      <div class="navbar-start">
        <div class="dropdown lg:hidden">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[50] p-2 shadow-2xl bg-base-200 rounded-box w-52 border border-base-300">
            ${linksHtml}
          </ul>
        </div>
        <a href="/home.html" class="flex items-center gap-2 group">
          <span class="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-content font-black shadow-md shadow-primary/30 group-hover:scale-105 transition">
            🎬
          </span>
          <span class="font-display font-black text-xl tracking-tight text-base-content">
            Cine<span class="text-primary">Verse</span>
          </span>
        </a>
      </div>

      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1 gap-4">
          ${linksHtml}
        </ul>
      </div>

      <div class="navbar-end">
        ${authSection}
      </div>
    </nav>`;

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    try {
      await fetch("/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login.html";
    }
  });
}

renderNavbar();