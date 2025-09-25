"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, 
	TooltipContent, 
	TooltipProvider, 
	TooltipTrigger 
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";

type StudentRow = {
	id: string;
	regNo: string;
	fullName: string;
	email: string;
	session: string;
	avatarUrl?: string;
	role: string;
};

export default function StudentTable({ rows }: { rows: StudentRow[] }) {
	const [query, setQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const filteredRows = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return rows;
		return rows.filter((r) =>
			[r.fullName, r.regNo, r.email, r.session, r.role]
				.filter(Boolean)
				.some((v) => v.toLowerCase().includes(q))
		);
	}, [rows, query]);

	const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
	const safePage = Math.min(currentPage, totalPages);
	const start = (safePage - 1) * pageSize;
	const pageRows = filteredRows.slice(start, start + pageSize);

	const isAllPageSelected = pageRows.every((r) => selectedIds.has(r.id)) && pageRows.length > 0;
	const isSomePageSelected = pageRows.some((r) => selectedIds.has(r.id)) && !isAllPageSelected;

	function toggleSelectAllOnPage(checked: boolean) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (checked) {
				pageRows.forEach((r) => next.add(r.id));
			} else {
				pageRows.forEach((r) => next.delete(r.id));
			}
			return next;
		});
	}

	function toggleSelectOne(id: string, checked: boolean) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (checked) next.add(id);
			else next.delete(id);
			return next;
		});
	}

	function onDeleteSelected() {
		// eslint-disable-next-line no-console
		console.log("Delete selected:", Array.from(selectedIds));
		setSelectedIds(new Set());
	}

	return (
		<div className="rounded-md border">
			<div className="p-3 border-b flex items-center justify-between gap-3">
				<Input
					placeholder="Search by name, reg no, or email"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setCurrentPage(1);
					}}
					className="max-w-sm"
				/>
				<div className="text-xs text-muted-foreground">
					{selectedIds.size > 0 ? `${selectedIds.size} selected` : `${filteredRows.length} total`}
				</div>
			</div>
			<table className="w-full caption-bottom text-sm">
				<thead className="[&_tr]:border-b">
					<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
						<th className="h-10 px-4 align-middle w-10">
							<input
								type="checkbox"
								checked={isAllPageSelected}
								ref={(el) => {
									if (el) el.indeterminate = isSomePageSelected;
								}}
								onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
								className="h-4 w-4 rounded border"
							/>
						</th>
						<th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[140px]">
							Registration No
						</th>
						<th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
							Student
						</th>
						<th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
							Email
						</th>
						<th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
							Session
						</th>
						<th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
							Role
						</th>
						<th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground w-12">
							
						</th>
					</tr>
				</thead>
				<tbody className="[&_tr:last-child]:border-0">
					{pageRows.map((row) => (
						<tr
							key={row.id}
							className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
						>
							<td className="p-4 align-middle w-10">
								<input
									type="checkbox"
									checked={selectedIds.has(row.id)}
									onChange={(e) => toggleSelectOne(row.id, e.target.checked)}
									className="h-4 w-4 rounded border"
								/>
							</td>
							<td className="p-4 align-middle font-medium">{row.regNo}</td>
							<td className="p-4 align-middle">
								<div className="flex items-center gap-3">
									<Avatar className="h-8 w-8">
										<AvatarImage src={row.avatarUrl} alt={row.fullName} />
										<AvatarFallback>
											{row.fullName
												.split(" ")
												.map((s) => s[0])
												.join("")
												.toUpperCase()
												.slice(0, 2)}
										</AvatarFallback>
									</Avatar>
									<span>{row.fullName}</span>
								</div>
							</td>
							<td className="p-4 align-middle">{row.email}</td>
							<td className="p-4 align-middle">{row.session}</td>
							<td className="p-4 align-middle capitalize">{row.role}</td>
							<td className="p-4 align-middle text-right pr-12">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Link href={`/students/${row.id}`} className="inline-flex items-center justify-center">
												<Info className="h-4 w-4 text-muted-foreground" />
											</Link>
										</TooltipTrigger>
										<TooltipContent>View details</TooltipContent>
									</Tooltip>
								</TooltipProvider>
						</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex items-center justify-between gap-3 p-3 border-t">
				<Button variant="destructive" disabled={selectedIds.size === 0} onClick={onDeleteSelected}>
					Delete selected{selectedIds.size ? ` (${selectedIds.size})` : ""}
				</Button>
				<div className="flex items-center gap-2">
					<Button variant="outline" disabled={safePage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
						Previous
					</Button>
					<span className="text-xs text-muted-foreground">
						Page {safePage} of {totalPages}
					</span>
					<Button
						variant="outline"
						disabled={safePage === totalPages}
						onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
