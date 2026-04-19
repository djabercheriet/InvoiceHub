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
import { EmptyState } from '@/components/ui/empty-state'

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
 className?: string
}

export function DataTable<T extends { id: string }>({
 data,
 columns,
 searchPlaceholder ="Search...",
 onEdit,
 onDelete,
 loading = false,
 actions,
 className
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

  <div className={cn("rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden shadow-2xl", className)}>
    <Table>
      <TableHeader className="bg-muted/30 border-b border-border/40">
        <TableRow className="hover:bg-transparent border-none">
          {columns.map((col, i) => (
            <TableHead key={i} className={cn("py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px] h-auto whitespace-nowrap", col.className)}>
              {col.header}
            </TableHead>
          ))}
          {(onEdit || onDelete || actions) && (
            <TableHead className="w-[100px] text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px] h-auto whitespace-nowrap">Control</TableHead>
          )}
        </TableRow>
      </TableHeader>
        <TableBody className="divide-y divide-border/20">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-none">
                {columns.map((_, j) => (
                  <TableCell key={j} className="py-8 px-8">
                    <Skeleton className="h-4 w-full bg-muted/40 rounded-lg" />
                  </TableCell>
                ))}
                {(onEdit || onDelete || actions) && (
                  <TableCell className="py-8 px-8">
                    <Skeleton className="h-8 w-8 rounded-xl mx-auto bg-muted/40" />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : filteredData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions || onEdit || onDelete ? 1 : 0)}
                className="p-0 border-0"
              >
                <EmptyState 
                  title="No Record Found" 
                  description={searchTerm ? "No results found matching your search pulse. Try adjusting your query." : "There is no data to display here yet."}
                  icon={Search}
                />
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((row) => (
              <tr key={row.id} className="group hover:bg-muted/20 transition-colors border-none">
                {columns.map((col, i) => (
                  <td key={i} className={cn("py-6 px-8 text-sm font-medium text-foreground tracking-tight", col.className)}>
                    {col.cell ? col.cell(row) : String(row[col.accessorKey as keyof T] || "-")}
                  </td>
                ))}
                {(onEdit || onDelete || actions) && (
                  <td className="text-right py-6 px-8">
                    {actions ? (
                      actions(row)
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 border border-transparent hover:border-border/40 rounded-xl transition-all">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 glass-card border-border/50 p-2 shadow-2xl">
                          <DropdownMenuLabel className="p-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Node Operations</DropdownMenuLabel>
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(row)} className="flex items-center gap-3 p-3 rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors">
                              <Edit className="h-4 w-4" /> 
                              <span className="font-bold text-xs uppercase tracking-widest">Update Data</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-border/40 mx-1" />
                          {onDelete && (
                            <DropdownMenuItem 
                              onClick={() => onDelete(row)} 
                              className="flex items-center gap-3 p-3 rounded-xl focus:bg-destructive/10 focus:text-destructive text-destructive cursor-pointer transition-colors"
                            >
                              <Trash2 className="h-4 w-4" /> 
                              <span className="font-bold text-xs uppercase tracking-widest">Wipe Asset</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                )}
              </tr>
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


