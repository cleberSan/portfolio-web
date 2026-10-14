import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site-url";
import { buildRobots } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(siteUrl);
}
