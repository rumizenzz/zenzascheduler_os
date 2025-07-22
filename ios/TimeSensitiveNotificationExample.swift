import UIKit
import UserNotifications

/// Manages scheduling of a time-sensitive local notification.
/// Compatible with iOS 15+
final class TimeSensitiveNotificationManager: NSObject, UNUserNotificationCenterDelegate {
    override init() {
        super.init()
        // Set the delegate so we can show alerts while the app is in the foreground
        UNUserNotificationCenter.current().delegate = self
    }

    /// Requests notification permissions including the `timeSensitive` option.
    func requestAuthorization() {
        let center = UNUserNotificationCenter.current()
        if #available(iOS 15.0, *) {
            center.requestAuthorization(options: [.alert, .sound, .badge, .timeSensitive]) { granted, error in
                DispatchQueue.main.async {
                    if granted {
                        self.scheduleTimeSensitiveNotification()
                    } else if let error = error {
                        print("Authorization error: \(error.localizedDescription)")
                    }
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
        scheduleNotification(title: "Time Sensitive Reminder",
                              body: "This needs your attention right away!",
                              at: Date().addingTimeInterval(10))
    }

    /// Schedule a time-sensitive notification for a specific date.
    func scheduleNotification(title: String, body: String, at date: Date) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = UNNotificationSound.default
        if #available(iOS 15.0, *) {
            content.interruptionLevel = .timeSensitive
        }

        let interval = max(date.timeIntervalSinceNow, 1)
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: interval, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Scheduling error: \(error.localizedDescription)")
            } else {
                print("Time-sensitive notification scheduled")
            }
        }
    }

    /// Opens the system notification settings so users can enable
    /// Time Sensitive Notifications if they were previously denied.
    func openNotificationSettings() {
        let application = UIApplication.shared
        if #available(iOS 16.0, *) {
            if let url = URL(string: UIApplication.openNotificationSettingsURLString) {
                application.open(url)
            }
        } else if let url = URL(string: UIApplication.openSettingsURLString) {
            application.open(url)
        }
    }

    /// Returns whether the user has allowed Time Sensitive notifications.
    func isTimeSensitiveEnabled(completion: @escaping (Bool) -> Void) {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            if #available(iOS 15.0, *) {
                completion(settings.timeSensitiveSetting == .enabled)
            } else {
                completion(false)
            }
        }
    }

    // MARK: - UNUserNotificationCenterDelegate

    /// Ensures the notification is displayed even when the app is in the foreground.
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .list, .sound])
    }
}
