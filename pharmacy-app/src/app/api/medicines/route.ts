import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url)

    const query =
      searchParams
        .get("query")
        ?.trim()

    if (!query) {
      return NextResponse.json([])
    }

    const medicines =
      await prisma.medicines.findMany({
        where: {
          name: {
            startsWith: query,

            mode:
              "insensitive",
          },
        },

        take: 20,
      })

    const safeMedicines =
      medicines.map((medicine) => ({
        ...medicine,

        prisma_id:
          medicine.prisma_id.toString(),
      }))

    return NextResponse.json(
      safeMedicines
    )
  } catch (error: any) {
    console.log(
      "MEDICINE SEARCH ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Medicine search failed",

        details:
          error?.message ||
          "Unknown error",
      },

      {
        status: 500,
      }
    )
  }
}