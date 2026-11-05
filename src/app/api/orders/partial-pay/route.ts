import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sseBroadcast";

const g = globalThis as any;
if (!g._orders) g._orders = new Map<string, any>();
const memOrders: Map<string, any> = g._orders;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tableNumber, itemIds } = body;

    if (!tableNumber || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: "Masa numarası ve ödenecek ürünler belirtilmelidir." },
        { status: 400 }
      );
    }

    let paidAmount = 0;

    try {
      // Kalemleri bul ve isPaid: true yap
      const items = await prisma.orderItem.findMany({
        where: { id: { in: itemIds } },
      });

      paidAmount = items.reduce((acc, it) => acc + it.totalPrice, 0);

      await prisma.orderItem.updateMany({
        where: { id: { in: itemIds } },
        data: { isPaid: true },
      });
    } catch {
      // In-memory fallback
      const orders = Array.from(memOrders.values()).filter(
        (o: any) => o.tableNumber === tableNumber
      );

      for (const ord of orders) {
        for (const item of ord.items || []) {
          if (itemIds.includes(item.id)) {
            item.isPaid = true;
            paidAmount += item.totalPrice;
          }
        }
      }
    }

    // Masadaki müşterilere ve garsonlara bildir
    broadcastSSE("partial_payment_received", {
      tableNumber,
      itemIds,
      paidAmount,
    });

    return NextResponse.json({
      success: true,
      tableNumber,
      paidAmount,
      itemIds,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

