// Masa Oturumu (TableSession) API
// GET  /api/sessions/[tableId] — Aktif oturumu ve siparişleri getir
// POST /api/sessions/[tableId] — Yeni oturum aç veya mevcut aktifi döndür
// PATCH /api/sessions/[tableId] — Oturumu kapat (PAID/CLOSED)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sseBroadcast";
import { normalizeTableNumber } from "@/lib/tableUtils";

// ============================================================
// Fallback in-memory store (DB yoksa)
// ============================================================
const g = globalThis as any;
if (!g._tableSessions) g._tableSessions = new Map<string, any>();
const memSessions: Map<string, any> = g._tableSessions;

function getMemSession(tableNumber: string) {
  const norm = normalizeTableNumber(tableNumber).toLowerCase();
  return Array.from(memSessions.values()).find(
    (s: any) => normalizeTableNumber(s.tableNumber).toLowerCase() === norm && s.status === "OPEN"
  ) || null;
}

// ============================================================
// GET — Aktif oturumu, siparişlerini ve tutarını getir
// ============================================================
export async function GET(
  _req: Request,
  { params }: { params: { tableId: string } }
) {
  const rawTable = decodeURIComponent(params.tableId);
  const normTable = normalizeTableNumber(rawTable);

  try {
    const session = await prisma.tableSession.findFirst({
      where: {
        OR: [
          { tableNumber: normTable },
          { tableNumber: rawTable },
          { tableNumber: `Masa ${normTable}` },
        ],
        status: "OPEN",
      },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: "asc" },
        },
        serviceCalls: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!session) {
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({ session });
  } catch {
    // DB yoksa in-memory fallback
    const session = getMemSession(normTable);
    return NextResponse.json({ session });
  }
}

// ============================================================
// POST — Oturum aç (veya mevcut aktif oturumu döndür)
// ============================================================
export async function POST(
  req: Request,
  { params }: { params: { tableId: string } }
) {
  const rawTable = decodeURIComponent(params.tableId);
  const tableNumber = normalizeTableNumber(rawTable) || rawTable;

  try {
    // Önce açık oturum var mı kontrol et
    let session = await prisma.tableSession.findFirst({
      where: {
        OR: [
          { tableNumber },
          { tableNumber: rawTable },
          { tableNumber: `Masa ${tableNumber}` },
        ],
        status: "OPEN",
      },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      // Yeni oturum oluştur
      session = await prisma.tableSession.create({
        data: { tableNumber },
        include: {
          orders: { include: { items: true } },
        },
      }) as any;

      broadcastSSE(
        "session_opened",
        { tableNumber, sessionId: session!.id },
        (c) => c.role === "admin" || c.role === "waiter"
      );
    }

    return NextResponse.json({ session });
  } catch {
    // In-memory fallback
    let session = getMemSession(tableNumber);
    if (!session) {
      session = {
        id: `sess-${Date.now()}`,
        tableNumber,
        sessionToken: Math.random().toString(36).slice(2),
        status: "OPEN",
        openedAt: new Date().toISOString(),
        totalAmount: 0,
        orders: [],
      };
      memSessions.set(session.id, session);
    }
    return NextResponse.json({ session });
  }
}

// ============================================================
// PATCH — Oturumu kapat / ödeme al
// Body: { action: "close" | "pay", paymentMethod?: string }
// ============================================================
export async function PATCH(
  req: Request,
  { params }: { params: { tableId: string } }
) {
  const tableNumber = decodeURIComponent(params.tableId);
  const body = await req.json().catch(() => ({}));
  const action = body.action || "pay";

  const newStatus = action === "close" ? "CLOSED" : "PAID";

  try {
    const session = await prisma.tableSession.findFirst({
      where: { tableNumber, status: "OPEN" },
    });

    if (!session) {
      return NextResponse.json({ error: "Aktif oturum bulunamadı" }, { status: 404 });
    }

    const updated = await prisma.tableSession.update({
      where: { id: session.id },
      data: { status: newStatus, closedAt: new Date() },
    });

    // Müşteri ekranını sıfırla — yeni oturum için hazır
    broadcastSSE(
      "session_closed",
      {
        tableNumber,
        sessionId: session.id,
        status: newStatus,
        paymentMethod: body.paymentMethod,
      },
      (c) =>
        c.tableNumber === tableNumber ||
        c.role === "admin" ||
        c.role === "waiter"
    );

    return NextResponse.json({ success: true, session: updated });
  } catch {
    // In-memory fallback
    const session = getMemSession(tableNumber);
    if (session) {
      session.status = newStatus;
      session.closedAt = new Date().toISOString();
    }
    broadcastSSE(
      "session_closed",
      { tableNumber, status: newStatus },
      (c) =>
        c.tableNumber === tableNumber ||
        c.role === "admin" ||
        c.role === "waiter"
    );
    return NextResponse.json({ success: true });
  }
}

