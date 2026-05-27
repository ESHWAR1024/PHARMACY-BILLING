import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function serializeBigInt(data: any) {
  return JSON.parse(
    JSON.stringify(
      data,
      (_, value) =>
        typeof value === "bigint"
          ? value.toString()
          : value
    )
  )
}

export async function GET() {
  try {
    // TEMP: first user
    const user =
      await prisma.user.findFirst()

    return NextResponse.json(
      serializeBigInt(user)
    )
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      {
        error:
          "Failed to fetch profile",
      },
      {
        status: 500,
      }
    )
  }
}