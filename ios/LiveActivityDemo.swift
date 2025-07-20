// Example ActivityKit integration for ZenzaLife Scheduler
// Use these helpers in your native iOS app to show Live Activities

import ActivityKit
import SwiftUI

struct SchedulerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var progress: Double
        var title: String
    }

    var eventID: String
}

struct ZenzaLiveActivity {
    static func start(eventID: String, title: String, endTime: Date) {
        let attributes = SchedulerAttributes(eventID: eventID)
        let initialContent = SchedulerAttributes.ContentState(progress: 0, title: title)
        do {
            _ = try Activity.request(attributes: attributes, contentState: initialContent, pushType: nil)
        } catch {
            print("Failed to start Live Activity: \(error)")
        }
    }

    static func update(activity: Activity<SchedulerAttributes>, progress: Double, title: String) async {
        let state = SchedulerAttributes.ContentState(progress: progress, title: title)
        await activity.update(using: state)
    }

    static func end(activity: Activity<SchedulerAttributes>) async {
        await activity.end(dismissalPolicy: .immediate)
    }
}
