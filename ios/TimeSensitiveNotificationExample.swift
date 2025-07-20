import UIKit
import UserNotifications

/// Manages scheduling of a time-sensitive local notification.
/// Compatible with iOS 15+
final class TimeSensitiveNotificationManager {
    /// Requests notification permissions including the `timeSensitive` option.
    func requestAuthorization() {
        let center = UNUserNotificationCenter.current()
        if #available(iOS 15.0, *) {
            center.requestAuthorization(options: [.alert, .sound, .badge, .timeSensitive]) { granted, error in
                if granted {
                    self.scheduleTimeSensitiveNotification()
                } else if let error = error {
                    print("Authorization error: \(error.localizedDescription)")
                }
            }
        } else {
            // Fallback for older versions without the timeSensitive option
            center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
                if granted {
                    self.scheduleTimeSensitiveNotification()
                } else if let error = error {
                    print("Authorization error: \(error.localizedDescription)")
                }
            }
        }
    }

    /// Schedules a notification to appear within 10 seconds using the `.timeSensitive` interruption level.
    private func scheduleTimeSensitiveNotification() {
        let content = UNMutableNotificationContent()
        content.title = "Time Sensitive Reminder"
        content.body = "This needs your attention right away!"
        content.sound = UNNotificationSound.default
        if #available(iOS 15.0, *) {
            content.interruptionLevel = .timeSensitive
        }

        // Trigger after 10 seconds
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 10, repeats: false)
        let request = UNNotificationRequest(identifier: "timeSensitiveExample", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Scheduling error: \(error.localizedDescription)")
            } else {
                print("Time-sensitive notification scheduled")
            }
        }
    }
}
