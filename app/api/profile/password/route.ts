import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";
import { resetPasswordSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({message:"Invalid request origin."},{status:403});
  const { supabase,user } = await getApiContext();
  if (!user) return NextResponse.json({message:"Sign in to change your password."},{status:401});
  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({message:parsed.error.issues[0].message},{status:400});
  // The authenticated session updates only its own Supabase Auth password.
  const { error } = await supabase.auth.updateUser({password:parsed.data.password});
  if (error) return NextResponse.json({message:error.code === "reauthentication_needed" ? "Please sign in again before changing your password." : error.message},{status:400});
  return NextResponse.json({message:"Your password has been updated."},{headers:{"Cache-Control":"private, no-store"}});
}
