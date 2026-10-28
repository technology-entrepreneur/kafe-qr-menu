"use server";

import { revalidatePath } from "next/cache";
import { createCategory, updateCategory, deleteCategory } from "@/lib/data";
import { CategorySchema, sanitizeText } from "@/lib/validations/schemas";
import { runAdminAction, ActionResult } from "@/lib/validations/safeAction";
import { z } from "zod";

function parseCategoryFormData(formData: FormData) {
  return {
    name: formData.get("name")?.toString(),
    nameEn: formData.get("nameEn")?.toString() || null,
    icon: formData.get("icon")?.toString() || null,
    order: Number(formData.get("order")?.toString() || "0"),
    isActive:
      formData.get("isActive") === "true" || formData.get("isActive") === "on",
  };
}

export async function addCategoryAction(formData: FormData): Promise<ActionResult> {
  const rawData = parseCategoryFormData(formData);

  return runAdminAction(CategorySchema, rawData, async (valid) => {
    await createCategory(valid.name, valid.order, valid.isActive, valid.nameEn, valid.icon);
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true };
  });
}

export async function updateCategoryAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const rawData = parseCategoryFormData(formData);
  const cleanId = sanitizeText(id) || "";

  if (!cleanId) {
    return { success: false, error: "Geçersiz kategori ID" };
  }

  return runAdminAction(CategorySchema, rawData, async (valid) => {
    await updateCategory(cleanId, {
      name: valid.name,
      nameEn: valid.nameEn,
      icon: valid.icon,
      order: valid.order,
      isActive: valid.isActive,
    });
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true };
  });
}

export async function toggleCategoryStatusAction(
  id: string,
  currentStatus: boolean
): Promise<ActionResult> {
  const cleanId = sanitizeText(id) || "";
  const IdSchema = z.string().min(1);

  return runAdminAction(IdSchema, cleanId, async (validId) => {
    await updateCategory(validId, { isActive: !currentStatus });
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    return { success: true };
  });
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const cleanId = sanitizeText(id) || "";
  const IdSchema = z.string().min(1);

  return runAdminAction(IdSchema, cleanId, async (validId) => {
    await deleteCategory(validId);
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    return { success: true };
  });
}
