
// @/app/api/settings/route.ts

/**
 * # API Route for Settings
 *
 * ## Purpose
 * This API route is responsible for managing the application settings.
 * It is used by the settings page to fetch and update the pricing configuration.
 *
 * ## Endpoints
 * - `GET`: Fetches the current pricing settings from the database.
 * - `POST`: Updates the pricing settings in the database.
 *
 * ## Logic
 * - The `GET` handler retrieves the pricing settings from the `settings` table in the database.
 * - The `POST` handler saves the updated pricing settings to the `settings` table.
 */

import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

/**
 * @function GET
 * @description Handles GET requests to the /api/settings endpoint.
 * It fetches the current pricing settings from the database.
 * @returns {NextResponse} A JSON response containing the pricing settings.
 */
export async function GET() {
  try {
    const db = await openDb();
    const result = await db.get("SELECT value FROM settings WHERE key = ?", "pricing");
    if (!result) {
      return NextResponse.json({});
    }
    return NextResponse.json(JSON.parse(result.value));
  } catch (error) {
    console.error("Error fetching settings:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * @function POST
 * @description Handles POST requests to the /api/settings endpoint.
 * It saves the updated pricing settings to the database.
 * @param {Request} request - The incoming request object.
 * @returns {NextResponse} A response with a 204 status code.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await openDb();
    await db.run(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
      "pricing",
      JSON.stringify(data)
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error updating settings:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
