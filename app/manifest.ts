import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daranga Villas | Luxury Private Villas in Udaipur",
    short_name: "Daranga Villas",
    description:
      "Exclusive private luxury villa sanctuaries in Udaipur featuring private pool residences, butler service, and tailored group getaways.",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFBF9",
    theme_color: "#202020",
    icons: [
      {
        src: "/brand/daranga-icon-mark.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/daranga-icon-mark.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
