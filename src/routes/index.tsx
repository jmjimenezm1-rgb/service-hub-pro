import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  beforeLoad: () => { throw redirect({ to: "/home" }); },
  head: () => ({
    meta: [
      { title: "Dashboard · ServiceHub SaaS Pay Per Use" },
      {
        name: "description",
        content:
          "Panel de control de ServiceHub: clientes, MRR, ARR, facturación, cobros, consumo por aplicación y alertas.",
      },
      { property: "og:title", content: "Dashboard · ServiceHub" },
      {
        property: "og:description",
        content: "Indicadores en tiempo real del negocio SaaS: MRR, ARR, cobros, consumo y renovaciones.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),

});

