"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import { formatFileSize, timeAgo } from "@/lib/helpers";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Spinner";
import {
  HiOutlineDownload,
  HiOutlineClock,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { SiAndroid, SiApple, SiReact } from "react-icons/si";

const platformIcons = { Android: SiAndroid, iOS: SiApple, Web: SiReact };
const badgeColors = { Android: "success", iOS: "secondary", Web: "accent" };

export default function RecentBuildsSection() {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("builds")
        .select("*, profiles(full_name)")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(6);

      setBuilds(data || []);
      setLoading(false);
    };
    fetchRecent();
  }, []);

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Recent
            </span>
            <h2 className="mt-2 text-3xl font-bold">Latest Shared Builds</h2>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
          >
            View all builds
            <HiOutlineArrowRight size={16} />
          </Link>
        </motion.div>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : builds.length === 0 ? (
          <div className="mt-10 text-center py-16">
            <p className="text-text-muted">
              No public builds shared yet. Be the first to{" "}
              <Link href="/upload" className="text-primary font-medium hover:underline">
                upload a build
              </Link>
              !
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => {
              const Icon = platformIcons[build.platform] || SiAndroid;
              const color = badgeColors[build.platform] || "primary";
              return (
                <Link key={build.id} href={`/share/${build.share_token}`}>
                  <Card>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
                        <Icon size={22} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold">{build.title}</h3>
                          <Badge color={color}>{build.version}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-text-muted">
                          {build.platform} &middot; {build.build_type} &middot;{" "}
                          {formatFileSize(build.file_size)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <HiOutlineClock size={14} />
                        {timeAgo(build.created_at)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <HiOutlineDownload size={14} />
                        {build.download_count || 0} downloads
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
