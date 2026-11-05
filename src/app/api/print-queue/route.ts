import { NextResponse } from "next/server";
import { getBusinessSettings } from "@/lib/data";

interface PrintJob {
  id: string;
  station: string; // kitchen | bar | hookah | cashier | all
  receipt: any;
  status: "PENDING" | "PRINTED" | "FAILED";
  createdAt: string;
}

const g = globalThis as any;
if (!g._printQueue) g._printQueue = [] as PrintJob[];
const printQueue: PrintJob[] = g._printQueue;

// ============================================================
// GET /api/print-queue?station=kitchen
// Yerel Print-Bridge istemcisi (TCP 9100 köprüsü) bekleyen işleri çeker
// ============================================================
export async function GET(req: Request) {
  const url = new URL(req.url);
  const station = url.searchParams.get("station") || "all";
  const markAsDone = url.searchParams.get("markDone") === "true";

  const pendingJobs = printQueue.filter(
    (j) =>
      j.status === "PENDING" &&
      (station === "all" || j.station === station || j.station === "both")
  );

  if (markAsDone) {
    pendingJobs.forEach((j) => {
      j.status = "PRINTED";
    });
  }

  // Yazıcı ayarlarını da döndür
  const settings = await getBusinessSettings();

  return NextResponse.json({
    jobs: pendingJobs,
    settings: {
      cafeName: settings.cafeName,
    },
  });
}

// ============================================================
// POST /api/print-queue
// Yeni yazdırma görevi ekler
// ============================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { receipt, station = "cashier" } = body;

    if (!receipt) {
      return NextResponse.json({ error: "Fiş verisi eksik." }, { status: 400 });
    }

    const job: PrintJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      station,
      receipt,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    printQueue.push(job);

    // Kuyruk 100 adetten fazla şişmesin
    if (printQueue.length > 100) {
      printQueue.splice(0, printQueue.length - 100);
    }

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

