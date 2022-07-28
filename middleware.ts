import {NextRequest, NextResponse} from "next/server";

import videos from "./videos.json";

// Match only the index path
export const config = {
  matcher: "/",
};

export default function middleware(req: NextRequest) {
  // Get already played videos
  let playedVideos = req.cookies.get("video")?.split(",")! || [];

  // If we already played all videos, reset the list and the cookie
  if (playedVideos.length === videos.length - 1) {
    playedVideos = [];

    req.cookies.set("video", playedVideos.join(","));
  }

  // Get a random video from the remaining videos
  const video = videos
    .filter((video) => !playedVideos.includes(video.id))
    .sort(() => (Math.random() >= 0.5 ? 1 : -1))[0];

  // Update the url to be the video to play
  req.nextUrl.pathname = `/${video.id}`;

  // Get a response
  const res = NextResponse.rewrite(req.nextUrl);

  // Return the response
  return res;
}
