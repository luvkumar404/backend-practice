import { Link } from "react-router-dom";
import { ArrowRight, Cloud, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const securitySteps: [string, string, LucideIcon][] = [
  ["Validate file", "Allowed type and size confirmed", FileCheck2],
  ["Scan for malware", "Clean result required before upload", ShieldCheck],
  ["Store privately", "Cloudinary authenticated asset", Cloud],
];

export default function Landing() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="page-shell grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
              <ShieldCheck size={16} />
              JWT protected uploads with malware scanning
            </div> */}
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Secure file sharing for private documents.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Upload files safely, scan them before storage, and share access with expiring links
              and optional passwords.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary">
                Create account
                <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
            </div>
          </div>

          <div className="surface overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Secure upload</p>
                  <h2 className="mt-1 text-xl font-semibold">project-details.pdf</h2>
                </div>
                <LockKeyhole size={24} />
              </div>
            </div>
            <div className="space-y-4 p-5">
              {securitySteps.map(([title, text, Icon]) => (
                <div key={title} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon size={21} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{title}</p>
                    <p className="mt-1 text-sm text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
