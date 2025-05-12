"use server";

import { signIn, signOut } from "./auth";

export async function updateGuest() {
  console.log("server action");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
