'use client'

import * as React from 'react'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { 
 Search, 
 MoreHorizontal, 
 Edit, 
 Trash2, 
 ChevronLeft, 
 ChevronRight,
 Filter
} from 'lucide-react'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface DataTableProps<T> {
 data: T[]
 columns: {
 header: string
 accessorKey: keyof T | string
 cell?: (row: T) => React.ReactNode
 className?: string
 }[]
 searchPlaceholder?: string
 onEdit?: (row: T) => void
 onDelete?: (row: T) => void
 loading?: boolean
 actions?: (row: T) => React.ReactNode
}

export function DataTable<T extends { id: string }>({
 data,
 columns,
 searchPlaceholder ="Search...",
 onEdit,
 onDelete,
 loading = false,
 actions
}: DataTableProps<T>) {
 const [searchTerm, setSearchTerm] = React.useState("")

 const filteredData = React.useMemo(() => {
 if (!searchTerm) return data
 return data.filter((item) => {
 return Object.values(item).some((val) =>
 String(val).toLowerCase().includes(searchTerm.toLowerCase())
 )
 })
 }, [data, searchTerm])

 return (
 <div className="space-y-4 animate-in fade-in duration-500">
 <div className="flex items-center justify-between gap-4">
 <div className="relative flex-1 max-w-sm">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder={searchPlaceholder}
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
 />
 </div>
 <div className="flex items-center gap-2">
 <Button variant="outline" size="sm" className="h-9 gap-2 border-dashed border-border">
 <Filter className="h-4 w-4" />
 Filter
 </Button>
 </div>
 </div>

 <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm">
 <Table>
 <TableHeader className="bg-muted/30">
 <TableRow className="hover:bg-transparent border-border/50">
 {columns.map((col, i) => (
 <TableHead key={i} className={cn("text-xs font-bold tracking-widest text-muted-foreground py-4", col.className)}>
 {col.header}
 </TableHead>
 ))}
 {(onEdit || onDelete || actions) && (
 <TableHead className="w-[80px] text-right py-4"></TableHead>
 )}
 </TableRow>
 </TableHeader>
 <TableBody>
 {loading ? (
 Array.from({ length: 5 }).map((_, i) => (
 <TableRow key={i} className="border-border/40">
 {columns.map((_, j) => (
 <TableCell key={j} className="py-4">
 <Skeleton className="h-4 w-full opacity-40" />
 </TableCell>
 ))}
 {(onEdit || onDelete || actions) && (
 <TableCell className="py-4">
 <Skeleton className="h-8 w-8 rounded-md mx-auto opacity-40" />
 </TableCell>
 )}
 </TableRow>
 ))
 ) : filteredData.length === 0 ? (
 <TableRow>
 <TableCell
 colSpan={columns.length + 1}
 className="h-32 text-center text-muted-foreground font-medium"
 >
 No results found matching your search pulse.
 </TableCell>
 </TableRow>
 ) : (
 filteredData.map((row) => (
 <TableRow key={row.id} className="group border-border/40 hover:bg-muted/20 transition-colors">
 {columns.map((col, i) => (
 <TableCell key={i} className={cn("py-4 text-sm font-medium", col.className)}>
 {col.cell ? col.cell(row) : String(row[col.accessorKey as keyof T] ||"-")}
 </TableCell>
 ))}
 {(onEdit || onDelete || actions) && (
 <TableCell className="text-right py-2">
 {actions ? (
 actions(row)
 ) : (
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
 <span className="sr-only">Open menu</span>
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-40 glass-card">
 <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground">Actions</DropdownMenuLabel>
 {onEdit && (
 <DropdownMenuItem onClick={() => onEdit(row)} className="gap-2">
 <Edit className="h-4 w-4" /> Edit
 </DropdownMenuItem>
 )}
 <DropdownMenuSeparator />
 {onDelete && (
 <DropdownMenuItem 
 onClick={() => onDelete(row)} 
 className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
 >
 <Trash2 className="h-4 w-4" /> Delete
 </DropdownMenuItem>
 )}
 </DropdownMenuContent>
 </DropdownMenu>
 )}
 </TableCell>
 )}
 </TableRow>
 ))
 )}
 </TableBody>
 </Table>
 </div>

 {!loading && filteredData.length > 0 && (
 <div className="flex items-center justify-between px-2 py-4">
 <div className="text-xs text-muted-foreground font-medium">
 Showing <span className="font-bold text-foreground">{filteredData.length}</span> of <span className="font-bold text-foreground">{data.length}</span> entries
 </div>
 <div className="flex items-center gap-2">
 <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" disabled>
 <ChevronLeft className="h-4 w-4" />
 </Button>
 <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" disabled>
 <ChevronRight className="h-4 w-4" />
 </Button>
 </div>
 </div>
 )}
 </div>
 )
}


