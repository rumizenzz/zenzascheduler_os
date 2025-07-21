# iOS Time-Sensitive Notification Example

This directory provides a Swift snippet demonstrating how to request notification permissions with the `timeSensitive` option and schedule a local notification that fires within 10 seconds.

## Info.plist / Entitlement Keys

To deliver time-sensitive notifications even during Focus modes, add the **Time Sensitive Notifications** capability. Xcode inserts the following into your app's entitlements file:

```xml
<!-- Example.entitlements -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.usernotifications.time-sensitive</key>
    <true/>
</dict>
</plist>
```

Your `Info.plist` should also declare background modes if you plan to handle remote notifications in the background:

```xml
<!-- Info.plist snippet -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

## Foreground Delivery

Set the notification center delegate so the banner appears while the app is active:

```swift
let manager = TimeSensitiveNotificationManager()
manager.requestAuthorization()
```

The manager implements `UNUserNotificationCenterDelegate` and calls `completionHandler([.banner, .list, .sound])` so alerts display even when your app is in the foreground.

## Turning On Time Sensitive Notifications

Once permission is granted, users can toggle the **Time Sensitive Notifications** switch from Settings > Notifications. You can guide them to the right page by calling:

```swift
let manager = TimeSensitiveNotificationManager()
manager.openNotificationSettings()
```

## APNs Payload Example

A remote push payload using the time-sensitive interruption level:

```json
{
  "aps": {
    "alert": {
      "title": "Schedule Reminder",
      "body": "Don't forget your upcoming event"
    },
    "sound": "default",
    "interruption-level": "time-sensitive",
    "category": "REMINDER"
  }
}
```

See `TimeSensitiveNotificationExample.swift` for the full Swift implementation.
