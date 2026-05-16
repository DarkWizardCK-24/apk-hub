"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getSupabase } from "@/lib/supabase/client";
import { formatFileSize, timeAgo } from "@/lib/helpers";
import { PageLoader } from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import {
  HiOutlineDownload,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineDocument,
  HiOutlineClipboardCopy,
  HiOutlineTag,
  HiOutlineDesktopComputer,
  HiOutlineCube,
  HiOutlineUser,
} from "react-icons/hi";
import { SiAndroid, SiApple, SiReact } from "react-icons/si";

const platformIcons = { Android: SiAndroid, iOS: SiApple, Web: SiReact };

export default function SharePage() {
  const { token } = useParams();
  const supabase = getSupabase();
  const [build, setBuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchBuild();
  }, [token]);

  const fetchBuild = async () => {
    const { data, error } = await supabase
      .from("builds")
      .select("*, profiles(full_name)")
      .eq("share_token", token)
      .single();

    if (error || !data) {
      setNotFound(true);
    } else {
      setBuild(data);
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Get signed URL
      const { data, error } = await supabase.storage
        .from("builds")
        .createSignedUrl(build.file_path, 60);

      if (error) throw error;

      // Increment download count
      await supabase
        .from("builds")
        .update({ download_count: (build.download_count || 0) + 1 })
        .eq("id", build.id);

      // Trigger download
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = build.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setBuild((prev) => ({
        ...prev,
        download_count: (prev.download_count || 0) + 1,
      }));
      toast.success("Download started!");
    } catch (err) {
      toast.error("Download failed. Please try again.");
    }
    setDownloading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return <PageLoader />;

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-danger/10">
            <HiOutlineDocument className="text-danger" size={40} />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Build not found</h1>
          <p className="mt-2 text-text-muted">
            This share link is invalid or the build has been removed.
          </p>
        </motion.div>
      </div>
    );
  }

  const Icon = platformIcons[build.platform] || SiAndroid;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-card-border bg-card-bg p-8 shadow-xl shadow-primary/5 sm:p-10"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
            <Icon size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{build.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge color="primary">{build.version}</Badge>
              <Badge color="success">{build.platform}</Badge>
              <Badge color="secondary">{build.build_type}</Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        {build.description && (
          <div className="mt-6 rounded-xl bg-background p-4">
            <p className="text-sm font-medium mb-1">Release Notes</p>
            <p className="text-sm leading-relaxed text-text-muted whitespace-pre-wrap">
              {build.description}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-card-border p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <HiOutlineDocument size={16} />
              <span className="text-xs">File</span>
            </div>
            <p className="mt-1 truncate text-sm font-medium">{build.file_name}</p>
          </div>
          <div className="rounded-xl border border-card-border p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <HiOutlineCube size={16} />
              <span className="text-xs">Size</span>
            </div>
            <p className="mt-1 text-sm font-medium">{formatFileSize(build.file_size)}</p>
          </div>
          <div className="rounded-xl border border-card-border p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <HiOutlineUser size={16} />
              <span className="text-xs">Shared by</span>
            </div>
            <p className="mt-1 text-sm font-medium">
              {build.profiles?.full_name || "Developer"}
            </p>
          </div>
          <div className="rounded-xl border border-card-border p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <HiOutlineClock size={16} />
              <span className="text-xs">Uploaded</span>
            </div>
            <p className="mt-1 text-sm font-medium">{timeAgo(build.created_at)}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 flex items-center justify-between rounded-xl border border-card-border p-4">
          <div className="flex items-center gap-2">
            <HiOutlineDownload className="text-primary" size={18} />
            <span className="text-sm">
              <span className="font-semibold">{build.download_count || 0}</span>{" "}
              <span className="text-text-muted">downloads</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-success">
            <HiOutlineShieldCheck size={16} />
            <span className="font-medium">Secure</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleDownload}
            loading={downloading}
            className="flex-1"
            size="lg"
          >
            <HiOutlineDownload size={18} />
            Download Build
          </Button>
          <Button
            variant="secondary"
            onClick={copyLink}
            size="lg"
          >
            <HiOutlineClipboardCopy size={18} />
            Copy Link
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-text-muted">
          Shared securely via ApkHub
        </p>
      </motion.div>
    </div>
  );
}
