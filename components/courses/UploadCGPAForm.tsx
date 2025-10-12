"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadCgpaAction, updateStudentPositionsAction } from "@/app/courses/cgpaupdate/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UploadCgpaForm() {
  const [session, setSession] = useState("");

  const handleUpdatePositions = async () => {
    if (!session) {
      toast.error("Please enter a session (e.g., 2022-2023)");
      return;
    }

    setLoading(true);
    const result = await updateStudentPositionsAction(session);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<
    { regNo: string; creditCompleted: string; cgpa: string }[]
  >([]);

  // Parse CSV immediately on file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setParsedData([]); // reset previous preview

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as {
            regNo: string;
            creditCompleted: string;
            cgpa: string;
          }[];
          setParsedData(data); // show preview
        },
        error: (error) => {
          console.error(error);
          toast.error("Error parsing CSV");
        },
      });
    }
  };

  const handleUpload = async () => {
    if (!file || parsedData.length === 0) {
      toast.error("Please select a CSV file and ensure it has data.");
      return;
    }

    setLoading(true);

    try {
      const response = await uploadCgpaAction(parsedData);

      if (response.success) {
        toast.success("CGPA Uploaded Successfully");
        setFile(null);
        setParsedData([]);
      } else {
        toast.error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 items-center">
        <Input type="file" accept=".csv" onChange={handleFileChange} />
        <Button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
        <Input
        placeholder="Enter session (e.g. 2022-2023)"
        value={session}
        onChange={(e) => setSession(e.target.value)}
      />
      <Button onClick={handleUpdatePositions} disabled={loading}>
        {loading ? "Updating..." : "Update Ranks"}
      </Button>
      </div>
      <p className="text-sm text-muted-foreground">The CSV file must contain these headers: <b className="text-red-500">regNo, cgpa, creditCompleted</b></p>

      {/* Preview Table */}
      {parsedData.length > 0 && (
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reg No</TableHead>
                <TableHead>Credit Completed</TableHead>
                <TableHead>CGPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.regNo}</TableCell>
                  <TableCell>{row.creditCompleted}</TableCell>
                  <TableCell>{row.cgpa}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}