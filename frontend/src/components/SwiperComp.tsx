import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from "swiper/modules";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

interface Project  {
 _id?: string;
  name?: string;
  year?: number;
  material?: string;
  exhibited_at?: string;
  category?: string;
  description?: string;
  images?: Image[];
  video?: Image;
}

interface ProjectProps {
  project: Project;
  handlePreviewClick: (image: Image) => void;
  slides: number;
  style: string;
  aspect: string;
thumbnail: boolean;
}

export const SwiperComp:React.FC<ProjectProps> = ({project, handlePreviewClick, slides, style, thumbnail, aspect}) => {

  const getThumbnailUrl = (url: string, width: number, height:number) => {
  return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill/`);
};
  return (
     <Swiper
                  key={project?.name}
                  slidesPerView={slides}
                  spaceBetween={20}
                  speed={1200}
                  loop
                  zoom
                  updateOnWindowResize
                  scrollbar={{ draggable: true }}
                  autoplay={{
                    pauseOnMouseEnter: true,
                    disableOnInteraction: false,
                  }}
                  breakpoints={{
                    320: {
                      spaceBetween: 10,
                    },
                    768: {
                      spaceBetween: 15,
                    },
                    1024: {
                      spaceBetween: 20,
                    },
                    1280: {
                      spaceBetween: 25,
                    },
                  }}
                  effect="fade"
                  modules={[Autoplay]}
                  className="w-full h-auto"
                >
                  {project?.images?.map((file, index) => (
                    <SwiperSlide key={index}>
                      <div className="relative group">
                        <img
                          src={thumbnail === true ? getThumbnailUrl(file.url, 400, 300) : file.url}
                          alt={file.photographer}
                          className={`w-full h-full ${aspect} `}
                        />
                        <div
                          className={`${style} absolute max-w-full max-h-full inset-0 bg-black opacity-40 group-hover:opacity-0 transition-opacity duration-500 ease-in-out hover:cursor-pointer`}
                          onClick={() => handlePreviewClick(file)}
                          onTouchStart={() =>
                            handlePreviewClick(file)
                          }
                        ></div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                
  )
}

