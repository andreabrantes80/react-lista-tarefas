// ntfy-sw.js - Service Worker para notificações ntfy.sh

// Escuta eventos push (se vierem via push API)
self.addEventListener("push", function (event) {
  const data = event.data ? event.data.text() : "Nova notificação!";
  event.waitUntil(
    self.registration.showNotification("📌 Lembrete de Tarefa", {
      body: data,
      icon: "/icone.png",
      badge: "/icone.png",
    })
  );
});

// Escuta mensagens do app React via postMessage
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "NTFY_MESSAGE") {
    self.registration.showNotification("📌 Notificação ntfy", {
      body: event.data.body,
      icon: "/icone.png",
      badge: "/icone.png",
    });
  }
});

// Quando a notificação é clicada
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Abre o app ou foco na aba existente
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) client = clientList[i];
          }
          return client.focus();
        }
        return clients.openWindow("/");
      })
  );
});
