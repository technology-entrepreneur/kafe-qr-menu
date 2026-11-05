import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sseBroadcast";

const g = globalThis as any;
if (!g._tableSessions) g._tableSessions = new Map<string, any>();
const memSessions: Map<string, any> = g._tableSessions;

if (!g._orders) g._orders = new Map<string, any>();
const memOrders: Map<string, any> = g._orders;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromTable, toTable } = body;

    if (!fromTable || !toTable) {
      return NextResponse.json(
        { error: "Kaynak ve hedef masa belirtilmelidir." },
        { status: 400 }
      );
    }

    if (fromTable === toTable) {
      return NextResponse.json(
        { error: "Aynı masaya transfer yapılamaz." },
        { status: 400 }
      );
    }

    // DB işlemi
    try {
      const sourceSession = await prisma.tableSession.findFirst({
        where: { tableNumber: fromTable, status: "OPEN" },
      });

      if (!sourceSession) {
        return NextResponse.json(
          { error: `Masa ${fromTable} için açık oturum bulunamadı.` },
          { status: 404 }
        );
      }

      // Masanın numarasını güncelle
      await prisma.tableSession.update({
        where: { id: sourceSession.id },
        data: { tableNumber: toTable },
      });

      // İlgili siparişlerin masasını güncelle
      await prisma.order.updateMany({
        where: { sessionId: sourceSession.id },
        data: { tableNumber: toTable },
      });
    } catch {
      // In-memory fallback
      const source = Array.from(memSessions.values()).find(
        (s: any) => s.tableNumber === fromTable && s.status === "OPEN"
      );

      if (!source) {
        return NextResponse.json(
          { error: `Masa ${fromTable} için açık oturum bulunamadı.` },
          { status: 404 }
        );
      }

      source.tableNumber = toTable;
      Array.from(memOrders.values()).forEach((o: any) => {
        if (o.tableNumber === fromTable) o.tableNumber = toTable;
      });
    }

    // SSE ile canlı bildirim
    broadcastSSE("table_transferred", {
      fromTable,
      toTable,
      message: `Adisyon Masa ${fromTable}'den Masa ${toTable}'ye başarıyla aktarıldı.`,
    });

    return NextResponse.json({
      success: true,
      fromTable,
      toTable,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

