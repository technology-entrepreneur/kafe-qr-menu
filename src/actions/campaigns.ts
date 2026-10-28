"use server";

import { getAdminSession } from "@/lib/auth";
import { createCampaign, updateCampaign, deleteCampaign } from "@/lib/data";
import { revalidatePath } from "next/cache";

export async function addCampaignAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Yetkisiz işlem! Lütfen giriş yapın." };
  }

  const title = formData.get("title")?.toString().trim();
  const subtitle = formData.get("subtitle")?.toString().trim() || null;
  const badgeText = formData.get("badgeText")?.toString().trim() || null;
  const imageUrl = formData.get("imageUrl")?.toString().trim() || null;
  const originalPrice = formData.get("originalPrice")
    ? parseFloat(formData.get("originalPrice")!.toString())
    : null;
  const discountedPrice = formData.get("discountedPrice")
    ? parseFloat(formData.get("discountedPrice")!.toString())
    : null;
  const order = parseInt(formData.get("order")?.toString() || "0", 10);
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";

  if (!title) {
    return { success: false, error: "Kampanya başlığı zorunludur." };
  }

  try {
    await createCampaign({
      title,
      subtitle,
      badgeText,
      imageUrl,
      originalPrice,
      discountedPrice,
      order,
      isActive,
    });

    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Kampanya oluşturulamadı." };
  }
}

export async function updateCampaignAction(id: string, formData: FormData) {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Yetkisiz işlem!" };
  }

  const title = formData.get("title")?.toString().trim();
  const subtitle = formData.get("subtitle")?.toString().trim() || null;
  const badgeText = formData.get("badgeText")?.toString().trim() || null;
  const imageUrl = formData.get("imageUrl")?.toString().trim() || null;
  const originalPrice = formData.get("originalPrice")
    ? parseFloat(formData.get("originalPrice")!.toString())
    : null;
  const discountedPrice = formData.get("discountedPrice")
    ? parseFloat(formData.get("discountedPrice")!.toString())
    : null;
  const order = parseInt(formData.get("order")?.toString() || "0", 10);
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";

  try {
    await updateCampaign(id, {
      title,
      subtitle,
      badgeText,
      imageUrl,
      originalPrice,
      discountedPrice,
      order,
      isActive,
    });

    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Kampanya güncellenemedi." };
  }
}

export async function toggleCampaignStatusAction(id: string, currentStatus: boolean) {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Yetkisiz işlem!" };
  }

  try {
    await updateCampaign(id, { isActive: !currentStatus });
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCampaignAction(id: string) {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Yetkisiz işlem!" };
  }

  try {
    await deleteCampaign(id);
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Kampanya silinemedi." };
  }
}
