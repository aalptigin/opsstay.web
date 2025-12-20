// app/panel/page.tsx
import { redirect } from "next/navigation";

export default function PanelIndexPage() {
  // /panel adresine gelindiğinde otomatik sorgu ekranına at
  redirect("/panel/sorgu");
}
