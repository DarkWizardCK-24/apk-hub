"use client";

import { HiOutlineSearch } from "react-icons/hi";

export default function SearchInput({ value, onChange, placeholder = "Search builds..." }) {
  return (
    <div className="relative">
      <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-card-border bg-card-bg py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
