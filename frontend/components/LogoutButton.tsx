"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/quantum/supabase";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-slate-400 hover:text-white transition"
    >
      Logout
    </button>
  );
}