import { revalidatePath } from "next/cache";

/** Bust cached homepage news after admin changes. */
export function revalidatePublicNews() {
  revalidatePath("/");
  revalidatePath("/api/public/news");
}
