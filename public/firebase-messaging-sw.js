self.addEventListener('push', (event) => {
    console.log('Push event empfangen');
    
    let title = 'Mario Kart Turnier';
    let body = 'Mario Kart Turnier';
    
    try {
        const rawData = event.data;
        console.log('Rohdaten vom Push-Event:', {
            text: rawData.text(),
            json: rawData.json(),
            arrayBuffer: new Uint8Array(rawData.arrayBuffer())
        });
    } catch (e) {
        console.error('Fehler beim Lesen der Rohdaten:', e);
    }

    try {
        const text = event.data.text();
        console.log('Nachricht als Text:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('Erfolgreich als JSON geparst:', data);
            console.log("Titel:", data.title)
            console.log("Body:", data.body)
            title = data.title || title;
            body = data.body || body;
        } catch (e) {
            console.error('JSON-Parsing fehlgeschlagen:', e);
            body = text;
        }
    } catch (e) {
        console.error('Fehler beim Lesen der Nachricht:', e);
        body = 'Neue Benachrichtigung erhalten';
    }

    console.log('Finale Benachrichtigungsdaten:', { title, body });
    
    const options = {
        body: body,
        icon: '/assets/icon/favicon-64x64.png',
        badge: '/assets/icon/favicon-64x64.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Öffnen'
            },
            {
                action: 'close',
                title: 'Schließen'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    console.log('Auf Benachrichtigung geklickt', event);

    // Schließe die Benachrichtigung
    event.notification.close();

    // Überprüfe, welche Aktion geklickt wurde
    if (event.action === 'explore') {
        // Versuche ein existierendes Fenster zu finden oder öffne ein neues
        event.waitUntil(
            clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(function(clientList) {
                // Überprüfe, ob bereits ein Fenster offen ist
                for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if (client.url && 'focus' in client) {
                        client.focus();
                        // Navigiere zur Tab1-Ansicht
                        if ('navigate' in client) {
                            return client.navigate('/tab1');
                        }
                        return;
                    }
                }
                // Wenn kein Fenster offen ist, öffne ein neues mit Tab1
                if (clients.openWindow) {
                    return clients.openWindow('/tab1');
                }
            })
        );
    }
});