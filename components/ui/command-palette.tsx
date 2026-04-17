"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, FileText, Users, Box, Wallet, Settings, Activity, Sparkles, Building2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => unknown) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <>
      <style jsx global>{`
        /* CmdK Styling Overlay */
        .cmdk-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          z-index: 9999;
          animation: cmkdFadeIn 0.2s ease-out;
        }

        .cmdk-dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          max-width: 640px;
          background: hsl(var(--background));
          border-radius: 16px;
          border: 1px solid hsl(var(--border) / 0.5);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          z-index: 10000;
          overflow: hidden;
          animation: cmdkSlideDown 0.2s ease-out;
        }

        .cmdk-input-wrapper {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid hsl(var(--border) / 0.3);
        }

        .cmdk-input-icon {
          width: 20px;
          height: 20px;
          color: hsl(var(--muted-foreground));
          margin-right: 12px;
        }

        [cmdk-input] {
          all: unset;
          width: 100%;
          font-size: 18px;
          color: hsl(var(--foreground));
        }

        [cmdk-input]::placeholder {
          color: hsl(var(--muted-foreground) / 0.5);
        }

        [cmdk-list] {
          max-height: 400px;
          overflow: auto;
          padding: 12px;
        }

        [cmdk-group-heading] {
          padding: 8px 12px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
          color: hsl(var(--muted-foreground));
        }

        [cmdk-item] {
          content-visibility: auto;
          cursor: pointer;
          height: 48px;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          color: hsl(var(--foreground) / 0.8);
          user-select: none;
          transition: all 0.1s ease;
          font-weight: 500;
        }

        [cmdk-item][data-selected="true"] {
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
        }

        [cmdk-item] svg {
          width: 18px;
          height: 18px;
          color: inherit;
          opacity: 0.7;
        }

        [cmdk-item][data-selected="true"] svg {
          opacity: 1;
        }

        @keyframes cmkdFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes cmdkSlideDown {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
      
      <div className="cmdk-overlay" onClick={() => setOpen(false)} />
      
      <div className="cmdk-dialog">
        <Command label="Global Command Palette" shouldFilter={true}>
          <div className="cmdk-input-wrapper">
            <Search className="cmdk-input-icon" />
            <Command.Input placeholder="Search anything... (Invoices, Customers, Settings)" autoFocus />
          </div>
          
          <Command.List>
            <Command.Empty className="p-12 text-center text-sm font-medium text-muted-foreground flex flex-col items-center gap-3">
              <Sparkles className="w-8 h-8 opacity-20" />
              No results found for that query.
            </Command.Empty>

            <Command.Group heading="Financial Operations">
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/sales/invoices"))}>
                <FileText /> Invoices Registry
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/sales/invoices"))}>
                <Plus /> Create New Invoice
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/sales/quotes"))}>
                <FileText /> Quotes & Estimations
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Inventory & Procurement">
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/inventory"))}>
                <Box /> Products Master List
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/inventory/movements"))}>
                <Activity /> Stock Movements
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/inventory/purchase-orders"))}>
                <FileText /> Purchase Orders
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/inventory/suppliers"))}>
                <Building2 /> Manage Suppliers
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Stakeholders">
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/sales/customers"))}>
                <Users /> View Customer Database
              </Command.Item>
            </Command.Group>
            
            <Command.Group heading="General & Admin">
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                <Settings /> Workspace Settings
              </Command.Item>
            </Command.Group>

          </Command.List>
        </Command>
      </div>
    </>
  );
}
