"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getYear = () => new Date().getFullYear();
const getServerYear = () => 0;

export function CurrentYear() {
  const year = useSyncExternalStore(subscribe, getYear, getServerYear);

  return <span>© {year ? `${year} ` : ""}MYTOUR</span>;
}
