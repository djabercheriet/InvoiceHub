'use client'

import * as React from 'react'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
 DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormDialogProps {
 title: string
 description?: string
 triggerText?: string
 triggerVariant?:"default" |"outline" |"secondary" |"ghost"
 triggerIcon?:"plus" |"edit" |"none"
 isOpen: boolean
 onOpenChange: (open: boolean) => void
 children: React.ReactNode
 onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>
 loading?: boolean
 submitText?: string
 cancelText?: string
 className?: string
 size?:"md" |"lg" |"xl" |"full"
}

export function FormDialog({
 title,
 description,
 triggerText,
 triggerVariant ="default",
 triggerIcon ="plus",
 isOpen,
 onOpenChange,
 children,
 onSubmit,
 loading = false,
 submitText ="Save Changes",
 cancelText ="Cancel",
 className,
 size ="md"
}: FormDialogProps) {
 
 const sizeClasses = {
 md:"sm:max-w-[500px]",
 lg:"sm:max-w-[700px]",
 xl:"sm:max-w-[900px]",
 full:"sm:max-w-[95vw] sm:h-[90vh]"
 }

 return (
 <Dialog open={isOpen} onOpenChange={onOpenChange}>
 {triggerText && (
 <DialogTrigger asChild>
 <Button variant={triggerVariant} className="gap-2 font-bold tracking-tight shadow-sm">
 {triggerIcon ==="plus" && <Plus className="w-4 h-4" />}
 {triggerIcon ==="edit" && <Edit className="w-4 h-4" />}
 {triggerText}
 </Button>
 </DialogTrigger>
 )}
 <DialogContent className={cn("glass-card border-border/60 shadow-2xl animate-in zoom-in-95", sizeClasses[size], className)}>
 <DialogHeader className="space-y-3 pb-4">
 <DialogTitle className="text-xl font-bold text-foreground">
 {title}
 </DialogTitle>
 {description && (
 <DialogDescription className="text-muted-foreground font-medium">
 {description}
 </DialogDescription>
 )}
 </DialogHeader>
 
 <form onSubmit={(e) => {
 e.preventDefault();
 onSubmit(e);
 }} className="space-y-6">
 <div className="max-h-[60vh] overflow-y-auto px-1 py-1 space-y-4">
 {children}
 </div>
 
 <DialogFooter className="border-t pt-4 gap-2">
 <Button 
 type="button" 
 variant="outline" 
 onClick={() => onOpenChange(false)}
 disabled={loading}
 className="font-bold border-border/60 hover:bg-muted/50"
 >
 {cancelText}
 </Button>
 <Button 
 type="submit" 
 disabled={loading}
 className="font-bold bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
 >
 {loading ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Processing...
 </>
 ) : (
 submitText
 )}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 )
}

