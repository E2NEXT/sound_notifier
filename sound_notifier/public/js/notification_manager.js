
$(document).ready(() => {
    frappe.realtime.on('notification', async () => {
        const currentUser = frappe.session.user;

        try {
            const latestNotification = await getLatestNotification(currentUser);

            if (latestNotification) {
                const lastNotified = await getLastNotified(currentUser);

                if (!lastNotified || lastNotified.notification_log !== latestNotification.name) {
                    showNewNotificationAlert(latestNotification.subject);
                    playNotificationSound();
                    updateLastNotification(currentUser, latestNotification.name, lastNotified?.name);
                }
            }
        } catch (error) {
            console.error("Error handling notification:", error);
        }
    });
});

async function getLatestNotification(user) {
    const notifications = await frappe.db.get_list('Notification Log', {
        filters: { "for_user": user },
        fields: ['subject', 'creation', 'name'],
        order_by: 'creation desc',
        limit: 1
    });

    return notifications.length > 0 ? notifications[0] : null;
}

async function getLastNotified(user) {
    const notifications = await frappe.db.get_list('Last Notification', {
        filters: { "user": user },
        fields: ['notification_log', 'name'],
        limit: 1
    });

    return notifications.length > 0 ? notifications[0] : null;
}

function showNewNotificationAlert(subject) {
    frappe.show_alert({
        message: `New Notification : ${subject}`,
        indicator: 'green'
    });
}

function playNotificationSound() {
    const audio = new Audio('/assets/sound_notifier/sounds/1.mp3');
    audio.play();
}

async function updateLastNotification(user, notificationLogName, lastNotificationName) {
    if (lastNotificationName) {

        let lastNotification = await frappe.db.get_doc('Last Notification', lastNotificationName);
        lastNotification.notification_log = notificationLogName;
        await frappe.db.set_value('Last Notification', lastNotification.name, 'notification_log', notificationLogName,ignore_permissions=true);

    } else {
        await frappe.call({
            method: 'frappe.client.insert',
            args: {
                doc: {
                    doctype: 'Last Notification',
                    user: user,
                    notification_log: notificationLogName
                },
                ignore_permissions: true
            }
        });
    }
}