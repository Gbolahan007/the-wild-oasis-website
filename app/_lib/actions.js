"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

/**
 * Updates the guest profile information (nationality, flag, and national ID)
 */
export async function updateGuest(formData) {
  // Ensure the user is authenticated
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // Extract and parse form data
  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  // Validate National ID format (alphanumeric, 6–12 characters)
  const isValid = /^[a-zA-Z0-9]{6,12}$/.test(nationalID);
  if (!isValid) {
    throw new Error("Please provide a valid National ID");
  }

  const updateData = { nationality, countryFlag, nationalID };

  // Update the guest record
  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId)
    .select();

  if (error) {
    throw new Error("Guest could not be updated");
  }

  // Revalidate profile page cache
  revalidatePath("/account/profile");
}

/**
 * Updates an existing reservation (number of guests and any notes)
 */
export async function updateReservation(formData) {
  // Authenticate the user
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // Extract data from form
  const bookingId = Number(formData.get("id"));
  const numGuests = Number(formData.get("numGuests"));
  const observations = formData.get("observations").slice(0, 1000); // limit to 1000 chars

  // Fetch current user's bookings to verify ownership
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  // Ensure the booking being updated belongs to the current user
  if (!guestBookingIds.includes(bookingId)) {
    throw new Error("You are not allowed to edit this booking");
  }

  const updatedData = { numGuests, observations };

  // Update the booking in the database
  const { error } = await supabase
    .from("bookings")
    .update(updatedData)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    throw new Error("Booking could not be updated");
  }

  // Revalidate and redirect to reservation page
  revalidatePath("/account/reservation");
  redirect("/account/reservation");
}

/**
 * Deletes a reservation if it belongs to the logged-in user
 */
export async function deleteReservation(bookingId) {
  // Authenticate the user
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // Fetch the user's bookings
  const geustBookings = await getBookings(session.user.guestId);
  const guestBookingIds = geustBookings.map((booking) => booking.id);

  // Ensure the booking belongs to the current user
  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");

  // Delete the booking
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }

  // Revalidate reservation page cache
  revalidatePath("/account/reservation");
}

/**
 * Sign in the user using Google provider
 */
export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

/**
 * Sign out the current user
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
