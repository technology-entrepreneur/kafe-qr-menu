// Hizmet Çağrısı API (Garson Çağır / Hesap İste)
// POST /api/service-calls — Çağrı oluştur
// GET  /api/service-calls?tableNumber=5 — Bekleyen çağrıları getir
// PATCH /api/service-calls/[id] — Çağrı durumunu güncelle

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sseBroadcast";
import { normalizeTableNumber } from "@/lib/tableUtils";

// ============================================================
// In-memory fallback
// ============================================================
const g = globalThis as any;
if (!g._serviceCalls) g._serviceCalls = new Map<string, any>();
const memCalls: Map<string, any> = g._serviceCalls;

// ============================================================
// GET — Bekleyen çağrıları listele
// ============================================================
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawTable = url.searchParams.get("tableNumber");
  const tableNumber = rawTable ? normalizeTableNumber(rawTable) : null;
  const status = url.searchParams.get("status") || "PENDING";

  try {
    const calls = await prisma.serviceCall.findMany({
      where: {
        ...(tableNumber
          ? {
              OR: [
                { tableNumber },
                { tableNumber: rawTable! },
                { tableNumber: `Masa ${tableNumber}` },
              ],
            }
          : {}),
        status,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ calls });
  } catch {
    const calls = Array.from(memCalls.values()).filter((c: any) => {
      const matchTable = !tableNumber || normalizeTableNumber(c.tableNumber).toLowerCase() === tableNumber.toLowerCase();
      return matchTable && c.status === status;
    });
    return NextResponse.json({ calls });
  }
}

// ============================================================
// POST — Yeni çağrı oluştur
// Body: { sessionId, tableNumber, type, notes?, paymentNote? }
// Spam koruması: Son 60 saniye içinde aynı masadan aynı tipte çağrı varsa reddet
// ============================================================
export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, tableNumber: rawTable, type, notes, paymentNote } = body;
  const tableNumber = normalizeTableNumber(rawTable) || rawTable;

  if (!sessionId || !tableNumber || !type) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  // Köz yenileme çağrısı için 10 dk (600 sn), garson/hesap için 60 sn cooldown
  const COOLDOWN_MS = type === "hookah_coal" ? 600_000 : 60_000;

  try {
    // Spam koruması
    const recentCall = await prisma.serviceCall.findFirst({
      where: {
        tableNumber,
        type,
        status: "PENDING",
        createdAt: { gte: new Date(Date.now() - COOLDOWN_MS) },
      },
    });

    if (recentCall) {
      const waitMins = Math.ceil((COOLDOWN_MS - (Date.now() - new Date(recentCall.createdAt).getTime())) / 60000);
      return NextResponse.json(
        {
          error: "COOLDOWN",
          message:
            type === "hookah_coal"
              ? `Köz talebiniz közcüye iletildi. Közlerin dinlenmesi için lütfen ${waitMins} dakika bekleyin.`
              : "Lütfen biraz bekleyin, çağrınız zaten iletildi.",
          remainingMs: COOLDOWN_MS - (Date.now() - new Date(recentCall.createdAt).getTime()),
        },
        { status: 429 }
      );
    }

    const call = await prisma.serviceCall.create({
      data: { sessionId, tableNumber, type, notes, paymentNote, status: "PENDING" },
    });

    broadcastSSE(
      "service_call",
      { call, tableNumber, type, paymentNote },
      (client) =>
        client.role === "waiter" ||
        client.role === "admin" ||
        client.role === "kds"
    );

    return NextResponse.json({ success: true, call });
  } catch {
    // In-memory fallback — spam koruması
    const recentCall = Array.from(memCalls.values()).find(
      (c: any) =>
        c.tableNumber === tableNumber &&
        c.type === type &&
        c.status === "PENDING" &&
        Date.now() - new Date(c.createdAt).getTime() < COOLDOWN_MS
    );

    if (recentCall) {
      const waitMins = Math.ceil((COOLDOWN_MS - (Date.now() - new Date(recentCall.createdAt).getTime())) / 60000);
      return NextResponse.json(
        {
          error: "COOLDOWN",
          message:
            type === "hookah_coal"
              ? `Köz talebiniz közcüye iletildi. Közlerin dinlenmesi için lütfen ${waitMins} dakika bekleyin.`
              : "Lütfen biraz bekleyin, çağrınız zaten iletildi.",
          remainingMs: COOLDOWN_MS - (Date.now() - new Date(recentCall.createdAt).getTime()),
        },
        { status: 429 }
      );
    }

    const call = {
      id: `call-${Date.now()}`,
      sessionId,
      tableNumber,
      type,
      notes,
      paymentNote,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    memCalls.set(call.id, call);

    broadcastSSE(
      "service_call",
      { call, tableNumber, type, paymentNote },
      (client) =>
        client.role === "waiter" ||
        client.role === "admin" ||
        client.role === "kds"
    );

    return NextResponse.json({ success: true, call });
  }
}

