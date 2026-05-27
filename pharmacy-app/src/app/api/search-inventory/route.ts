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

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url)

    const query =
      searchParams.get("query") || ""

    if (!query) {
      return NextResponse.json([])
    }

    const inventory =
      await prisma.inventory.findMany({
        where: {
          medicine_name: {
            contains: query,
            mode:
              "insensitive",
          },
        },

        take: 10,
      })

    return NextResponse.json(
      serializeBigInt(
        inventory
      )
    )
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      {
        error:
          "Failed to search inventory",
      },
      {
        status: 500,
      }
    )
  }
}