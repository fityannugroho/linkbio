import {
  createFileRoute,
  getRouteApi,
  useRouter,
} from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddLinkForm } from "@/components/AddLinkForm";
import { AvatarDialog } from "@/components/AvatarDialog";
import { LinksList } from "@/components/LinksList";
import { ProfileDialog } from "@/components/ProfileDialog";
import { ProfileHeader } from "@/components/ProfileHeader";
import { SocialDialog } from "@/components/SocialDialog";
import { useLinks } from "@/hooks/useLinks";
import type { SocialPlatform } from "@/lib/validation";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardLinksPage,
});

const dashboardRoute = getRouteApi("/dashboard");

function DashboardLinksPage() {
  const {
    links: initialLinks,
    profile,
    avatars,
  } = dashboardRoute.useLoaderData();
  const router = useRouter();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isSocialDialogOpen, setIsSocialDialogOpen] = useState(false);
  const [selectedSocialKey, setSelectedSocialKey] =
    useState<SocialPlatform | null>(null);

  const linksManager = useLinks({
    initialLinks,
    onInvalidate: () => router.invalidate(),
  });

  function openSocialDialog(key?: SocialPlatform) {
    if (key) {
      setSelectedSocialKey(key);
    } else {
      setSelectedSocialKey(null);
    }
    setIsSocialDialogOpen(true);
  }

  function closeSocialDialog() {
    setIsSocialDialogOpen(false);
    setSelectedSocialKey(null);
  }

  return (
    <>
      <ProfileHeader
        className="mb-8"
        profile={profile}
        onEditAvatar={() => setIsAvatarDialogOpen(true)}
        onEditProfile={() => setIsProfileDialogOpen(true)}
        onEditSocial={openSocialDialog}
      />

      <div className="flex flex-col gap-4">
        <LinksList
          links={linksManager.links}
          onUpdateLink={linksManager.updateLink}
          onToggleVisibility={linksManager.toggleVisibility}
          onDeleteLink={linksManager.deleteLink}
          onDragStart={linksManager.startDrag}
          onDragOver={linksManager.dragOver}
          onDragEnd={linksManager.endDrag}
        />
        <button
          type="button"
          onClick={() => setIsAddFormOpen(true)}
          className="group flex w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-card px-4 py-4 text-center transition-colors hover:border-border/80"
          title="Add link"
        >
          <Plus size={20} className="text-muted-foreground" />
        </button>
      </div>

      <AddLinkForm
        open={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSubmit={linksManager.addLink}
      />

      <AvatarDialog
        open={isAvatarDialogOpen}
        profile={profile}
        avatars={avatars}
        onClose={() => setIsAvatarDialogOpen(false)}
        onSuccess={() => router.invalidate()}
      />

      <ProfileDialog
        open={isProfileDialogOpen}
        profile={profile}
        onClose={() => setIsProfileDialogOpen(false)}
        onSuccess={() => router.invalidate()}
      />

      <SocialDialog
        open={isSocialDialogOpen}
        profile={profile}
        onClose={closeSocialDialog}
        onSuccess={() => router.invalidate()}
        initialEditingKey={selectedSocialKey}
      />
    </>
  );
}
