import { useState, useEffect, useRef } from "react"

export const LandingPage: React.FC = () => {

    const videoRef = useRef<HTMLVideoElement>(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [isTablet, setIsTablet] = useState(window.innerWidth > 767 && window.innerWidth < 1025)

      useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth > 767 && window.innerWidth < 1025)
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, isTablet]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;

      video.play().catch((err) => {
        console.warn("autoplay failed", err)
      })
    }
  }, [])

  return (
  <section className="bg-black animate-fadeIn">
      <video
      ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{pointerEvents: "none", userSelect: "none"}}
        className="fixed top-1/2 left-1/2 w-screen h-screen object-cover transform -translate-x-1/2 -translate-y-1/2 animate-fadeIn"
      >
        <source src={isTablet ? "https://res.cloudinary.com/dctpyfz60/video/upload/v1752573282/grund-2023-josefine-ostlund-mobile_rnd8cj.mp4" : isMobile? "https://res.cloudinary.com/dctpyfz60/video/upload/v1752581841/grund-2023-josefine-ostlund-mobile_lrllyl.mp4" : "https://res.cloudinary.com/dctpyfz60/video/upload/v1752575885/josefine-ostlund-grund-2023-wide_zko61q.mp4"} type="video/mp4" />
      </video>
     <img src="/Josefine-ostlund-w-50.svg" alt="josefine östlund" className="absolute z-20 bottom-25 tablet:bottom-2 right-1 max-w-[98%] laptop:max-w-[40%] laptop:bottom-5 laptop:right-5"/>
    </section>
  )
}
