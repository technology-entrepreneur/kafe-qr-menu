"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStock,
} from "@/lib/data";
import { ProductSchema, sanitizeText } from "@/lib/validations/schemas";
import { runAdminAction, ActionResult } from "@/lib/validations/safeAction";
import { z } from "zod";

function parseProductFormData(formData: FormData) {
  const rawPrice = formData.get("price")?.toString() || "0";
  const rawOrder = formData.get("order")?.toString() || "0";
  const rawCalories = formData.get("calories")?.toString();
  const rawPrepTime = formData.get("prepTimeMinutes")?.toString();

  return {
    name: formData.get("name")?.toString(),
    nameEn: formData.get("nameEn")?.toString() || null,
    description: formData.get("description")?.toString() || null,
    descriptionEn: formData.get("descriptionEn")?.toString() || null,
    price: Number(rawPrice),
    imageUrl: formData.get("imageUrl")?.toString() || null,
    categoryId: formData.get("categoryId")?.toString(),
    allergens: formData.get("allergens")?.toString() || null,
    allergensEn: formData.get("allergensEn")?.toString() || null,
    calories: rawCalories ? Number(rawCalories) : null,
    prepTimeMinutes: rawPrepTime ? Number(rawPrepTime) : null,
    badge: formData.get("badge")?.toString() || null,
    order: Number(rawOrder),
    isAvailable:
      formData.get("isAvailable") === "true" || formData.get("isAvailable") === "on",
  };
}

export async function addProductAction(formData: FormData): Promise<ActionResult> {
  const rawData = parseProductFormData(formData);

  return runAdminAction(ProductSchema, rawData, async (validData) => {
    await createProduct({
      name: validData.name,
      nameEn: validData.nameEn,
      description: validData.description,
      descriptionEn: validData.descriptionEn,
      price: validData.price,
      imageUrl: validData.imageUrl,
      categoryId: validData.categoryId,
      allergens: validData.allergens,
      allergensEn: validData.allergensEn,
      calories: validData.calories,
      prepTimeMinutes: validData.prepTimeMinutes,
      badge: validData.badge,
      order: validData.order,
      isAvailable: validData.isAvailable,
    });

    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true };
  });
}

export async function updateProductAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const rawData = parseProductFormData(formData);
  const cleanId = sanitizeText(id) || "";

  if (!cleanId) {
    return { success: false, error: "Geçersiz ürün kimliği." };
  }

  return runAdminAction(ProductSchema, rawData, async (validData) => {
    await updateProduct(cleanId, {
      name: validData.name,
      nameEn: validData.nameEn,
      description: validData.description,
      descriptionEn: validData.descriptionEn,
      price: validData.price,
      imageUrl: validData.imageUrl,
      categoryId: validData.categoryId,
      allergens: validData.allergens,
      allergensEn: validData.allergensEn,
      calories: validData.calories,
      prepTimeMinutes: validData.prepTimeMinutes,
      badge: validData.badge,
      order: validData.order,
      isAvailable: validData.isAvailable,
    });

    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    return { success: true };
  });
}

export async function toggleProductStockAction(id: string): Promise<ActionResult> {
  const cleanId = sanitizeText(id) || "";
  const IdSchema = z.string().min(1, { message: "Geçersiz ürün ID" });

  return runAdminAction(IdSchema, cleanId, async (validId) => {
    await toggleProductStock(validId);
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    return { success: true };
  });
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const cleanId = sanitizeText(id) || "";
  const IdSchema = z.string().min(1, { message: "Geçersiz ürün ID" });

  return runAdminAction(IdSchema, cleanId, async (validId) => {
    await deleteProduct(validId);
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    return { success: true };
  });
}

// ==========================================
// ÇAPRAZ SATIŞ & EKSTRA GRUPLARI EYLEMLERİ
// ==========================================
export async function setProductCrossSellsAction(
  productId: string,
  suggestedIds: string[]
): Promise<ActionResult> {
  const cleanId = sanitizeText(productId) || "";
  const Schema = z.object({
    productId: z.string().min(1),
    suggestedIds: z.array(z.string().min(1)),
  });

  return runAdminAction(
    Schema,
    { productId: cleanId, suggestedIds },
    async (valid) => {
      const { updateProductCrossSells } = await import("@/lib/data");
      const res = await updateProductCrossSells(valid.productId, valid.suggestedIds);
      revalidatePath("/menu");
      revalidatePath("/admin/dashboard");
      return res;
    }
  );
}

export async function addProductExtraGroupAction(
  productId: string,
  title: string,
  isRequired: boolean,
  maxSelect: number,
  options: { name: string; price: number }[]
): Promise<ActionResult> {
  const Schema = z.object({
    productId: z.string().min(1),
    title: z.string().min(1).max(80).transform((t) => sanitizeText(t) || t),
    isRequired: z.boolean(),
    maxSelect: z.number().int().min(1).max(20),
    options: z.array(
      z.object({
        name: z.string().min(1).max(80).transform((n) => sanitizeText(n) || n),
        price: z.number().min(0).max(10000),
      })
    ),
  });

  return runAdminAction(
    Schema,
    { productId, title, isRequired, maxSelect, options },
    async (valid) => {
      const { addExtraGroupToProduct } = await import("@/lib/data");
      const res = await addExtraGroupToProduct(
        valid.productId,
        valid.title,
        valid.isRequired,
        valid.maxSelect,
        valid.options
      );
      revalidatePath("/menu");
      revalidatePath("/admin/dashboard");
      return res;
    }
  );
}

export async function removeProductExtraGroupAction(
  groupId: string
): Promise<ActionResult> {
  const cleanId = sanitizeText(groupId) || "";
  const Schema = z.string().min(1);

  return runAdminAction(Schema, cleanId, async (validId) => {
    const { deleteExtraGroup } = await import("@/lib/data");
    const res = await deleteExtraGroup(validId);
    revalidatePath("/menu");
    revalidatePath("/admin/dashboard");
    return res;
  });
}
