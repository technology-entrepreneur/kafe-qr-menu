// Hizmet Çağrısı Durum Güncelleme
// PATCH /api/service-calls/[id]

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sseBroadcast";

const g = globalThis as any;
if (!g._serviceCalls) g._serviceCalls = new Map<string, any>();
const memCalls: Map<string, any> = g._serviceCalls;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { status } = body; // ACKNOWLEDGED | DONE
  const callId = params.id;

  const now = new Date();

  try {
    const call = await prisma.serviceCall.update({
      where: { id: callId },
      data: {
        status,
        ...(status === "ACKNOWLEDGED" ? { acknowledgedAt: now } : {}),
        ...(status === "DONE" ? { resolvedAt: now } : {}),
      },
    });

    broadcastSSE(
      "service_call_updated",
      { callId, status, tableNumber: call.tableNumber, call },
      (client) =>
        client.tableNumber === call.tableNumber ||
        client.role === "waiter" ||
        client.role === "admin"
    );

    return NextResponse.json({ success: true, call });
  } catch {
    const call = memCalls.get(callId);
    if (!call) return NextResponse.json({ error: "Çağrı bulunamadı" }, { status: 404 });

    call.status = status;
    if (status === "ACKNOWLEDGED") call.acknowledgedAt = now.toISOString();
    if (status === "DONE") call.resolvedAt = now.toISOString();

    broadcastSSE(
      "service_call_updated",
      { callId, status, tableNumber: call.tableNumber, call },
      (client) =>
        client.tableNumber === call.tableNumber ||
        client.role === "waiter" ||
        client.role === "admin"
    );

    return NextResponse.json({ success: true, call });
  }
}

