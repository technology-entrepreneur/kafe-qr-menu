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
    businessType: formData.get("businessType")?.toString() || "cafe",
    isCatalogOnly: formData.get("isCatalogOnly") === "true" || formData.get("isCatalogOnly") === "on",
    hookahMode: formData.get("hookahMode") === "true" || formData.get("hookahMode") === "on",
    enableWaiterCall: formData.get("enableWaiterCall") === "true" || formData.get("enableWaiterCall") === "on",
    enableBillRequest: formData.get("enableBillRequest") === "true" || formData.get("enableBillRequest") === "on",
    enableQuickWifiBar: formData.get("enableQuickWifiBar") === "true" || formData.get("enableQuickWifiBar") === "on",
    enableGoogleReviewPrompt: formData.get("enableGoogleReviewPrompt") === "true" || formData.get("enableGoogleReviewPrompt") === "on",
    hookahCoalTimerMinutes: Number(formData.get("hookahCoalTimerMinutes") || 25),
    hookahCoalCooldownMinutes: Number(formData.get("hookahCoalCooldownMinutes") || 10),
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
      businessType: valid.businessType || "cafe",
      isCatalogOnly: valid.isCatalogOnly,
      hookahMode: valid.hookahMode,
      enableWaiterCall: valid.enableWaiterCall,
      enableBillRequest: valid.enableBillRequest,
      enableQuickWifiBar: valid.enableQuickWifiBar,
      enableGoogleReviewPrompt: valid.enableGoogleReviewPrompt,
      hookahCoalTimerMinutes: valid.hookahCoalTimerMinutes,
      hookahCoalCooldownMinutes: valid.hookahCoalCooldownMinutes,
    });

    revalidatePath("/");
    revalidatePath("/welcome");
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    return { success: true };
  });
}
