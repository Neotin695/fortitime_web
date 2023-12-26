import { ImageResponse } from "next/og";
import fetcher from "@/lib/fetcher";
import { DefaultResponse, Setting } from "@/types/global";
import { parseSettings } from "@/utils/parse-settings";
import { cookies } from "next/headers";

export const runtime = "edge";

export const GET = async () => {
  const settings = await fetcher<DefaultResponse<Setting[]>>("v1/rest/settings", {
    cache: "no-cache",
  });
  const theme = cookies().get("theme")?.value;
  const parsedSettings = parseSettings(settings?.data);
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: theme === "dark" ? "#A0A09C" : "#f3f3f3",
          width: "100%",
          height: "100%",
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {parsedSettings?.title}
      </div>
    ),
    {
      width: 1200,
      height: 600,
    }
  );
};
