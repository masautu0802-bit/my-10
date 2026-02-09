import { createClient } from "@/app/lib/supabase/server";
import ShopCreateForm from "./ShopCreateForm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth/session";

async function getColorThemes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("color_themes")
    .select("*")
    .order("display_order", { ascending: true });

  return data || [];
}

export default async function ShopCreatePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const colorThemes = await getColorThemes();

  return <ShopCreateForm colorThemes={colorThemes} />;
}
