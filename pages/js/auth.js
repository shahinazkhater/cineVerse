// ============================================================
// Shared Auth & Frontend Helper Utilities
// ============================================================

async function getCurrentUser() {
  try {
    const res = await fetch("/auth/me");
    if (!res.ok) return null;
    const body = await res.json();
    return body.data?.user || null;
  } catch {
    return null;
  }
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "/login.html";
    return null;
  }
  return user;
}

function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast toast-end toast-bottom z-50 fixed bottom-5 right-5 space-y-2";
    document.body.appendChild(container);
  }

  const alertClass = type === "success" ? "alert-success" : type === "error" ? "alert-error" : "alert-info";
  const toast = document.createElement("div");
  toast.className = `alert ${alertClass} shadow-lg text-sm font-medium transition-all duration-300`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function setLoading(btn, isLoading, loadingText = "Please wait...") {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<span class="loading loading-spinner loading-xs"></span> ${loadingText}`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.originalText || "Submit";
    btn.disabled = false;
  }
}

function clearErrors() {
  document.querySelectorAll("[id$='Error']").forEach((el) => {
    el.classList.add("hidden");
    el.textContent = "";
  });
}

function showFieldErrors(errors) {
  if (!errors) return;
  for (const [field, info] of Object.entries(errors)) {
    const el = document.getElementById(`${field}Error`);
    if (!el) continue;

    const msg = Array.isArray(info?.errors) ? info.errors[0] : (typeof info === "string" ? info : "invalid field");
    el.textContent = msg;
    el.classList.remove("hidden");
  }
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  } catch {
    return null;
  }
}

const DEFAULT_ACTOR_IMAGE =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80";

function getActorImage(actor) {
  if (actor?.images && Array.isArray(actor.images) && actor.images.length > 0 && actor.images[0]) {
    return `/uploads/${actor.images[0]}`;
  }
  return DEFAULT_ACTOR_IMAGE;
}

function confirmAction({
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  confirmClass = "btn-error",
  onConfirm = async () => {},
}) {
  let modal = document.getElementById("confirmActionModal");
  if (!modal) {
    modal = document.createElement("dialog");
    modal.id = "confirmActionModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-box bg-base-200 border border-base-300 shadow-2xl max-w-sm">
      <h3 class="font-display font-bold text-lg text-error flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        ${escapeHtml(title)}
      </h3>
      <p class="py-3 text-sm text-base-content/80">${escapeHtml(message)}</p>
      <div class="modal-action">
        <button type="button" class="btn btn-ghost btn-sm" id="confirmModalCancelBtn">Cancel</button>
        <button type="button" class="btn ${confirmClass} btn-sm" id="confirmModalActionBtn">${escapeHtml(confirmText)}</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button>close</button></form>
  `;

  modal.showModal();

  document.getElementById("confirmModalCancelBtn").onclick = () => modal.close();

  const actionBtn = document.getElementById("confirmModalActionBtn");
  actionBtn.onclick = async () => {
    setLoading(actionBtn, true, "Deleting...");
    try {
      await onConfirm();
    } finally {
      modal.close();
    }
  };
}

export {
  getCurrentUser,
  requireAuth,
  showToast,
  setLoading,
  clearErrors,
  showFieldErrors,
  escapeHtml,
  formatDate,
  initials,
  getYoutubeEmbedUrl,
  DEFAULT_ACTOR_IMAGE,
  getActorImage,
  confirmAction,
};