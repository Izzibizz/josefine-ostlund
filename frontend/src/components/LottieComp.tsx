
import Lottie from "react-lottie-player";

interface Props {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

export default function LottieComp({ animationData, loop = true, autoplay = true, style }: Props) {
  return (
    <Lottie
      play={autoplay}
      loop={loop}
      animationData={animationData}
      style={style}
    />
  );
}
