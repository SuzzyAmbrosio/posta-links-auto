import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { shortCode: string } }
) {
  const link = await prisma.link.findUnique({
    where: { shortCode: params.shortCode },
  });

  if (!link) {
    return NextResponse.redirect(new URL("/404", request.url));
  }

  await prisma.link.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } },
  });

  return NextResponse.redirect(link.url);
}