'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { CreditCard, Check, Zap, Sparkles, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminPlansPage() {
  const plans = [
    { name: 'Free', price: '$0', icon: CreditCard, color: 'text-slate-400' },
    { name: 'Pro', price: '$29', icon: Zap, color: 'text-blue-500' },
    { name: 'Enterprise', price: '$99', icon: Sparkles, color: 'text-purple-500' }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Pricing & Plans</h1>
        <p className="text-muted-foreground mt-2">Manage subscription tiers and global usage limits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className="relative overflow-hidden border-2 border-indigo-50 shadow-lg">
            <CardHeader className="text-center">
              <div className={`p-3 rounded-full w-fit mx-auto bg-slate-100 mb-4 ${plan.color}`}>
                <plan.icon className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>/month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Basic Features</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Unlimited Support</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Edit Settings</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="border-indigo-100 bg-indigo-50/20 shadow-none border-dashed border-2">
        <CardContent className="py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Building className="w-10 h-10 text-indigo-400" />
            <div>
              <h3 className="font-semibold">Ready to Link</h3>
              <p className="text-sm text-muted-foreground">The pricing structure is live. All plans are linked to the <code className="bg-white px-1">subscription_plans</code> table.</p>
            </div>
          </div>
          <Button variant="outline" className="border-indigo-200">Global Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}
