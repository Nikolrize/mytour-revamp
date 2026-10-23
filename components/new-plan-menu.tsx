"use client";

import Link from "next/link";
import { ChevronDown, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function NewPlanMenu({
  label = "Start planning",
  className,
}: {
  label?: string;
  className?: string;
}) {
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
