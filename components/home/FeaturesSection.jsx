"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import {
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineCloudUpload,
  HiOutlineTag,
} from "react-icons/hi";

const features = [
  {
    icon: HiOutlineShieldCheck,
    title: "End-to-End Security",
    desc: "All builds are encrypted during transit and at rest. Share with confidence knowing your code is protected.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: HiOutlineTag,
    title: "Version Control",
    desc: "Tag every build with semantic versions. Keep a complete history and roll back to any previous version instantly.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: HiOutlineUserGroup,
    title: "Team Collaboration",
    desc: "Invite team members, set permissions, and manage access. Everyone gets the right build at the right time.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: HiOutlineLightningBolt,
    title: "Instant Distribution",
    desc: "Generate shareable links or QR codes. Recipients can download builds with a single tap on any device.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: HiOutlineCloudUpload,
    title: "Multi-Platform Support",
    desc: "Share APKs, IPAs, AABs, web bundles, and more. One platform for all your build artifacts.",
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    icon: HiOutlineCog,
    title: "CI/CD Integration",
    desc: "Plug into your existing pipeline. Auto-upload builds from GitHub Actions, Jenkins, or any CI system.",
    color: "text-primary-light",
    bg: "bg-primary-light/10",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function FeaturesSection() {
  return (
    <section className="relative py-20 sm:py-28" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Features
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Everything you need to{" "}
            <span className="gradient-text">ship faster</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-muted">
            Built for developer teams who need a secure, fast, and reliable way
            to share builds across platforms and devices.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feat) => (
            <Card key={feat.title}>
              <div className={`mb-4 inline-flex rounded-xl p-3 ${feat.bg}`}>
                <feat.icon className={feat.color} size={24} />
              </div>
              <h3 className="text-lg font-semibold">{feat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {feat.desc}
              </p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
