"use client";

import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

type CsvUser = {
  regNo: string;
  email?: string;
  session?: string;
  fullName?: string;
  gender?: string;
  phoneNumber?: string;
};

function parseCsv(content: string): CsvUser[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1);
  const indices = {
    regno: header.indexOf("regno"),
    email: header.indexOf("email"),
    session: header.indexOf("session"),
    name: header.indexOf("name"),
    gender: header.indexOf("gender"),
    phonenumber: header.indexOf("mobile"),
  } as const;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requiredMissing = ["regno", "email", "session"].filter((k) => (indices as any)[k] === -1);
  if (requiredMissing.length > 0) {
    throw new Error(
      `Missing required columns: ${requiredMissing
        .map((c) => c.toUpperCase())
        .join(", ")}.`
    );
  }
  return rows
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      return {
        regNo: cols[indices.regno] || "",
        email: indices.email >= 0 ? cols[indices.email] || undefined : undefined,
        session:
          indices.session >= 0 ? cols[indices.session] || undefined : undefined,
        fullName:
          indices.name >= 0 ? cols[indices.name] || undefined : undefined,
        gender:
          indices.gender >= 0 ? cols[indices.gender] || undefined : undefined,
        phoneNumber:
          indices.phonenumber >= 0 ? cols[indices.phonenumber] || undefined : undefined,
      };
    })
    .filter((u) => u.regNo && u.email && u.session);
}

export default function CsvImportUsers() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<CsvUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  // Manual add state
  const [mRegNo, setMRegNo] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mSession, setMSession] = useState("");
  const [mLoading, setMLoading] = useState(false);
  const [mError, setMError] = useState<string | null>(null);
  const [mMsg, setMMsg] = useState<string | null>(null);

  async function handleFileChange(file: File | null) {
    setError(null);
    setResultMsg(null);
    if (!file) {
      setRows([]);
      return;
    }
    const text = await file.text();
    try {
      const parsed = parseCsv(text);
      setRows(parsed);
    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) {
      setError(e?.message || "Failed to parse CSV");
      setRows([]);
    }
  }

  async function handleUpload() {
    setIsUploading(true);
    setResultMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setResultMsg(
        `Imported ${data?.created ?? 0}. Skipped ${data?.skipped ?? 0}. Errors: ${data?.errors?.length ?? 0}.`
      );
    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  const hasData = rows.length > 0;
  const preview = useMemo(() => rows.slice(0, 50), [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          className="max-w-md"
        />
        <Button
          variant="secondary"
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.value = "";
            setRows([]);
            setError(null);
            setResultMsg(null);
          }}
        >
          Clear
        </Button>
        <Button disabled={!hasData || isUploading} onClick={handleUpload}>
          {isUploading ? "Uploading..." : `Upload ${hasData ? `(${rows.length})` : ""}`}
        </Button>
      </div>
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {resultMsg && (
        <div className="text-sm text-green-600">{resultMsg}</div>
      )}
      <Separator />
      <div className="text-sm text-muted-foreground">
        Required headers: regNo, email, session. Optional: name, gender, phoneNumber. Role defaults to &quot;student&quot;.
      </div>
      {hasData && (
        <div className="rounded-md border overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left">regNo</th>
                <th className="px-3 py-2 text-left">fullName</th>
                <th className="px-3 py-2 text-left">email</th>
                <th className="px-3 py-2 text-left">session</th>
                <th className="px-3 py-2 text-left">gender</th>
                <th className="px-3 py-2 text-left">phoneNumber</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} className="border-b">
                  <td className="px-3 py-2">{r.regNo}</td>
                  <td className="px-3 py-2">{r.fullName ?? ""}</td>
                  <td className="px-3 py-2">{r.email ?? ""}</td>
                  <td className="px-3 py-2">{r.session ?? ""}</td>
                  <td className="px-3 py-2">{r.gender ?? ""}</td>
                  <td className="px-3 py-2">{r.phoneNumber ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > preview.length && (
            <div className="p-2 text-xs text-muted-foreground">
              Showing first {preview.length} of {rows.length}
            </div>
          )}
        </div>
      )}

      <Separator />
      <div className="space-y-3">
        <div className="text-sm font-medium">Add single user</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2.5">
            <Label htmlFor="manual-regno">Registration No</Label>
            <Input id="manual-regno" value={mRegNo} onChange={(e) => setMRegNo(e.target.value)} placeholder="e.g. 202x8310xx" />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="manual-email">Email</Label>
            <Input id="manual-email" type="email" value={mEmail} onChange={(e) => setMEmail(e.target.value)} placeholder="student@example.com" />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="manual-session">Session</Label>
            <Input id="manual-session" value={mSession} onChange={(e) => setMSession(e.target.value)} placeholder="e.g. 2023-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={async () => {
              setMError(null);
              setMMsg(null);
              if (!mRegNo || !mEmail || !mSession) {
                setMError("Please fill regNo, email and session.");
                return;
              }
              setMLoading(true);
              try {
                const res = await fetch("/api/students/import", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ users: [{ regNo: mRegNo, email: mEmail, session: mSession }] }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed");
                setMMsg(`Imported ${data?.created ?? 0}, Skipped ${data?.skipped ?? 0}`);
                setMRegNo("");
                setMEmail("");
                setMSession("");
              } 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              catch (e: any) {
                setMError(e?.message || "Failed");
              } finally {
                setMLoading(false);
              }
            }}
            disabled={mLoading}
          >
            {mLoading ? "Adding..." : "Add user"}
          </Button>
          {mError && <div className="text-sm text-red-600">{mError}</div>}
          {mMsg && <div className="text-sm text-green-600">{mMsg}</div>}
        </div>
      </div>
    </div>
  );
}


