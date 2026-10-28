"use server";

import { revalidatePath } from "next/cache";
import { updateBusinessSettings } from "@/lib/data";
import { BusinessSettingsSchema } from "@/lib/validations/schemas";
import { runAdminAction, ActionResult } from "@/lib/validations/safeAction";

export async function updateBusinessSettingsAction(formData: FormData): Promise<ActionResult> {
  const rawData = {
    cafeName: formData.get("cafeName")?.toString(),
    logoUrl: formData.get("logoUrl")?.toString() || null,
    wifiSsid: formData.get("wifiSsid")?.toString() || null,
    wifiPassword: formData.get("wifiPassword")?.toString() || null,
    workingHours: formData.get("workingHours")?.toString() || null,
    phone: formData.get("phone")?.toString() || null,
    address: formData.get("address")?.toString() || null,
    instagramUrl: formData.get("instagramUrl")?.toString() || null,
    tiktokUrl: formData.get("tiktokUrl")?.toString() || null,
    googleReviewUrl: formData.get("googleReviewUrl")?.toString() || null,
    whatsappNumber: formData.get("whatsappNumber")?.toString() || null,
  };

  return runAdminAction(BusinessSettingsSchema, rawData, async (valid) => {
    await updateBusinessSettings({
      cafeName: valid.cafeName,
      logoUrl: valid.logoUrl,
      wifiSsid: valid.wifiSsid,
      wifiPassword: valid.wifiPassword,
      workingHours: valid.workingHours,
      phone: valid.phone,
      address: valid.address,
      instagramUrl: valid.instagramUrl,
      tiktokUrl: valid.tiktokUrl,
      googleReviewUrl: valid.googleReviewUrl,
      whatsappNumber: valid.whatsappNumber,
    });

    revalidatePath("/");
    revalidatePath("/welcome");
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    return { success: true };
  });
}
