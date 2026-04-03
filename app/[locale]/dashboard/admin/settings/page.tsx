'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Settings, Shield, Bell, Database, Save, Server, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Global Platform Settings</h1>
        <p className="text-muted-foreground mt-2">Manage the underlying infrastructure and system defaults.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* API & Backend */}
        <Card className="shadow-lg border-indigo-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-indigo-500" />
              <div>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Backend and API endpoints</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="api_url">Public API Gateway</Label>
              <Input id="api_url" value="https://api.invoicehub.dev/v1" readOnly />
            </div>
            <div className="space-y-1">
              <Label htmlFor="supabase_url">Supabase Instance</Label>
              <Input id="supabase_url" value="https://axjoyehus...supabase.co" readOnly />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 justify-between">
            <span className="text-xs text-muted-foreground italic">Running Production v1.0.4</span>
            <Button size="sm" variant="outline">Test Connection</Button>
          </CardFooter>
        </Card>

        {/* Global Access */}
        <Card className="shadow-lg border-indigo-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-500" />
              <div>
                <CardTitle>Platform Security</CardTitle>
                <CardDescription>Global authentication and isolation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50/50 border border-orange-100">
               <div>
                  <p className="font-medium text-sm">Super Admin</p>
                  <p className="text-xs text-muted-foreground">djabercheriet@gmail.com</p>
               </div>
               <Shield className="w-4 h-4 text-orange-500" />
             </div>
             <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
               <div>
                  <p className="font-medium text-sm">Strict RLS Logging</p>
                  <p className="text-xs text-muted-foreground">Enabled for all tables</p>
               </div>
               <Database className="w-4 h-4 text-indigo-500" />
             </div>
          </CardContent>
          <CardFooter className="justify-end bg-slate-50/50">
            <Button size="sm" className="bg-slate-900">Manage Security</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
           <Save className="w-4 h-4" />
           Save All Configuration
        </Button>
      </div>
    </div>
  )
}
