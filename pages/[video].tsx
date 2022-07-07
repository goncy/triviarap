import type {Video} from "../types";

import {FC, useEffect, useState} from "react";
import {GetStaticPaths, GetStaticProps} from "next";
import Cookies from "js-cookie";

import videos from "../videos.json";

interface Props {
  video: Video;
}

export const getStaticProps: GetStaticProps<Props, {video: string}> = async ({params}) => {
  const video = videos.find(({id}) => id === params?.video);

  if (!video) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      video,
    },
  };
};

export const getStaticPaths: GetStaticPaths<{video: string}> = async () => {
  return {
    paths: videos.map((video) => ({
      params: {video: video.id},
    })),
    fallback: "blocking",
  };
};

const VideoPage: FC<Props> = ({video}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [status, setStatus] = useState<"init" | "playing" | "finished">("init");
  const [answer, setAnswer] = useState<string | null>(null);

  function handleAnswer(answer: string) {
    if (status !== "playing") return;

    const cookie = (Cookies.get("video") || "").split(",");

    setAnswer(answer);
    setStatus("finished");

    Cookies.set("video", cookie.filter(Boolean).concat(video.id).join(","));
  }

  useEffect(() => {
    const options = videos
      .filter(({id}) => id !== video.id)
      .sort(() => (Math.random() >= 0.5 ? 1 : -1))
      .slice(0, 3)
      .concat(video)
      .sort(() => (Math.random() >= 0.5 ? 1 : -1))
      .map(({title}) => title);

    setOptions(options);
  }, [video]);

  return (
    <div>
      {status === "init" && (
        <button style={{display: "block", margin: "auto"}} onClick={() => setStatus("playing")}>
          Jugar
        </button>
      )}
      {["playing", "finished"].includes(status) && (
        <>
          <section
            style={status === "playing" ? {filter: "blur(40px)", pointerEvents: "none"} : {}}
          >
            <iframe
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              frameBorder="0"
              height="315"
              src={`https://www.youtube.com/embed/${video.id}?&autoplay=1`}
              title="YouTube video player"
              width="100%"
            />
          </section>
          <section
            style={{
              marginTop: 64,
              margin: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            {options.map((option) => (
              <button
                key={option}
                style={{
                  color: "white",
                  backgroundColor:
                    status === "finished"
                      ? option === video.title
                        ? "green"
                        : option === answer
                        ? "red"
                        : "#333"
                      : "#333",
                }}
                onClick={() => handleAnswer(option)}
              >
                {option}
              </button>
            ))}
          </section>
          {status === "finished" && (
            <button
              style={{margin: "32px auto auto auto", display: "block"}}
              onClick={() => window.location.reload()}
            >
              Jugar otra vez
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default VideoPage;
