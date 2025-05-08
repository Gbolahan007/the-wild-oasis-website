import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const [cabin, bookedDates] = await Promise.all([
      getCabin(id),
      getBookedDatesByCabinId(id),
    ]);
    return Response.json({ test: cabin, bookedDates });
  } catch {
    return Response.json({ message: "Cabin not found" });
  }
}
