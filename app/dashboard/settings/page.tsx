"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Lock, Building2, Save } from "lucide-react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    companyName: "My Business",
    email: "contact@mybusiness.com",
    phone: "+1-555-0100",
    address: "123 Business St",
    city: "New York",
    country: "United States",
    currency: "USD",
    taxRate: "10",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    invoiceReminders: true,
    lowStockAlerts: true,
    paymentNotifications: true,
    weeklyReport: false,
  });

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanySettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (key: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account and business preferences</p>
      </div>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <div>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your business details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <Input
                name="companyName"
                value={companySettings.companyName}
                onChange={handleCompanyChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                name="email"
                type="email"
                value={companySettings.email}
                onChange={handleCompanyChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                name="phone"
                value={companySettings.phone}
                onChange={handleCompanyChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                name="currency"
                value={companySettings.currency}
                onChange={(e) =>
                  setCompanySettings((prev) => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <Input
                name="taxRate"
                type="number"
                step="0.01"
                value={companySettings.taxRate}
                onChange={handleCompanyChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Input
              name="address"
              value={companySettings.address}
              onChange={handleCompanyChange}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Input
                name="city"
                value={companySettings.city}
                onChange={handleCompanyChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Input
                name="country"
                value={companySettings.country}
                onChange={handleCompanyChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what alerts you&apos;d like to receive</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "invoiceReminders",
              label: "Invoice Reminders",
              description: "Get notified about unpaid invoices",
            },
            {
              key: "lowStockAlerts",
              label: "Low Stock Alerts",
              description: "Receive alerts when products are low in stock",
            },
            {
              key: "paymentNotifications",
              label: "Payment Notifications",
              description: "Get notified when payments are received",
            },
            {
              key: "weeklyReport",
              label: "Weekly Report",
              description: "Receive a weekly summary of your business",
            },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">{setting.label}</p>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                onChange={() => handleNotificationChange(setting.key)}
                className="w-5 h-5 rounded border-input"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Enable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
