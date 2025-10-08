import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard  } from "swiper/modules";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

interface ProjectProps {
  images: Image[];
}

export const SwiperComp: React.FC<ProjectProps> = ({ images }) => {
  return (
    <div className="relative">
      <Swiper
        slidesPerView={1}
        loop
        effect="fade"
        modules={[Navigation, Keyboard]}
        navigation={{ nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }}
         keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        observer={true}
        observeParents={true}
        className="w-full"
      >
        {images.map((file, index) => (
          <SwiperSlide key={index}>
            <div className="w-fit h-full flex flex-col gap-2 mx-auto">
              <img
                src={file.url}
                alt={file.photographer}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              {file.photographer && (
                <p className="text-white text-sm py-1">{file.photographer}</p>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button type="button" className="swiper-button-prev" aria-label="Prev">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 6 L9 12 L15 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button type="button" className="swiper-button-next" aria-label="Next">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 6 L15 12 L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};
