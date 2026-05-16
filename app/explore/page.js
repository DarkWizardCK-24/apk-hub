"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase } from "@/lib/supabase/client";
import { formatFileSize, timeAgo } from "@/lib/helpers";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SearchInput from "@/components/ui/SearchInput";
import { SkeletonCard } from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import {
  HiOutlineDownload,
  HiOutlineClock,
  HiOutlineFilter,
  HiOutlineLink,
  HiOutlineClipboardCopy,
} from "react-icons/hi";
import { SiAndroid, SiApple, SiReact } from "react-icons/si";

const platformIcons = { Android: SiAndroid, iOS: SiApple, Web: SiReact };
const platforms = ["All", "Android", "iOS", "Web"];

export default function ExplorePage() {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activePlatform, setActivePlatform] = useState("All");
  const supabase = getSupabase();

  useEffect(() => {
    fetchBuilds();
  }, []);

  const fetchBuilds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("builds")
      .select("*, profiles(full_name)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Failed to load builds");
    } else {
      setBuilds(data || []);
    }
    setLoading(false);
  };

  const filtered = builds.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.version.toLowerCase().includes(search.toLowerCase());
    const matchPlatform =
      activePlatform === "All" || b.platform === activePlatform;
    return matchSearch && matchPlatform;
  });

  const copyShareLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
    toast.success("Share link copied!");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold sm:text-4xl">
          Explore <span className="gradient-text">Builds</span>
        </h1>
        <p className="mt-2 text-text-muted">
          Browse and discover shared builds from developer teams.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or version..."
          />
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineFilter className="text-text-muted" size={18} />
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activePlatform === p
                  ? "bg-primary text-white"
                  : "bg-card-bg border border-card-border text-text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((build) => {
              const Icon = platformIcons[build.platform] || SiAndroid;
              return (
                <motion.div
                  key={build.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
                        <Icon size={22} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold">{build.title}</h3>
                          <Badge color="primary">{build.version}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-text-muted">
                          {build.platform} &middot; {build.build_type} &middot;{" "}
                          {formatFileSize(build.file_size)}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          by {build.profiles?.full_name || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <HiOutlineClock size={14} />
                        {timeAgo(build.created_at)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <HiOutlineDownload size={14} />
                          {build.download_count}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyShareLink(build.share_token);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary opacity-0 transition-all group-hover:opacity-100"
                        >
                          <HiOutlineClipboardCopy size={13} />
                          Share
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-lg font-medium text-text-muted">No builds found</p>
          <p className="mt-1 text-sm text-text-muted">
            {builds.length === 0
              ? "No public builds have been shared yet. Be the first!"
              : "Try adjusting your search or filter criteria."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
