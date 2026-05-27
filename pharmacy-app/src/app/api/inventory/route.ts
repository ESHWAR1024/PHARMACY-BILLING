import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function serializeBigInt(data: any) {
  return JSON.parse(
    JSON.stringify(
      data,
      (_, value) =>
        typeof value ===
        "bigint"
          ? value.toString()
          : value
    )
  )
}

export async function GET() {
  try {
    const inventory =
      await prisma.inventory.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })

    return NextResponse.json(
      serializeBigInt(
        inventory
      )
    )
  } catch (error) {
    console.error(
      "INVENTORY FETCH ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to fetch inventory",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  req: Request
) {
  try {
    const body = await req.json()

    const inventory =
      await prisma.inventory.create({
        data: {
          medicine_name:
            body.medicine_name,

          quantity:
            Number(body.quantity),

          batch:
            body.batch,

          expiry:
            new Date(
              body.expiry
            ),

          selling_price:
            Number(
              body.selling_price
            ),

          purchase_price:
            Number(
              body.purchase_price
            ),
        },
      })

    return NextResponse.json(
      serializeBigInt({
        success: true,
        inventory,
      })
    )
  } catch (error) {
    console.error(
      "INVENTORY CREATE ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to add inventory",
      },
      {
        status: 500,
      }
    )
  }
}