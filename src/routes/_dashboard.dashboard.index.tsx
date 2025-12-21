import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import {
	Check,
	Edit,
	Eye,
	EyeOff,
	GripVertical,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { getWebRequest } from "vinxi/http";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/db";
import { links, profile } from "@/db/schema";
import { auth } from "@/lib/auth";

const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
	const session = await auth.api.getSession({
		headers: getWebRequest().headers,
	});
	if (!session) throw new Error("Unauthorized");

	const userProfile = await db
		.select()
		.from(profile)
		.where(eq(profile.userId, session.user.id))
		.limit(1);
	const allLinks = await db.select().from(links).orderBy(links.order); // TODO: Add userId to links table if needed, for now we assume one user for simplicity or add filter if table supports it

	return {
		profile: userProfile[0] || null,
		links: allLinks,
	};
});

const addLink = createServerFn({ method: "POST" })
	.inputValidator((data: { title: string; url: string }) => data)
	.handler(async ({ data }) => {
		const session = await auth.api.getSession({
			headers: getWebRequest().headers,
		});
		if (!session) throw new Error("Unauthorized");

		const maxOrder = await db.select().from(links).orderBy(links.order);
		const newOrder =
			maxOrder.length > 0 ? Math.max(...maxOrder.map((l) => l.order)) + 1 : 0;

		await db.insert(links).values({
			title: data.title,
			url: data.url,
			isVisible: true,
			order: newOrder,
		});
	});

const updateLink = createServerFn({ method: "POST" })
	.inputValidator((data: { id: number; title: string; url: string }) => data)
	.handler(async ({ data }) => {
		const session = await auth.api.getSession({
			headers: getWebRequest().headers,
		});
		if (!session) throw new Error("Unauthorized");

		await db
			.update(links)
			.set({
				title: data.title,
				url: data.url,
			})
			.where(eq(links.id, data.id));
	});

const reorderLinks = createServerFn({ method: "POST" })
	.inputValidator((data: { id: number; newOrder: number }[]) => data)
	.handler(async ({ data }) => {
		const session = await auth.api.getSession({
			headers: getWebRequest().headers,
		});
		if (!session) throw new Error("Unauthorized");

		for (const item of data) {
			await db
				.update(links)
				.set({ order: item.newOrder })
				.where(eq(links.id, item.id));
		}
	});

const toggleLinkVisibility = createServerFn({ method: "POST" })
	.inputValidator((data: number) => data)
	.handler(async ({ data: id }) => {
		const session = await auth.api.getSession({
			headers: getWebRequest().headers,
		});
		if (!session) throw new Error("Unauthorized");

		const link = await db.select().from(links).where(eq(links.id, id));
		if (link[0]) {
			await db
				.update(links)
				.set({ isVisible: !link[0].isVisible })
				.where(eq(links.id, id));
		}
	});

const deleteLink = createServerFn({ method: "POST" })
	.inputValidator((data: number) => data)
	.handler(async ({ data: id }) => {
		const session = await auth.api.getSession({
			headers: getWebRequest().headers,
		});
		if (!session) throw new Error("Unauthorized");

		await db.delete(links).where(eq(links.id, id));
	});

export const Route = createFileRoute("/_dashboard/dashboard/")({
	component: DashboardLinksPage,
	loader: async () => await getDashboardData(),
});

function DashboardLinksPage() {
	const { links: initialLinks } = Route.useLoaderData();
	const router = useRouter();
	const [isAdding, setIsAdding] = useState(false);
	const [newLink, setNewLink] = useState({ title: "", url: "" });
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editForm, setEditForm] = useState({ title: "", url: "" });
	const [links, setLinks] = useState(initialLinks);
	const [draggedId, setDraggedId] = useState<number | null>(null);

	const handleAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		await addLink({ data: newLink });
		setNewLink({ title: "", url: "" });
		setIsAdding(false);
		router.invalidate();
	};

	const startEdit = (link: (typeof links)[0]) => {
		setEditingId(link.id);
		setEditForm({ title: link.title, url: link.url });
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditForm({ title: "", url: "" });
	};

	const saveEdit = async (id: number) => {
		await updateLink({ data: { id, ...editForm } });
		setEditingId(null);
		router.invalidate();
	};

	const handleToggle = async (id: number) => {
		await toggleLinkVisibility({ data: id });
		router.invalidate();
	};

	const handleDelete = async (id: number) => {
		if (confirm("Are you sure?")) {
			await deleteLink({ data: id });
			router.invalidate();
		}
	};

	const handleDragStart = (id: number) => {
		setDraggedId(id);
	};

	const handleDragOver = (e: React.DragEvent, targetId: number) => {
		e.preventDefault();
		if (draggedId === null || draggedId === targetId) return;

		const draggedIndex = links.findIndex((l) => l.id === draggedId);
		const targetIndex = links.findIndex((l) => l.id === targetId);

		if (draggedIndex === -1 || targetIndex === -1) return;

		const newLinks = [...links];
		const draggedItem = newLinks[draggedIndex];
		newLinks.splice(draggedIndex, 1);
		newLinks.splice(targetIndex, 0, draggedItem);

		setLinks(newLinks);
	};

	const handleDragEnd = async () => {
		if (draggedId !== null) {
			const reorderedData = links.map((link, index) => ({
				id: link.id,
				newOrder: index,
			}));
			await reorderLinks({ data: reorderedData });
			setDraggedId(null);
			router.invalidate();
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold tracking-tight">Links</h1>
				<Button onClick={() => setIsAdding(!isAdding)}>
					{isAdding ? "Cancel" : "Add Link"}
				</Button>
			</div>

			{isAdding && (
				<Card className="animate-in slide-in-from-top-4 fade-in duration-300">
					<CardHeader>
						<CardTitle>Add New Link</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleAdd} className="space-y-4">
							<div className="grid gap-2">
								<Label>Title</Label>
								<Input
									placeholder="e.g. My Portfolio"
									value={newLink.title}
									onChange={(e) =>
										setNewLink({ ...newLink, title: e.target.value })
									}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label>URL</Label>
								<Input
									placeholder="https://..."
									value={newLink.url}
									onChange={(e) =>
										setNewLink({ ...newLink, url: e.target.value })
									}
									required
								/>
							</div>
							<Button type="submit" disabled={!newLink.title || !newLink.url}>
								Create Link
							</Button>
						</form>
					</CardContent>
				</Card>
			)}

			<div className="space-y-4">
				{links.length === 0 && !isAdding && (
					<div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
						No links yet. Click "Add Link" to get started.
					</div>
				)}

				{links.map((link) => (
					<Card
						key={link.id}
						className="group hover:border-zinc-400 transition-colors"
						draggable
						onDragStart={() => handleDragStart(link.id)}
						onDragOver={(e) => handleDragOver(e, link.id)}
						onDragEnd={handleDragEnd}
					>
						<CardContent className="p-4 flex items-center gap-4">
							<button
								type="button"
								className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600"
								onMouseDown={(e) => e.stopPropagation()}
							>
								<GripVertical size={20} />
							</button>

							{editingId === link.id ? (
								<div className="flex-1 space-y-2">
									<Input
										value={editForm.title}
										onChange={(e) =>
											setEditForm({ ...editForm, title: e.target.value })
										}
										placeholder="Title"
									/>
									<Input
										value={editForm.url}
										onChange={(e) =>
											setEditForm({ ...editForm, url: e.target.value })
										}
										placeholder="URL"
									/>
								</div>
							) : (
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold truncate">{link.title}</h3>
									<p className="text-sm text-zinc-500 truncate">{link.url}</p>
								</div>
							)}

							<div className="flex items-center gap-2">
								{editingId === link.id ? (
									<>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => saveEdit(link.id)}
											className="text-green-600 hover:text-green-700 hover:bg-green-50"
										>
											<Check size={18} />
										</Button>
										<Button variant="ghost" size="icon" onClick={cancelEdit}>
											<X size={18} />
										</Button>
									</>
								) : (
									<>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => startEdit(link)}
											title="Edit"
										>
											<Edit size={18} />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleToggle(link.id)}
											title={link.isVisible ? "Hide" : "Show"}
										>
											{link.isVisible ? (
												<Eye size={18} />
											) : (
												<EyeOff size={18} className="text-zinc-400" />
											)}
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="text-red-500 hover:text-red-700 hover:bg-red-50"
											onClick={() => handleDelete(link.id)}
										>
											<Trash2 size={18} />
										</Button>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
