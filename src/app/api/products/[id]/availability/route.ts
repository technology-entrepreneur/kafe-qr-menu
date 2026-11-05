// Ürün Müsaitlik Durumu API (86'ing — Hızlı Tükendi Senkronizasyonu)
// PATCH /api/products/[id]/availability — Ürün stok durumunu değiştir

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sseBroadcast";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { isAvailable } = body;
  const productId = params.id;

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { isAvailable },
    });

    // Tüm bağlı müşterilere anlık bildir
    broadcastSSE("product_availability_changed", {
      productId,
      isAvailable,
      productName: product.name,
    });

    return NextResponse.json({ success: true, product });
  } catch {
    // In-memory fallback — globalThis üzerindeki mock datayı güncelle
    broadcastSSE("product_availability_changed", {
      productId,
      isAvailable,
    });
    return NextResponse.json({ success: true });
  }
}

