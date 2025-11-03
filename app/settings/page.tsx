"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, User, Bell, Shield, Palette } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Settings Header - Made smaller than typical headers */}
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-2xl font-semibold text-foreground">
              Settings
            </h1>
          </div>
        </div>

        {/* Settings Content */}
        <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-medium">Profile Settings</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your account information and personal details.
            </p>
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-medium">Notifications</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Configure how you receive notifications and alerts.
            </p>
            <Button variant="outline" size="sm">
              Manage Notifications
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-medium">Security</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your password, two-factor authentication, and security settings.
            </p>
            <Button variant="outline" size="sm">
              Security Settings
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-medium">Appearance</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Customize the look and feel of your application.
            </p>
            <Button variant="outline" size="sm">
              Customize Theme
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}