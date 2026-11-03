import { redirect } from "next/navigation";

// /produits renvoie vers la boutique, qui liste tous les produits.
export default function ProductsIndex() {
  redirect("/boutique");
}
