import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const g = globalThis as any;

  // In-memory tüm test oturumlarını ve siparişleri sıfırla
  if (g._orders) g._orders.clear();
  if (g._tableSessions) g._tableSessions.clear();
  if (g._serviceCalls) g._serviceCalls.clear();
  if (g._printQueue) g._printQueue.length = 0;

  // Veritabanı bağlıysa test oturumlarını temizle
  try {
    await prisma.serviceCall.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.tableSession.deleteMany({});
  } catch {}

  return NextResponse.json({
    success: true,
    message: "Sistem sıfır kilometre fabrika ayarlarına döndürüldü. Tüm test siparişleri ve çağrıları temizlendi.",
  });
}

export async function GET() {
  return POST();
}

