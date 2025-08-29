
// @/app/api/profits/route.ts

/**
 * # API Route for Profits
 *
 * ## Purpose
 * This API route is responsible for calculating and returning profit-related statistics.
 * It is used by the profits dashboard to display key performance indicators.
 *
 * ## Endpoints
 * - `GET`: Calculates and returns the total revenue, total members, average revenue per member, and monthly revenue data.
 *
 * ## Logic
 * - The `GET` handler fetches pricing settings and member data from the database.
 * - It then calculates the required statistics and returns them as a JSON response.
 */

import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

/**
 * @type Member
 * @description Defines the structure for a member's data used in profit calculations.
 * @property {string} id - The unique identifier for the member.
 * @property {string} subscriptionType - The type of subscription the member has.
 * @property {Date} startDate - The start date of the subscription.
 */
type Member = {
  id: string;
  subscriptionType: string;
  startDate: Date;
};

/**
 * @type Pricing
 * @description Defines the structure for the pricing settings.
 */
type Pricing = {
  [key: string]: number;
};

/**
 * @function formatSubscriptionTypeToKey
 * @description Formats a subscription type string from "Title Case" to "camelCase".
 * @param {string} type - The subscription type string (e.g., "Monthly Fitness").
 * @returns {string} The formatted key (e.g., "monthlyFitness").
 */
const formatSubscriptionTypeToKey = (type: string): string => {
  if (!type || typeof type !== 'string') return '';
  const parts = type.split(' ');
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].toLowerCase();
  return parts[0].toLowerCase() + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
};

/**
 * @function GET
 * @description Handles GET requests to the /api/profits endpoint.
 * It calculates and returns the total revenue, total members, average revenue per member, and monthly revenue data.
 * @returns {NextResponse} A JSON response containing the profit statistics.
 */
export async function GET() {
  try {
    const db = await openDb();
    const pricingResult = await db.get("SELECT value FROM settings WHERE key = ?", "pricing");
    const pricing: Pricing = pricingResult ? JSON.parse(pricingResult.value) : {};

    const membersList: Member[] = await db.all("SELECT subscriptionType, startDate FROM members");

    let totalRevenue = 0;
    const monthlyRevenueData: { [key: string]: number } = {};

    membersList.forEach(member => {
      const subscriptionTypes = member.subscriptionType.split(' & ');
      let memberPrice = 0;

      subscriptionTypes.forEach(type => {
        const priceKey = formatSubscriptionTypeToKey(type.trim());
        memberPrice += pricing[priceKey] || 0;
      });

      totalRevenue += memberPrice;

      if (member.startDate) {
        const startDate = new Date(member.startDate);
        const monthKey = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyRevenueData[monthKey]) {
          monthlyRevenueData[monthKey] = 0;
        }
        monthlyRevenueData[monthKey] += memberPrice;
      }
    });

    const totalMembers = membersList.length;
    const averageRevenuePerMember = totalMembers > 0 ? totalRevenue / totalMembers : 0;
    
    const sortedMonthlyData = Object.entries(monthlyRevenueData)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, total]) => {
          const [year, month] = key.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          // Format to "Month Year" in Arabic
          const name = date.toLocaleString('ar-SA', { month: 'long', year: 'numeric', timeZone: 'UTC' });
          return { name, total };
      });
      
    const stats = {
      totalRevenue,
      totalMembers,
      averageRevenuePerMember,
      monthlyRevenue: sortedMonthlyData,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching profits:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
