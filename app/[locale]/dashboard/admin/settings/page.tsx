'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Settings, Shield, Bell, Database, Save, Server, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'

export default function AdminSettingsPage() {
  const t = useTranslations('Admin')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="border-b pb-8">
        <h1 className="text-4xl font-black tracking-tighter text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground mt-2 font-medium">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* API & Backend */}
        <Card className="shadow-lg border-indigo-50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Server className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <CardTitle>{t('systemConfig')}</CardTitle>
                <CardDescription>{t('backendSubtitle')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="api_url" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Public API Gateway</Label>
              <Input id="api_url" value="https://api.invoicehub.dev/v1" readOnly className="bg-muted/50 font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="supabase_url" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Supabase Instance</Label>
              <Input id="supabase_url" value="https://axjoyehus...supabase.co" readOnly className="bg-muted/50 font-mono text-xs" />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 justify-between items-center py-4">
            <span className="text-[10px] font-black uppercase text-muted-foreground italic tracking-widest">Running Production v2.1.0</span>
            <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 font-bold">{t('testConnection')}</Button>
          </CardFooter>
        </Card>

        {/* Global Access */}
        <Card className="shadow-lg border-red-50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <CardTitle>{t('security')}</CardTitle>
                <CardDescription>{t('securitySubtitle')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
               <div>
                  <p className="font-bold text-sm tracking-tight text-orange-700">Super Admin Node</p>
                  <p className="text-[10px] font-black text-orange-600/70 uppercase">Master Identity</p>
               </div>
               <Shield className="w-5 h-5 text-orange-500" />
             </div>
             <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
               <div>
                  <p className="font-bold text-sm tracking-tight">Strict Isolation (RLS)</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Enabled for all Tenants</p>
               </div>
               <Database className="w-5 h-5 text-primary" />
             </div>
          </CardContent>
          <CardFooter className="justify-end bg-muted/30 py-4">
            <Button size="sm" className="bg-foreground text-background font-black uppercase tracking-widest text-[10px] px-6">Manage Identities</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-end pt-8 border-t">
        <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20 flex items-center gap-3">
           <Save className="w-4 h-4" />
           {t('saveConfig')}
        </Button>
      </div>
    </div>
  )
}
