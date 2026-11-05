// Sipariş Durum Güncelleme API
// PATCH /api/orders/[id] — KDS sipariş durumu güncelle

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sseBroadcast";

const g = globalThis as any;
if (!g._orders) g._orders = new Map<string, any>();
const memOrders: Map<string, any> = g._orders;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { status } = body; // PREPARING | READY | SERVED | CANCELLED
  const orderId = params.id;

  const validStatuses = ["PREPARING", "READY", "SERVED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
  }

  const now = new Date();
  const timeFields: Record<string, any> = {};
  if (status === "PREPARING") timeFields.acceptedAt = now;
  if (status === "READY") timeFields.readyAt = now;
  if (status === "SERVED") timeFields.servedAt = now;

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status, ...timeFields, updatedAt: now },
      include: { items: true },
    });

    // Aynı anda tüm kalemlerin durumunu güncelle
    await prisma.orderItem.updateMany({
      where: { orderId },
      data: { status },
    });

    broadcastSSE(
      "order_status_changed",
      {
        orderId,
        status,
        tableNumber: order.tableNumber,
        sessionId: order.sessionId,
        order,
      },
      (client) =>
        client.tableNumber === order.tableNumber ||
        client.role === "kds" ||
        client.role === "waiter" ||
        client.role === "admin"
    );

    return NextResponse.json({ success: true, order });
  } catch {
    // In-memory fallback
    const order = memOrders.get(orderId);
    if (!order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });

    order.status = status;
    if (timeFields.acceptedAt) order.acceptedAt = now.toISOString();
    if (timeFields.readyAt) order.readyAt = now.toISOString();
    if (timeFields.servedAt) order.servedAt = now.toISOString();
    order.items?.forEach((item: any) => { item.status = status; });

    broadcastSSE(
      "order_status_changed",
      {
        orderId,
        status,
        tableNumber: order.tableNumber,
        sessionId: order.sessionId,
        order,
      },
      (client) =>
        client.tableNumber === order.tableNumber ||
        client.role === "kds" ||
        client.role === "waiter" ||
        client.role === "admin"
    );

    return NextResponse.json({ success: true, order });
  }
}

