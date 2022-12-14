import { NextPageContext } from "next";
import Head from "next/head";
import Image from "next/image";

type Image = {
  slug: string;
  img_url: string;
  id: string;
  uploaded_at: string;
  uploaded_by: string;
};

function ImageRoute({
  image,
  embed_title,
  embed_site_name,
  embed_site_url,
  embed_author_name,
  embed_desc,
  embed_colour,
  custom_css,
}: {
  image: Image;
  embed_title: string;
  embed_site_name: string;
  embed_site_url: string;
  embed_colour: string;
  embed_author_name: string;
  embed_desc: string;
  custom_css: string;
}) {
  return (
    <>
      <Head>
        <title>Disco.pics</title>

        {/* Image when sharing */}
        {image.img_url.endsWith(".mp4") ||
        image.img_url.endsWith(".webm") ||
        image.img_url.endsWith(".mov") ? (
          <>
            <meta property="og:type" content="video.other" />
            <meta property="og:video:type" content="video/mp4" />
            <meta property="og:video" content={image.img_url} />
            <meta property="og:video:url" content={image.img_url} />
            <meta property="og:video:secure_url" content={image.img_url} />
            <meta property="og:video:width" content="1280" />
            <meta property="og:video:height" content="720" />
          </>
        ) : (
          <meta property="og:image" content={image.img_url} key="og:image" />
        )}

        {/* Share embeds */}
        <meta
          property="og:description"
          content={embed_desc || ""}
          key="og:description"
        />
        <meta property="og:title" content={embed_title || ""} key="og:title" />

        {/* Site name */}
        <meta
          property="og:site_name"
          content={embed_site_name || ""}
          key="og:site_name"
        />

        <meta property="og:url" content={embed_site_url || ""} key="og:url" />
        {/* Colour */}
        <meta
          property="theme-color"
          content={`#${embed_colour}` || "#000000"}
          key="theme-color"
        />
        {/* Author name, URL */}
        <meta
          property="article:author"
          content={embed_author_name || ""}
          key="article:author"
        />

        {/* Twitter */}
        <meta
          property="twitter:description"
          content={embed_desc || ""}
          key="twitter:description"
        />
        <meta
          property="twitter:title"
          content={embed_title || "Disco.pics"}
          key="twitter:title"
        />
        <meta
          property="twitter:image"
          content={image.img_url}
          key="twitter:image"
        />
        <meta
          property="twitter:card"
          content="summary_large_image"
          key="twitter:card"
        />
      </Head>

      {/* Style */}
      {custom_css && (
        // @ts-ignore
        <style jsx global>{`
          ${custom_css}
        `}</style>
      )}

      <div
        className={`main-container ${
          !custom_css && "bg-black"
        } min-h-screen pt-5`}
      >
        {image && (
          <>
            <div className="flex items-center justify-center w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.img_url.replace(
                  "cdn.discordapp.com",
                  "media.discordapp.net"
                )}
                className="file md:h-96"
                alt={image.slug}
              />
            </div>
          </>
        )}

        <div className="flex flex-col items-center justify-center h-full gap-2 mt-5">
          <a
            className="px-3 py-2 text-white border-2 border-blue-300 cursor-pointer downloadbtn hover:bg-blue-500"
            href={image.img_url}
            rel="noopener noreferrer"
            target="_blank"
          >
            Download image {image.slug}
          </a>

          <a className="bottom-text text-slate-300" href="https://disco.pics">
            Disco.pics - Image hosting
          </a>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const { slug } = context.query;

  const url = "https://app.disco.pics";

  // Get the hostname
  const hostname =
    process.env.NODE_ENV == "development"
      ? "disco.pics"
      : context?.req?.headers.host;

  if (!hostname) {
    return {
      notFound: true,
    };
  }

  const getImage = async () => {
    const imgUrl = await fetch(
      `${url}/api/getImage?slug=${slug}&host=${hostname}`
    );
    if (imgUrl.status === 200) {
      return imgUrl.json();
    }
    return null;
  };
  const image = await getImage();

  if (image === null) {
    // Redirect to 404
    context.res?.writeHead(302, { Location: "/404" });
    context.res?.end();

    return { props: { image: null } };
  }

  const getUser = async () => {
    const user = await fetch(
      `${url}/api/user?id=${image.uploaded_by}&key=${process.env.GET_KEY}&images=false`
    );
    if (user.status === 200) {
      const json = await user.json();
      return json.data.user;
    }
    return null;
  };
  const userJSON = await getUser();

  return {
    props: {
      image,
      embed_title: userJSON["embed_title"] || "",
      embed_site_name: userJSON["embed_site_name"] || "",
      embed_site_url: userJSON["embed_site_url"] || "",
      embed_author_name: userJSON["embed_author_name"] || "",
      embed_desc: userJSON["embed_desc"] || "",
      embed_colour: userJSON["embed_colour"] || "",
      custom_css: userJSON["custom_css"] || "",
    },
  };
}

export default ImageRoute;
