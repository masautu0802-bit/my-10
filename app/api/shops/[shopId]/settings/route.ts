import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser, checkShopOwnership } from "@/app/lib/auth/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isOwner = await checkShopOwnership(shopId);
    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { font_family, color_theme } = body;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("shops")
      .update({
        font_family,
        color_theme,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shopId)
      .select()
      .single();

    if (error) {
      console.error("Error updating shop settings:", error);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
