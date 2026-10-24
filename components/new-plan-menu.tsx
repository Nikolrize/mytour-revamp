"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NewPlanMenuProps } from "@/lib/type";
import { ChevronDown, Pencil, Sparkles } from "lucide-react";
import Link from "next/link";

export function NewPlanMenu({
  label = "Start planning",
  className,
}: NewPlanMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button className={className} />}>
        {label}
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href="/plan" />}>
          <Sparkles className="size-4" />
          Plan with AI
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/plan/manual" />}>
          <Pencil className="size-4" />
          Plan manually
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
