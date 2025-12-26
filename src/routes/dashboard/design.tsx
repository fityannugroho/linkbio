import {
  createFileRoute,
  getRouteApi,
  useRouter,
} from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ButtonStyleSection } from "@/components/dashboard/ButtonStyleSection";
import { TextSection } from "@/components/dashboard/TextSection";
import { WallpaperSection } from "@/components/dashboard/WallpaperSection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updateDesignsAction } from "@/server/dashboard/profile";

type DesignFormData = {
  backgroundType: "solid" | "gradient";
  backgroundSolid: string;
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  backgroundGradientDirection: string;
  buttonStyle: string;
  font: string;
};

export const Route = createFileRoute("/dashboard/design")({
  component: DashboardProfilePage,
});

const dashboardRoute = getRouteApi("/dashboard");

function DashboardProfilePage() {
  const { profile } = dashboardRoute.useLoaderData();
  const router = useRouter();

  const wallpaperRef = useRef<HTMLElement>(null);
  const buttonsRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<
    "wallpaper" | "buttons" | "text"
  >("wallpaper");

  const d = profile?.design || {};

  const [formData, setFormData] = useState<DesignFormData>({
    backgroundType:
      (d["wallpaper.type"] as "solid" | "gradient" | undefined) || "solid",
    backgroundSolid: d["wallpaper.solid_color"] || "#18181b",
    backgroundGradientFrom: d["wallpaper.gradient_from"] || "#18181b",
    backgroundGradientTo: d["wallpaper.gradient_to"] || "#09090b",
    backgroundGradientDirection:
      d["wallpaper.gradient_direction"] || "to bottom",
    buttonStyle: d["button.style"] || "default",
    font: d["text.color"] || "#ffffff",
  });

  const updateFormData = (data: Partial<DesignFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const scrollToSection = (section: "wallpaper" | "buttons" | "text") => {
    const target =
      section === "wallpaper"
        ? wallpaperRef
        : section === "buttons"
          ? buttonsRef
          : textRef;
    target.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(section);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const design: Record<string, string | null> = {
      "wallpaper.type": formData.backgroundType,
      "wallpaper.solid_color": formData.backgroundSolid,
      "wallpaper.gradient_from": formData.backgroundGradientFrom,
      "wallpaper.gradient_to": formData.backgroundGradientTo,
      "wallpaper.gradient_direction": formData.backgroundGradientDirection,
      "button.style": formData.buttonStyle,
      "text.color": formData.font,
    };

    await updateDesignsAction({
      data: {
        design,
      },
    })
      .then(() => {
        toast.success("Design updated!");
        router.invalidate();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update design");
      });
  };

  const navSections = [
    {
      id: "wallpaper",
      label: "Wallpaper",
      description: "Set the background style and colors.",
    },
    {
      id: "buttons",
      label: "Buttons",
      description: "Set the style for your buttons.",
    },
    {
      id: "text",
      label: "Text",
      description: "Set the text style.",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <form
        id="design-form"
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[260px_1fr]"
      >
        <nav className="space-y-6 text-sm lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Design
              </h2>
            </div>
            <div className="space-y-1 border-l border-border pl-3">
              {navSections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition",
                      isActive
                        ? "bg-muted/70 text-foreground"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1 size-2 rounded-full border",
                        isActive
                          ? "border-primary bg-primary/60"
                          : "border-border bg-background",
                      )}
                    />
                    <span className="space-y-1">
                      <span className="block text-sm font-medium">
                        {section.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {section.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <Button type="submit" form="design-form" size="lg" className="w-full">
            Save changes
          </Button>
        </nav>

        <div className="space-y-10">
          <section ref={wallpaperRef} className="scroll-mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallpaper</CardTitle>
                <CardDescription>
                  Choose a solid color or a gradient for your background.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WallpaperSection data={formData} onChange={updateFormData} />
              </CardContent>
            </Card>
          </section>

          <section ref={buttonsRef} className="scroll-mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>
                  Match your button style to your brand.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ButtonStyleSection data={formData} onChange={updateFormData} />
              </CardContent>
            </Card>
          </section>

          <section ref={textRef} className="scroll-mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Text section</CardTitle>
                <CardDescription>
                  Set the default color for text on your page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TextSection data={formData} onChange={updateFormData} />
              </CardContent>
            </Card>
          </section>
        </div>
      </form>
    </div>
  );
}
