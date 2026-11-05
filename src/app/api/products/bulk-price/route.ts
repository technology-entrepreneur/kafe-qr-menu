import { NextResponse } from "next/server";
import { bulkUpdatePrices } from "@/lib/data";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json();
    const { percentage, categoryId, roundToNearest } = body;

    if (percentage === undefined || typeof percentage !== "number") {
      return NextResponse.json(
        { error: "Geçerli bir yüzde değeri giriniz." },
        { status: 400 }
      );
    }

    const result = await bulkUpdatePrices(
      percentage,
      categoryId,
      roundToNearest || 5
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

