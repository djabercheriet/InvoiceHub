'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, Mail, Lock, Chrome } from 'lucide-react'

export default function PortalLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLoading, setIsMagicLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/portal/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsMagicLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/portal/dashboard`,
        },
      })
      if (error) throw error
      setMessage('Check your email for the magic link!')
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link')
    } finally {
      setIsMagicLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/portal/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Google login failed')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card className="border-border/50 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">Client Access</CardTitle>
              <CardDescription>
                Secure billing and invoice management portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Button
                  variant="outline"
                  className="w-full font-semibold gap-2 border-slate-200 dark:border-slate-800"
                  onClick={handleGoogleLogin}
                >
                  <Chrome className="w-4 h-4 text-blue-500" />
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-medium">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <Tabs defaultValue="magic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-11 bg-slate-100 dark:bg-slate-800 p-1">
                    <TabsTrigger value="magic" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-none">Magic Link</TabsTrigger>
                    <TabsTrigger value="password" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-none">Password</TabsTrigger>
                  </TabsList>

                  <TabsContent value="magic">
                    <form onSubmit={handleMagicLink} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="magic-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="magic-email"
                            type="email"
                            placeholder="m@example.com"
                            className="pl-10 h-11"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-bold" disabled={isMagicLoading}>
                        {isMagicLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Magic Link
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="password">
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            className="pl-10 h-11"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Link href="/portal/reset-password" className="text-xs text-indigo-600 hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            className="pl-10 h-11"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-bold" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md text-sm text-green-600 dark:text-green-400">
                    {message}
                  </div>
                )}
              </div>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have a portal account?{' '}
                <Link
                  href="/portal/register"
                  className="text-indigo-600 font-semibold hover:underline underline-offset-4"
                >
                  Create one now
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
