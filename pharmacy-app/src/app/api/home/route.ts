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

    const bills =
      await prisma.bill.findMany()

    const totalRevenue =
      bills.reduce(
        (sum, bill) =>
          sum + bill.total,
        0
      )

    return NextResponse.json(
      serializeBigInt({
        user,
        revenue:
          totalRevenue,
      })
    )
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      {
        error:
          "Failed to load home data",
      },
      {
        status: 500,
      }
    )
  }
}