if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"));
}

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", () => {
  installBtn.hidden = true;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choice) => {
    console.log("User choice:", choice.outcome);
    deferredPrompt = null;
  });
});