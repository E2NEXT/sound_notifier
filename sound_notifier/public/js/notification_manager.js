
$(document).ready(() => {
  frappe.realtime.on('notification', function (data) {
    var current_user = frappe.session.user;
    frappe.db.get_list(
        'Notification Log', {
        filters: {
            "for_user": current_user,
        }, fields: ['subject', 'creation', 'name'],
        order_by: 'creation desc',
        limit: 1 
    }
    ).then(function (value) {
        if (value.length > 0) {
            frappe.db.get_list(
                'Last Notification', {
                filters: {
                    "user": current_user,
                }, fields: ['notification_log', 'name'],
                limit: 1
            }
            ).then(function (value2) {

                if (value2.length > 0) {
                    if (value2[0]['notification_log'] != value[0]['name']) {
                        frappe.show_alert({
                            message: "New Notification : " + value[0]['subject'],
                            indicator: 'green'
                        }); var audio = new Audio('/assets/sound_notifier/sounds/1.mp3');
                        audio.play();
                        frappe.db.set_value('Last Notification', value2[0]['name'], 'notification_log', value[0]['name']);
                    }
                } else {
                    frappe.call({
                        method: 'frappe.client.insert',
                        args: {
                            doc: {
                                doctype: 'Last Notification',
                                user: current_user,
                                notification_log: value[0]['name']
                            }
                        },
                        callback: function (response) {
                            if (!response.exc) {
                                frappe.show_alert({
                                    message:"New Notification : " +  value[0]['subject'],
                                    indicator: 'green'
                                });
                                var audio = new Audio('/assets/sound_notifier/sounds/1.mp3');
                                audio.play();
                            }
                        }
                    });
                }

            });

        }
    });
  });
})
