/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/app/lib/mongodb";
import { Report } from "@/types/report";

export async function GET(req: NextRequest, context: any) {
  const client = await clientPromise;
  const db = client.db("safehub");
  const reports = db.collection<Report>("reports");

  const report = await reports.findOne({ _id: new ObjectId(context.params.id) });

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}

