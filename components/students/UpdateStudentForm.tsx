"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { findStudent, updateStudentInfo } from "@/app/info-update/actions";

const schema = z.object({
  linkedin: z.string().optional(),
  github: z.string().optional(),
  facebook: z.string().optional(),
  profilePic: z.any().optional(),
});

export default function UpdateStudentPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [student, setStudent] = useState<any>(null);
  const [searchRegNo, setSearchRegNo] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const handleSearch = () => {
    startTransition(async () => {
      const result = await findStudent(searchRegNo);
      if (result) {
        setStudent(result);
        toast.success(`Found ${result.fullName}`);
      } else {
        setStudent(null);
        toast.error("No student found with that RegNo");
      }
    });
  };

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (!student) return;
    const formData = new FormData();
    if (data.profilePic?.[0]) formData.append("profilePic", data.profilePic[0]);
    if (data.linkedin) formData.append("linkedin", data.linkedin);
    if (data.github) formData.append("github", data.github);
    if (data.facebook) formData.append("facebook", data.facebook);

    startTransition(async () => {
      const res = await updateStudentInfo(student.id, formData);
      res.success ? toast.success(res.message) : toast.error(res.message);
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Search Section */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter RegNo"
          value={searchRegNo}
          onChange={(e) => setSearchRegNo(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={isPending} type="submit">
          {isPending ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Update Section */}
      {student && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Current Info */}
          <Card className="p-4 rounded-md">
            <CardTitle>Current Info</CardTitle>
            <CardContent className="flex flex-col items-center gap-4">
              <Image
                src={student.profilePic || "/default-avatar.png"}
                alt={student.fullName}
                width={120}
                height={120}
                className="rounded-sm object-cover"
              />
              <h2 className="font-semibold">{student.fullName}</h2>
              <p className="text-sm text-gray-500">{student.regNo}</p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">LinkedIn:</span>{" "}
                  {student.linkedinId || "Not set"}
                </p>
                <p>
                  <span className="font-medium">GitHub:</span>{" "}
                  {student.githubId || "Not set"}
                </p>
                <p>
                  <span className="font-medium">Facebook:</span>{" "}
                  {student.facebook || "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Update Form */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 border p-4 rounded-md"
          >
            <h2 className="font-semibold text-lg">Update Info</h2>

            <div>
              <Label className="mb-2">Profile Image</Label>
              <Input type="file" {...form.register("profilePic")} />
            </div>

            <div>
              <Label className="mb-2">LinkedIn</Label>
              <Input
                placeholder={student.linkedinId || "https://linkedin.com/in/username"}
                {...form.register("linkedin")}
              />
            </div>

            <div>
              <Label className="mb-2">GitHub</Label>
              <Input
                placeholder={student.githubId || "https://github.com/username"}
                {...form.register("github")}
              />
            </div>

            <div>
              <Label className="mb-2">Facebook</Label>
              <Input
                placeholder={student.facebook || "https://facebook.com/username"}
                {...form.register("facebook")}
              />
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Info"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}